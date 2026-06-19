import { delay } from "@/shared/api";
import { PRODUCT_SEED } from "../model/mock";
import type { Product, ProductCategory, ProductStatus } from "../model/types";

/** Product API (entities/product/api). */
const db: Product[] = [...PRODUCT_SEED];

export interface ProductListParams {
  search?: string;
  category?: ProductCategory | "all";
  status?: ProductStatus | "all";
}

export async function fetchProducts(params: ProductListParams = {}): Promise<Product[]> {
  const { search = "", category = "all", status = "all" } = params;
  const q = search.trim().toLowerCase();
  const result = db.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = category === "all" || p.category === category;
    const matchStatus = status === "all" || p.status === status;
    return matchQ && matchCat && matchStatus;
  });
  return delay(result, 350);
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  return delay(
    db.find((p) => p.id === id),
    300,
  );
}
