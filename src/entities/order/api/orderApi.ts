import { delay, mockMutation, ApiError } from "@/shared/api";
import { ORDER_SEED } from "../model/mock";
import { nextStatuses, type Order, type OrderStatus } from "../model/types";

/** Order API (entities/order/api). */
let db: Order[] = [...ORDER_SEED];

export async function fetchOrders(status?: OrderStatus | "all"): Promise<Order[]> {
  const result = !status || status === "all" ? db : db.filter((o) => o.status === status);
  return delay(result, 350);
}

export async function fetchOrder(id: string): Promise<Order | undefined> {
  return delay(
    db.find((o) => o.id === id),
    300,
  );
}

/**
 * 주문 상태 변경. 도메인 규칙(전이 그래프)에 어긋나면 ApiError 로 거부한다.
 * => 검증을 entities(도메인) 에 두어, 어느 feature 가 호출하든 규칙이 보장된다.
 */
export async function updateOrderStatus(id: string, to: OrderStatus): Promise<Order> {
  const current = db.find((o) => o.id === id);
  if (!current) throw new ApiError("주문을 찾을 수 없습니다.", 404);
  if (!nextStatuses(current.status).includes(to)) {
    throw new ApiError(`'${current.status}' → '${to}' 전이는 허용되지 않습니다.`, 422);
  }
  const updated: Order = { ...current, status: to };
  const res = await mockMutation(updated, { ms: 500 });
  db = db.map((o) => (o.id === id ? res : o));
  return res;
}

export function __resetOrders() {
  db = [...ORDER_SEED];
}
