import { Badge, type BadgeProps } from "@/shared/ui";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../model/types";

/**
 * 주문 상태 → 킷 Badge color/variant 매핑.
 * shipped 는 fill 로 채워 paid(info tinted)와 시각적으로 구분한다.
 */
const STYLE: Record<OrderStatus, { color: BadgeProps["color"]; variant: BadgeProps["variant"] }> = {
  pending: { color: "warning", variant: "tinted" },
  paid: { color: "info", variant: "tinted" },
  shipped: { color: "info", variant: "fill" },
  delivered: { color: "success", variant: "tinted" },
  cancelled: { color: "neutral", variant: "tinted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { color, variant } = STYLE[status];
  return (
    <Badge color={color} variant={variant}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
