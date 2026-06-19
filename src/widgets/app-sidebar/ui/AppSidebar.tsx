import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/shared/config";
import { cn } from "@/shared/lib";

/**
 * AppSidebar — 좌측 내비게이션 (widget).
 *
 * widget 은 "여러 조각을 합친 큰 UI 블록"이다. 여기선 shared/config 의 메뉴 데이터를
 * 읽어 NavLink 목록으로 렌더한다. 메뉴 "구성"은 config, "표현"은 이 widget 이 담당.
 */
export function AppSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 px-5">
        <span className="grid size-7 place-items-center rounded-radius bg-primary text-sm font-bold text-primary-foreground">
          BO
        </span>
        <span className="text-sm font-semibold">Backoffice</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-radius px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        FSD 데모 · v0.1.0
      </div>
    </aside>
  );
}
