import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, fetchTransaction } from "./transactionApi";

/** transaction TanStack Query 훅 (entities/transaction/api). */
export const transactionKeys = {
  all: ["transaction"] as const,
  list: () => ["transaction", "list"] as const,
  detail: (id: string) => ["transaction", "detail", id] as const,
};

export function useTransactionsQuery() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: () => fetchTransactions(),
  });
}

export function useTransactionQuery(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransaction(id),
    enabled: !!id,
  });
}
