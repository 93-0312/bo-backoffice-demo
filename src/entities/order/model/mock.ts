import type { Order } from "./types";

/** Order 목업 시드 (entities/order/model). */
export const ORDER_SEED: Order[] = [
  { id: "ORD-20260619-014", customerName: "김하늘", itemCount: 3, total: 512000, status: "pending", createdAt: "2026-06-19T08:20:00+09:00" },
  { id: "ORD-20260619-013", customerName: "이도현", itemCount: 1, total: 289000, status: "paid", createdAt: "2026-06-19T07:55:00+09:00" },
  { id: "ORD-20260618-031", customerName: "박서연", itemCount: 5, total: 134000, status: "shipped", createdAt: "2026-06-18T21:10:00+09:00" },
  { id: "ORD-20260618-028", customerName: "정우진", itemCount: 2, total: 198000, status: "delivered", createdAt: "2026-06-18T15:42:00+09:00" },
  { id: "ORD-20260617-009", customerName: "최민지", itemCount: 1, total: 64000, status: "cancelled", createdAt: "2026-06-17T11:05:00+09:00" },
  { id: "ORD-20260617-004", customerName: "한지호", itemCount: 4, total: 376000, status: "delivered", createdAt: "2026-06-17T09:30:00+09:00" },
  { id: "ORD-20260616-022", customerName: "김하늘", itemCount: 2, total: 88000, status: "paid", createdAt: "2026-06-16T18:12:00+09:00" },
];
