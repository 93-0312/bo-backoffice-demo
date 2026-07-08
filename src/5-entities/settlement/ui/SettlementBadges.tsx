import { Badge, type BadgeProps } from "@/shared/ui";
import {
  MERCHANT_STATUS_LABEL,
  SETTLEMENT_STATE_LABEL,
  type MerchantStatus,
  type SettlementState,
} from "../model/types";

const MERCHANT_COLOR: Record<MerchantStatus, BadgeProps["color"]> = {
  LIVE: "success",
  TEST: "info",
  TERMINATE: "neutral",
  SUSPEND: "destructive",
};
const STATE_COLOR: Record<SettlementState, BadgeProps["color"]> = {
  paid: "success",
  pending: "warning",
  hold: "destructive",
};

/** 가맹점 상태(LIVE/TEST/해지/정지) 배지. */
export function MerchantStatusBadge({ status }: { status: MerchantStatus }) {
  return (
    <Badge color={MERCHANT_COLOR[status]} variant="tinted">
      {MERCHANT_STATUS_LABEL[status]}
    </Badge>
  );
}

/** 정산 상태(지급 완료/대기/보류) 배지. */
export function SettlementStateBadge({ state }: { state: SettlementState }) {
  return (
    <Badge color={STATE_COLOR[state]} variant="tinted">
      {SETTLEMENT_STATE_LABEL[state]}
    </Badge>
  );
}
