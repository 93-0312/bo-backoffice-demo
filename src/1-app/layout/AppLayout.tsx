import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/widgets/app-sidebar";
import { AppHeader } from "@/widgets/app-header";

const COLLAPSED_KEY = "bo:sidebar-collapsed";

/**
 * AppLayout — 인증된 영역의 공통 레이아웃 (app/layout).
 * 좌측 사이드바 + 상단 헤더(widget) + 본문(Outlet). page 는 Outlet 자리에 렌더된다.
 *
 * 사이드바 접힘/드로어 "상태"는 여기(레이아웃)가 소유하고, sidebar·header 는
 * 값과 콜백만 받는 제어 컴포넌트다.
 *  - collapsed(데스크톱 레일): localStorage 에 저장해 새로고침에도 유지.
 *  - mobileOpen(모바일 드로어): 라우트가 바뀌면(메뉴 클릭 등) 자동으로 닫는다.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "1",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // 페이지 이동 시 모바일 드로어 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          onMenuClick={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* 본문 폭 제한 없음 — 사이드바를 뺀 나머지 전체를 쓴다(컬럼 많은 표 대응). */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
