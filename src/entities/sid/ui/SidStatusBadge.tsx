import { Badge, type BadgeProps } from "@/shared/ui";
import { SID_STATUS_LABEL, type SidStatus } from "../model/types";

/** SID 진행 상태 → 킷 Badge color 매핑. */
const COLOR: Record<SidStatus, BadgeProps["color"]> = {
  received: "neutral",
  reviewing: "info",
  approved: "success",
  rejected: "destructive",
};

export function SidStatusBadge({ status }: { status: SidStatus }) {
  return (
    <Badge color={COLOR[status]} variant="tinted">
      {SID_STATUS_LABEL[status]}
    </Badge>
  );
}
