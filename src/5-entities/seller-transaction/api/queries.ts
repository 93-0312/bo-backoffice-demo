import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSellerTransactions, fetchStidsByTid } from "./sellerTransactionApi";
import type { SellerTxListParams } from "./sellerTransactionApi";

/** seller-transaction TanStack Query 훅 (entities/seller-transaction/api). */
export const sellerTransactionKeys = {
  all: ["seller-transaction"] as const,
  list: (params: SellerTxListParams) => ["seller-transaction", "list", params] as const,
  stids: (tid: string) => ["seller-transaction", "stids", tid] as const,
};

export function useSellerTransactionsQuery(params: SellerTxListParams) {
  return useQuery({
    queryKey: sellerTransactionKeys.list(params),
    queryFn: () => fetchSellerTransactions(params),
    placeholderData: keepPreviousData,
  });
}

export function useStidsByTidQuery(tid: string) {
  return useQuery({
    queryKey: sellerTransactionKeys.stids(tid),
    queryFn: () => fetchStidsByTid(tid),
    enabled: !!tid,
  });
}
