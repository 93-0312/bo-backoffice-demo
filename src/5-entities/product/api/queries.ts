import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchProducts } from "./productApi";
import type { ProductListParams } from "./productApi";

/** product TanStack Query 훅 (entities/product/api). */
export const productKeys = {
  all: ["product"] as const,
  list: (params: ProductListParams) => ["product", "list", params] as const,
};

export function useProductsQuery(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });
}
