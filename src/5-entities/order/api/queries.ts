import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchOrders } from "./orderApi";
import type { OrderStatus } from "../model/types";

/** order TanStack Query 훅 (entities/order/api). */
export const orderKeys = {
  all: ["order"] as const,
  list: (status: OrderStatus | "all") => ["order", "list", status] as const,
};

export function useOrdersQuery(status: OrderStatus | "all") {
  return useQuery({
    queryKey: orderKeys.list(status),
    queryFn: () => fetchOrders(status),
    placeholderData: keepPreviousData,
  });
}
