/**
 * 벤토 레이아웃 정의 (pages/dashboard-renewal/model).
 *
 * 화면 배치는 도메인 데이터가 아니라 이 페이지의 관심사다.
 * 행 배열을 재배치하면 Figma "Layout Variation" A/B 케이스를 그대로 재현한다.
 */
export type WidgetId =
  | "transactionStatus"
  | "target"
  | "topCountries"
  | "notice"
  | "paymentsMethods";

/** 한 행: main = 유동 폭, side = 우측 고정 레일(424px) */
export interface LayoutRow {
  main: WidgetId;
  side?: WidgetId;
}

/** Figma 기본 프레임(Section-1/2/3) 배치 */
export const DEFAULT_LAYOUT: LayoutRow[] = [
  { main: "transactionStatus", side: "target" },
  { main: "topCountries", side: "notice" },
  { main: "paymentsMethods" },
];
