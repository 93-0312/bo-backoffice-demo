import { Avatar } from "@/shared/ui";
import { getInitials } from "@/shared/lib";
import type { User } from "../model/types";

/**
 * UserIdentityCell — 아바타 + 이름 + 이메일을 한 덩어리로 보여주는 entities UI.
 * 테이블 셀/리스트/드롭다운 어디서나 재사용. "User 를 어떻게 표시하나"의 표준.
 *
 * 킷 Avatar 는 name 을 모르므로(범용), 이니셜 폴백은 도메인 쪽에서 만들어 넣는다.
 */
export function UserIdentityCell({ user }: { user: Pick<User, "name" | "email" | "avatarUrl"> }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={user.avatarUrl} alt={user.name} fallback={getInitials(user.name)} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
