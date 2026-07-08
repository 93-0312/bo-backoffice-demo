import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "./routing/AppRoutes";

/**
 * App — 최상위 컴포넌트 (app 레이어).
 * Provider 로 감싼 라우트 트리. 이 위(main.tsx)는 React 마운트만 담당한다.
 */
export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
