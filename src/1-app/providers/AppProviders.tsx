import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api";
import { ThemeProvider } from "@/shared/theme";
import { AuthProvider } from "@/features/auth";

/**
 * AppProviders — 전역 Provider 조립 (app/providers).
 *
 * app 레이어는 "앱을 부팅하는 껍데기"다. 라우터/쿼리/테마/인증 컨텍스트를 한 번에 감싼다.
 * 순서: Router → Query → Theme → Auth. QueryClientProvider 가 페이지의 useQuery 를 감싼다.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
