import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * className 병합 유틸 — 조건부 클래스(clsx) + Tailwind 충돌 해소(twMerge).
 *
 * shared/lib 의 대표적인 "도메인과 무관한 범용 재료"다. 모든 레이어가 가져다 쓴다.
 * 예: cn("px-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
