/**
 * Order 도메인 타입 (entities/order/model).
 *
 * 주문 "상태 전이 규칙(state machine)" 도 도메인 지식이라 여기 둔다.
 * features/order-status-update 는 이 규칙을 읽어 "다음 가능한 상태"만 노출한다.
 */
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  /** 주문자(고객) — 데모라 이름만 비정규화해 보관 */
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제대기",
  paid: "결제완료",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

/**
 * 상태 전이 그래프 — 각 상태에서 "이동 가능한 다음 상태" 목록.
 * 예: delivered/cancelled 는 종료 상태(다음 없음).
 */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[status];
}
