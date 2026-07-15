import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_GROUPS, ROUTES, type NavItem } from "@/shared/config";
import { cn } from "@/shared/lib";
import { IconClose } from "@/shared/ui/icons";

/**
 * VisitedTabs — 방문한 메뉴 탭바 (widget). 기존 BO 의 MDI 탭 동작을 재현한다.
 *
 * 메뉴를 방문할 때마다 탭이 쌓이고, 탭을 누르면 그 메뉴에서 마지막으로 보던
 * URL(lastUrl — 상세 경로·쿼리 포함)로 돌아간다. 필터 값의 복원 자체는
 * useFilters 의 persist("memory"/"url")가 담당하고, 이 위젯은 내비게이션만 한다.
 *
 * 탭 목록은 컴포넌트 상태로만 유지 — AppLayout 이 라우트 이동에도 마운트를
 * 유지하므로 세션 내에선 살아있고, 새로고침하면 초기화된다(기존 BO 와 동일).
 *
 * 탭의 단위는 사이드바 메뉴(NAV_GROUPS 항목)다. 상세 페이지(/transactions/:id 등)는
 * 소속 메뉴 탭에 귀속되어 그 탭의 lastUrl 만 갱신한다.
 */
interface VisitedTab {
  /** 메뉴 경로(NavItem.to) — 탭 식별자 */
  to: string;
  label: string;
  /** 이 메뉴에서 마지막으로 보던 pathname+search — 탭 클릭 시 이동 목적지 */
  lastUrl: string;
}

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** 현재 경로가 속한 메뉴 항목 — end 는 정확 일치, 그 외엔 하위 경로(상세)도 포함. */
function matchNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) =>
    item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/"),
  );
}

export function VisitedTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<VisitedTab[]>([]);

  const activeTo = matchNavItem(location.pathname)?.to ?? null;

  // 라우트 이동 → 탭 추가 또는 현재 탭의 lastUrl 갱신 (메뉴 밖 경로는 무시)
  useEffect(() => {
    const item = matchNavItem(location.pathname);
    if (!item) return;
    const url = location.pathname + location.search;
    setTabs((prev) => {
      const i = prev.findIndex((t) => t.to === item.to);
      if (i === -1) return [...prev, { to: item.to, label: item.label, lastUrl: url }];
      if (prev[i].lastUrl === url) return prev;
      const next = [...prev];
      next[i] = { ...next[i], lastUrl: url };
      return next;
    });
  }, [location.pathname, location.search]);

  const closeTab = (to: string) => {
    const remaining = tabs.filter((t) => t.to !== to);
    setTabs(remaining);
    // 보고 있던 탭을 닫으면 마지막 남은 탭으로(없으면 대시보드로) 이동
    if (to === activeTo) {
      navigate(remaining.length ? remaining[remaining.length - 1].lastUrl : ROUTES.dashboard);
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="방문한 메뉴"
      className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-border bg-card px-3 pt-1.5"
    >
      {tabs.map((tab) => {
        const active = tab.to === activeTo;
        return (
          <div
            key={tab.to}
            role="tab"
            aria-selected={active}
            className={cn(
              "group flex shrink-0 cursor-pointer items-center gap-1 rounded-t-radius border border-b-0 border-border px-3 py-1.5 text-sm transition-colors",
              active
                ? // 바 하단 보더를 덮어 본문과 이어진 활성 탭처럼 보이게
                  "-mb-px border-b border-b-background bg-background font-medium text-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => navigate(tab.lastUrl)}
          >
            <span className="whitespace-nowrap">{tab.label}</span>
            <button
              type="button"
              aria-label={`${tab.label} 탭 닫기`}
              className={cn(
                "grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground",
                !active && "opacity-0 group-hover:opacity-100",
              )}
              onClick={(e) => {
                e.stopPropagation(); // 탭 이동 클릭과 분리
                closeTab(tab.to);
              }}
            >
              <IconClose className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
