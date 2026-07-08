/**
 * Product 도메인 타입 (entities/product/model).
 */
export type ProductStatus = "active" | "draft" | "out_of_stock";
export type ProductCategory = "electronics" | "fashion" | "home" | "beauty";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: string;
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "판매중",
  draft: "임시저장",
  out_of_stock: "품절",
};

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  electronics: "전자제품",
  fashion: "패션",
  home: "리빙",
  beauty: "뷰티",
};

/** 재고가 이 값 이하이면 "부족" 경고 (도메인 규칙) */
export const LOW_STOCK_THRESHOLD = 10;
