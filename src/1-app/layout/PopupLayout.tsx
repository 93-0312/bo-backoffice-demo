import { Outlet } from "react-router-dom";

/**
 * PopupLayout — 새 창(window.open)으로 여는 독립 화면용 레이아웃 (app/layout).
 *
 * 사이드바·상단 헤더 없이 본문만 그린다. 거래 상세처럼 "모달처럼 동작하되 새 창으로
 * 띄우는" 화면에 쓴다. 인증 가드(ProtectedRoute)는 동일하게 적용 — 토큰이 localStorage
 * 라 부모 창과 로그인 상태를 공유한다.
 */
export function PopupLayout() {
  return (
    <div className="min-h-dvh overflow-y-auto bg-background p-6">
      <Outlet />
    </div>
  );
}
