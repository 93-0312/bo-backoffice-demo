import { Badge } from "@/shared/ui";
import { USER_ROLE_LABEL, type UserRole } from "../model/types";

/** UserRoleBadge — admin 만 채움(강조), 나머지는 중립 tinted. */
export function UserRoleBadge({ role }: { role: UserRole }) {
  return role === "admin" ? (
    <Badge color="info" variant="fill">
      {USER_ROLE_LABEL[role]}
    </Badge>
  ) : (
    <Badge color="neutral" variant="tinted">
      {USER_ROLE_LABEL[role]}
    </Badge>
  );
}
