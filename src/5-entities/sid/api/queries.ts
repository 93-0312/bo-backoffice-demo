import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSids } from "./sidApi";
import type { SidListParams } from "./sidApi";

/** sid TanStack Query 훅 (entities/sid/api). */
export const sidKeys = {
  all: ["sid"] as const,
  list: (params: SidListParams) => ["sid", "list", params] as const,
};

export function useSidsQuery(params: SidListParams) {
  return useQuery({
    queryKey: sidKeys.list(params),
    queryFn: () => fetchSids(params),
    placeholderData: keepPreviousData,
  });
}
