import { Badge, type BadgeProps } from "@/shared/ui";
import { PRODUCT_STATUS_LABEL, type ProductStatus } from "../model/types";

/** 상품 상태 → 킷 Badge color 매핑 (도메인 지식은 entities 에). */
const COLOR: Record<ProductStatus, BadgeProps["color"]> = {
  active: "success",
  draft: "neutral",
  out_of_stock: "destructive",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge color={COLOR[status]} variant="tinted">
      {PRODUCT_STATUS_LABEL[status]}
    </Badge>
  );
}
