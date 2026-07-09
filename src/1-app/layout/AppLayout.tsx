import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/widgets/app-sidebar";
import { AppHeader } from "@/widgets/app-header";

/**
 * AppLayout — 인증된 영역의 공통 레이아웃 (app/layout).
 * 좌측 사이드바 + 상단 헤더(widget) + 본문(Outlet). page 는 Outlet 자리에 렌더된다.
 */
export function AppLayout() {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* 본문 폭 제한 없음 — 사이드바를 뺀 나머지 전체를 쓴다(컬럼 많은 표 대응). */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
