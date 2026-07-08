import { Badge, type BadgeProps } from "@/shared/ui";
import { USER_STATUS_LABEL, type UserStatus } from "../model/types";

/**
 * UserStatusBadge — 도메인 상태를 킷 Badge 의 color 로 매핑하는 entities UI.
 *
 * 핵심 교보재 포인트: 킷 Badge 는 color(상태색) + variant(fill/tinted) 만 안다.
 * "active=success" 같은 도메인 ↔ 색 매핑은 도메인 지식이라 여기(entities) 에서 정한다.
 */
const STATUS_COLOR: Record<UserStatus, BadgeProps["color"]> = {
  active: "success",
  invited: "info",
  suspended: "destructive",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge color={STATUS_COLOR[status]} variant="tinted">
      {USER_STATUS_LABEL[status]}
    </Badge>
  );
}
