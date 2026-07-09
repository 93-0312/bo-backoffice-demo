import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPgTransactions, fetchPgTransactionDetail } from "./pgTransactionApi";
import type { PgTransactionListParams } from "../model/types";

/**
 * pg-transaction TanStack Query 훅 (entities/pg-transaction/api).
 *
 * 원시 fetch(위 pgTransactionApi)는 그대로 두고, 캐싱·로딩·재조회를 관리하는
 * useQuery 래퍼만 제공한다. page 는 이 훅을 호출해 상태를 직접 관리하지 않는다.
 */
export const pgTransactionKeys = {
  all: ["pg-transaction"] as const,
  list: (params: PgTransactionListParams) => ["pg-transaction", "list", params] as const,
  detail: (tid: string) => ["pg-transaction", "detail", tid] as const,
};

/** 거래내역 목록 — 파라미터가 바뀌면 자동 재조회, 이전 데이터는 유지(깜빡임 방지). */
export function usePgTransactionsQuery(params: PgTransactionListParams) {
  return useQuery({
    queryKey: pgTransactionKeys.list(params),
    queryFn: () => fetchPgTransactions(params),
    placeholderData: keepPreviousData,
  });
}

/** 거래 상세 — tid 가 있을 때만 조회. */
export function usePgTransactionDetailQuery(tid: string) {
  return useQuery({
    queryKey: pgTransactionKeys.detail(tid),
    queryFn: () => fetchPgTransactionDetail(tid),
    enabled: !!tid,
  });
}
