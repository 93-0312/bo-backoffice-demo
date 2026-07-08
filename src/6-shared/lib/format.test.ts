import { describe, it, expect, vi } from "vitest";
import {
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatCurrency,
  formatCompact,
  formatDate,
  formatDateTime,
} from "@/shared/lib";

/**
 * shared/lib 순수 유닛 테스트 예시.
 * 도메인·DOM 무관 순수 함수라 가장 쉽고 빠르며, jsdom 도 필요 없다.
 * 테스트도 Public API(@/shared/lib)를 통해 import (프로덕션 import 규칙과 동일).
 */
describe("shared/lib · format", () => {
  it("formatNumber: 천단위 구분", () => {
    expect(formatNumber(1250000)).toBe("1,250,000");
  });

  it("formatPercent: 0~1 비율을 반올림한 %", () => {
    expect(formatPercent(0.4237)).toBe("42%");
    expect(formatPercent(1)).toBe("100%");
  });

  it("formatRelativeTime: now 를 주입하면 결정적", () => {
    const now = new Date("2026-07-08T12:00:00Z");
    expect(formatRelativeTime(new Date("2026-07-08T11:59:30Z"), now)).toBe(
      "방금 전",
    );
    expect(formatRelativeTime(new Date("2026-07-08T11:30:00Z"), now)).toBe(
      "30분 전",
    );
    expect(formatRelativeTime(new Date("2026-07-08T09:00:00Z"), now)).toBe(
      "3시간 전",
    );
    expect(formatRelativeTime(new Date("2026-07-03T09:00:00Z"), now)).toBe(
      "5일 전",
    );
    expect(formatRelativeTime(new Date("2026-07-01T09:00:00Z"), now)).toBe(
      "2026. 7. 1.",
    );
  });

  it("formatCurrency: 통화 인자 유무(기본값 KRW) 양쪽 갈래", () => {
    expect(formatCurrency(1250000)).toContain("1,250,000"); // 기본값 KRW (default 갈래)
    expect(formatCurrency(1000, "USD")).toContain("1,000"); // 인자 전달 (non-default 갈래)
  });

  it("formatCompact: 컴팩트 표기(호출로 커버)", () => {
    expect(formatCompact(1250000)).toMatch(/M$/);
  });

  it("formatDate / formatDateTime: 문자열·Date 입력 양쪽 갈래", () => {
    const d = new Date("2026-06-19T15:24:00Z");
    expect(typeof formatDate("2026-06-19")).toBe("string"); // string 갈래
    expect(typeof formatDate(d)).toBe("string"); // Date 갈래
    expect(typeof formatDateTime("2026-06-19T15:24:00Z")).toBe("string"); // string 갈래
    expect(typeof formatDateTime(d)).toBe("string"); // Date 갈래
  });

  it("formatRelativeTime: input 이 문자열인 갈래", () => {
    const now = new Date("2026-07-08T12:00:00Z");
    expect(formatRelativeTime("2026-07-08T11:30:00Z", now)).toBe("30분 전");
  });

  it("formatRelativeTime: now 미주입(기본값 new Date) 갈래", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T12:00:00Z"));
    expect(formatRelativeTime(new Date("2026-07-08T11:59:30Z"))).toBe("방금 전");
    vi.useRealTimers();
  });
});
