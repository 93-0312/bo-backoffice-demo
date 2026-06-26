import { Badge, type BadgeProps } from "@/shared/ui";
import {
  SELLER_TX_TYPE_LABEL,
  SELLER_TX_STATE_LABEL,
  type SellerTxType,
  type SellerTxState,
} from "../model/types";

const TYPE_COLOR: Record<SellerTxType, BadgeProps["color"]> = {
  SALE: "info",
  REFUND: "warning",
};
const STATE_COLOR: Record<SellerTxState, BadgeProps["color"]> = {
  SUCCESS: "success",
  DECLINE: "destructive",
  PENDING: "neutral",
};

/** 거래 유형(승인/환불) 배지. */
export function SellerTxTypeBadge({ type }: { type: SellerTxType }) {
  return (
    <Badge color={TYPE_COLOR[type]} variant="tinted">
      {SELLER_TX_TYPE_LABEL[type]}
    </Badge>
  );
}

/** 거래 상태(성공/거절) 배지. */
export function SellerTxStateBadge({ state }: { state: SellerTxState }) {
  return (
    <Badge color={STATE_COLOR[state]} variant="tinted">
      {SELLER_TX_STATE_LABEL[state]}
    </Badge>
  );
}
