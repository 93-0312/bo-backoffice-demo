import { Badge, type BadgeProps } from "@/shared/ui";
import type { TransactionResult } from "../model/types";

/** 거래 결과 → 킷 Badge color 매핑 (도메인 지식은 entities 에). */
const COLOR: Record<TransactionResult, BadgeProps["color"]> = {
  SUCCESS: "success",
  FAILED: "destructive",
  PENDING: "warning",
};

export function TransactionResultBadge({ result }: { result: TransactionResult }) {
  return (
    <Badge color={COLOR[result]} variant="tinted">
      {result}
    </Badge>
  );
}
