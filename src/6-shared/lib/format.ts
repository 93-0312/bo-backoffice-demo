/**
 * 포맷터 모음 (shared/lib).
 *
 * 순수 함수만 둔다 — 도메인 지식(User/Order …)을 모른다. 그래서 어느 레이어든 재사용 가능.
 * 도메인 의미가 들어가는 포맷(예: "주문 상태 라벨")은 여기가 아니라 entities 로 간다.
 */

/** 원화 통화 포맷: 1250000 → "₩1,250,000" */
export function formatCurrency(value: number, currency = "KRW"): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** 천단위 구분 숫자: 1250000 → "1,250,000" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

/** 컴팩트 숫자: 1250000 → "125만" 대신 영문 컴팩트 "1.3M" (대시보드 KPI 용) */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

/** ISO 문자열/Date → "2026. 6. 19." */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(d);
}

/** ISO 문자열/Date → "2026. 6. 19. 오후 3:24" */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/** 상대 시간: 방금/N분 전/N시간 전/N일 전. now 주입 가능(테스트 편의). */
export function formatRelativeTime(input: string | Date, now: Date = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diffMs = now.getTime() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return formatDate(d);
}

/** 0~1 비율 → "42%" (Meter/진행률 표시 보조) */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
