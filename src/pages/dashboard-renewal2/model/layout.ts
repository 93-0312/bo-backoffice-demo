/**
 * 벤토 레이아웃 정의 (pages/dashboard-renewal2/model).
 *
 * "어떤 위젯을 어떤 순서로 배치하는가"는 이 화면이 렌더링하는 뷰 데이터라서 model 에 둔다.
 * (config 가 아니다 — config 는 배치를 고르는 정적 knob 용. 배치 배열 자체는 model.)
 *
 * ⚠️ WidgetId/LayoutRow 는 로컬 정의. FSD 에서 page 는 다른 page 를 import 할 수 없어
 *    dashboard-renewal 의 타입을 못 가져온다. 공유하려면 widget/entity 로 내려야 한다.
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

export type Variant = "A" | "B";

/** A/B 배치 정의. page 는 variant 만 고르고, 실제 배열은 여기서 가져간다. */
export const LAYOUTS: Record<Variant, LayoutRow[]> = {
  // A: Figma 기본 프레임 배치
  A: [
    { main: "transactionStatus", side: "target" },
    { main: "topCountries", side: "notice" },
    { main: "paymentsMethods" },
  ],
  // B: 공지를 최상단으로, 거래현황 옆에 TOP5
  B: [
    { main: "notice", side: "target" },
    { main: "transactionStatus", side: "topCountries" },
    { main: "paymentsMethods" },
  ],
};
