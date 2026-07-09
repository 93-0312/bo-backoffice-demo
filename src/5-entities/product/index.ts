/** entities/product Public API. */
export type { Product, ProductStatus, ProductCategory } from "./model/types";
export {
  PRODUCT_STATUS_LABEL,
  PRODUCT_CATEGORY_LABEL,
  LOW_STOCK_THRESHOLD,
} from "./model/types";
export {
  fetchProducts,
  fetchProduct,
  type ProductListParams,
} from "./api/productApi";
export { productKeys, useProductsQuery } from "./api/queries";
export { ProductStatusBadge } from "./ui/ProductStatusBadge";
export { StockIndicator } from "./ui/StockIndicator";
