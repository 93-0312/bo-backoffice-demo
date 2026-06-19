import { Button, Avatar, IconBell, IconLogout } from "@/shared/ui";
import { getInitials } from "@/shared/lib";
import { ThemeToggle } from "@/features/theme-toggle";
import { useAuth } from "@/features/auth";

/**
 * AppHeader — 상단 바 (widget).
 *
 * 여러 feature 를 한 줄에 조립한다: 테마 토글(feature) + 로그아웃(features/auth).
 * widget 은 feature 들을 "배치"할 뿐, 각 행위의 로직은 해당 feature 가 갖는다.
 */
export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-1 border-b border-border bg-card px-5">
      <Button variant="ghost" size="md" icon={<IconBell />} aria-label="알림" />
      <ThemeToggle />
      <div className="mx-2 h-5 w-px bg-border" />
      {user && (
        <div className="flex items-center gap-2">
          <Avatar fallback={getInitials(user.name)} alt={user.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs leading-tight text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        size="md"
        icon={<IconLogout />}
        aria-label="로그아웃"
        onClick={logout}
      />
    </header>
  );
}
