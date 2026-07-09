import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSettlements } from "./settlementApi";
import type { SettlementListParams } from "./settlementApi";

/** settlement TanStack Query 훅 (entities/settlement/api). */
export const settlementKeys = {
  all: ["settlement"] as const,
  list: (params: SettlementListParams) => ["settlement", "list", params] as const,
};

export function useSettlementsQuery(params: SettlementListParams) {
  return useQuery({
    queryKey: settlementKeys.list(params),
    queryFn: () => fetchSettlements(params),
    placeholderData: keepPreviousData,
  });
}
