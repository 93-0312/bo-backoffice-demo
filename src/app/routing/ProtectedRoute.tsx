import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config";

/**
 * ProtectedRoute — 인증 가드 (app/routing).
 *
 * 라우팅은 app 의 관심사다. 미인증이면 로그인으로 보내되, 원래 가려던 경로를 state 로
 * 넘겨 로그인 후 복귀시킨다. 인증 상태는 features/auth 의 useAuth 로 읽는다(app → feature).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
