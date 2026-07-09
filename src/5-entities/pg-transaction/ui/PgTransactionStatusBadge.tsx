import { Badge, type BadgeProps } from "@/shared/ui";
import type { PgTransactionStatus } from "../model/types";

/** 거래 상태 → 킷 Badge color 매핑 (도메인 지식은 entities 에). */
const COLOR: Record<string, BadgeProps["color"]> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "destructive",
  DECLINE: "destructive",
  CANCELLED: "neutral",
  REVERSAL: "neutral",
};

export function PgTransactionStatusBadge({ status }: { status: PgTransactionStatus }) {
  return (
    <Badge color={COLOR[status] ?? "neutral"} variant="tinted">
      {status}
    </Badge>
  );
}
