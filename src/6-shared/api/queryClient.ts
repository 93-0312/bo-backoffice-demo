import { QueryClient } from "@tanstack/react-query";

/**
 * 앱 전역 QueryClient (shared/api).
 * 기본 옵션만 둔다 — 각 쿼리 훅(entities 슬라이스의 api)에서 필요 시 개별 override.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1_000, // 1초 동안 fresh — 메뉴 재진입 시 최신 데이터를 바로 재조회
      gcTime: 5 * 60_000, // 5분 후 캐시 정리
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
