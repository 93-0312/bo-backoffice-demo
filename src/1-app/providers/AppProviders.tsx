import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/shared/theme";
import { AuthProvider } from "@/features/auth";

/**
 * AppProviders — 전역 Provider 조립 (app/providers).
 *
 * app 레이어는 "앱을 부팅하는 껍데기"다. 여기서 라우터/테마/인증 컨텍스트를 한 번에 감싼다.
 * 순서: Router → Theme → Auth (Auth UI 가 테마/라우팅을 쓸 수 있도록 바깥에 둠).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
