import { createElement, type ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  useFilters,
  serializeFilters,
  parseFilters,
  clearFilterMemory,
  type FilterValues,
  type DateRangeValue,
} from "@/widgets/filter-bar";

/**
 * useFilters 의 URL 직렬화 규칙 테스트 — 순수 함수(serialize/parse)만 검증.
 * (훅 자체의 URL 반영·디바운스는 브라우저 E2E 로 확인)
 */
const DEFAULTS: FilterValues = {
  search: "",
  status: "",
  excludeTest: false,
  period: { from: null, to: null } as DateRangeValue,
};

describe("widgets/filter-bar · serializeFilters", () => {
  it("기본값과 같은 키는 URL 에서 생략한다", () => {
    expect(serializeFilters({ ...DEFAULTS }, DEFAULTS)).toEqual({});
  });

  it("문자열·boolean·기간을 각각 규칙대로 편다", () => {
    const values: FilterValues = {
      search: "hong",
      status: "SUCCESS",
      excludeTest: true,
      period: { from: "2026-07-01", to: "2026-07-09" },
    };
    expect(serializeFilters(values, DEFAULTS)).toEqual({
      search: "hong",
      status: "SUCCESS",
      excludeTest: "1",
      "period.from": "2026-07-01",
      "period.to": "2026-07-09",
    });
  });

  it("기간의 한쪽만 있어도 그 쪽만 내보낸다", () => {
    const values = { ...DEFAULTS, period: { from: "2026-07-01", to: null } };
    expect(serializeFilters(values, DEFAULTS)).toEqual({ "period.from": "2026-07-01" });
  });
});

describe("widgets/filter-bar · parseFilters", () => {
  it("URL 에 없는 키는 기본값을 유지한다", () => {
    expect(parseFilters(new URLSearchParams(), DEFAULTS)).toEqual(DEFAULTS);
  });

  it("직렬화 → 파싱 라운드트립이 값을 보존한다", () => {
    const values: FilterValues = {
      search: "커피",
      status: "FAILED",
      excludeTest: true,
      period: { from: "2026-07-01", to: "2026-07-09" },
    };
    const params = new URLSearchParams(serializeFilters(values, DEFAULTS));
    expect(parseFilters(params, DEFAULTS)).toEqual(values);
  });

  it("boolean 은 '1'/'true' 를 참으로 읽는다", () => {
    expect(parseFilters(new URLSearchParams("excludeTest=1"), DEFAULTS).excludeTest).toBe(true);
    expect(parseFilters(new URLSearchParams("excludeTest=true"), DEFAULTS).excludeTest).toBe(true);
    expect(parseFilters(new URLSearchParams("excludeTest=0"), DEFAULTS).excludeTest).toBe(false);
  });

  it("정의되지 않은(외부) 파라미터는 무시한다", () => {
    const params = new URLSearchParams("reason=session-expired&search=abc");
    const parsed = parseFilters(params, DEFAULTS);
    expect(parsed.search).toBe("abc");
    expect("reason" in parsed).toBe(false);
  });
});

/**
 * persist:"storage" — 새로고침(리마운트) 유지를 훅 레벨로 검증.
 * useSearchParams 를 무조건 호출하므로 MemoryRouter 로 감싼다.
 */
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(MemoryRouter, null, children);

const STORAGE_DEFAULTS = { search: "", status: "" };
const STORE_KEY = "bo-filters:test-menu";

describe("widgets/filter-bar · useFilters persist:'storage'", () => {
  beforeEach(() => localStorage.clear());

  it("값 변경이 localStorage 에 저장되고, 리마운트(새로고침) 시 복원된다", () => {
    const first = renderHook(
      () =>
        useFilters({
          defaults: STORAGE_DEFAULTS,
          persist: "storage",
          storageKey: "test-menu",
        }),
      { wrapper },
    );
    act(() => first.result.current.setValue("status", "SUCCESS"));
    expect(JSON.parse(localStorage.getItem(STORE_KEY)!)).toEqual({ status: "SUCCESS" });
    first.unmount();

    // 새로고침 시뮬레이션 — 새 마운트가 저장값을 읽어온다.
    const second = renderHook(
      () =>
        useFilters({
          defaults: STORAGE_DEFAULTS,
          persist: "storage",
          storageKey: "test-menu",
        }),
      { wrapper },
    );
    expect(second.result.current.values.status).toBe("SUCCESS");
  });

  it("reset 하면 저장 키 자체가 지워진다(전부 기본값)", () => {
    const { result } = renderHook(
      () =>
        useFilters({
          defaults: STORAGE_DEFAULTS,
          persist: "storage",
          storageKey: "test-menu",
        }),
      { wrapper },
    );
    act(() => result.current.setValue("search", "abc"));
    expect(localStorage.getItem(STORE_KEY)).not.toBeNull();
    act(() => result.current.reset());
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });

  it("persist:'none' 은 아무것도 저장하지 않는다(새로고침 시 초기화)", () => {
    const { result } = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "none", storageKey: "test-menu" }),
      { wrapper },
    );
    act(() => result.current.setValue("search", "abc"));
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });
});

/**
 * persist:"memory" — 라우트 이동(언마운트→리마운트) 시 복원을 훅 레벨로 검증.
 * 모듈 Map 저장소라 새로고침 시뮬레이션은 clearFilterMemory 로 대신한다.
 */
describe("widgets/filter-bar · useFilters persist:'memory'", () => {
  beforeEach(() => clearFilterMemory());

  it("메뉴 이탈 후 재방문(리마운트) 시 값이 복원된다", () => {
    const first = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "memory", storageKey: "test-menu" }),
      { wrapper },
    );
    act(() => first.result.current.setValue("status", "SUCCESS"));
    first.unmount();

    // 다른 메뉴 갔다가 돌아온 상황 — 새 마운트가 메모리 저장값을 읽어온다.
    const second = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "memory", storageKey: "test-menu" }),
      { wrapper },
    );
    expect(second.result.current.values.status).toBe("SUCCESS");
  });

  it("새로고침(메모리 소멸) 후에는 defaults 로 초기화된다", () => {
    const first = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "memory", storageKey: "test-menu" }),
      { wrapper },
    );
    act(() => first.result.current.setValue("status", "SUCCESS"));
    first.unmount();

    clearFilterMemory(); // 새로고침 시뮬레이션 — 모듈 메모리가 사라진다.
    const second = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "memory", storageKey: "test-menu" }),
      { wrapper },
    );
    expect(second.result.current.values.status).toBe("");
  });

  it("localStorage 에는 아무것도 남기지 않는다", () => {
    const { result } = renderHook(
      () => useFilters({ defaults: STORAGE_DEFAULTS, persist: "memory", storageKey: "test-menu" }),
      { wrapper },
    );
    act(() => result.current.setValue("search", "abc"));
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });
});
