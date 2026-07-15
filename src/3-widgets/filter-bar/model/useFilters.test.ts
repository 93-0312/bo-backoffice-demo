import { describe, it, expect } from "vitest";
import {
  serializeFilters,
  parseFilters,
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
