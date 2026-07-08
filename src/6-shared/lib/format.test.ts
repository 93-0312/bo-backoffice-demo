import { describe, it, expect } from "vitest";
import { formatNumber, formatPercent, formatRelativeTime } from "@/shared/lib";

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
    expect(formatRelativeTime(new Date("2026-07-08T11:59:30Z"), now)).toBe("방금 전");
    expect(formatRelativeTime(new Date("2026-07-08T11:30:00Z"), now)).toBe("30분 전");
    expect(formatRelativeTime(new Date("2026-07-08T09:00:00Z"), now)).toBe("3시간 전");
  });
});
