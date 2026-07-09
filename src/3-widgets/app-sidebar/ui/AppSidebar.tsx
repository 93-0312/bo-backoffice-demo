import { NavLink } from "react-router-dom";
import { NAV_GROUPS } from "@/shared/config";
import { cn } from "@/shared/lib";

/**
 * AppSidebar — 좌측 내비게이션 (widget).
 *
 * shared/config 의 그룹 메뉴 데이터를 읽어 섹션 헤더 + NavLink 목록으로 렌더한다.
 * 메뉴 "구성"은 config, "표현"은 이 widget 이 담당(구성과 표현의 분리).
 *
 * 반응형/접힘은 "제어" 로 받는다(상태는 AppLayout 소유):
 *  - 데스크톱(md↑): `collapsed` 로 아이콘 레일(w-16) ↔ 전체(w-60) 전환.
 *  - 모바일(md 미만): 오프캔버스 드로어. `mobileOpen` 으로 슬라이드, 배경 클릭 시 onClose.
 */
export interface AppSidebarProps {
  /** 데스크톱 아이콘 레일 축소 여부 */
  collapsed: boolean;
  /** 모바일 드로어 열림 여부 */
  mobileOpen: boolean;
  /** 모바일 드로어 닫기(배경 클릭) */
  onClose: () => void;
}

export function AppSidebar({ collapsed, mobileOpen, onClose }: AppSidebarProps) {
  return (
    <>
      {/* 모바일 드로어 배경 — 열렸을 때만, md 이상에선 없음 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-60 shrink-0 flex-col border-r border-border bg-card",
          "transition-[width,transform] duration-200 ease-in-out",
          // 모바일: 슬라이드 인/아웃
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // 데스크톱: 항상 흐름 안에 두고(translate 취소) 폭만 전환
          "md:relative md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center gap-2 px-5",
            collapsed && "md:justify-center md:px-0",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-radius bg-primary text-sm font-bold text-primary-foreground">
            BO
          </span>
          <span className={cn("text-sm font-semibold", collapsed && "md:hidden")}>Backoffice</span>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              {group.title && (
                <p
                  className={cn(
                    "px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
                    collapsed && "md:hidden",
                  )}
                >
                  {group.title}
                </p>
              )}
              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-radius px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "md:justify-center",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className={cn(collapsed && "md:hidden")}>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div
          className={cn(
            "border-t border-border p-4 text-xs text-muted-foreground",
            collapsed && "md:hidden",
          )}
        >
          FSD 데모 · v0.1.0
        </div>
      </aside>
    </>
  );
}
