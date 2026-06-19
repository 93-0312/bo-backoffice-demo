# app 레이어

**앱을 부팅하는 껍데기.** 최상위에서 한 번만 일어나는 일 — Provider 구성, 라우팅,
공통 레이아웃, 전역 스타일/토큰 — 을 모읍니다. 비즈니스 로직은 두지 않습니다.

## 구성

| 폴더/파일 | 역할 |
|---|---|
| `styles/index.css` · `tokens.css` | 전역 스타일 진입점 + 디자인 토큰(킷 보강/오버라이드) |
| `providers/AppProviders.tsx` | Router → Theme → Auth Provider 조립 |
| `layout/AppLayout.tsx` | 사이드바 + 헤더 + 본문(Outlet) 공통 레이아웃 |
| `routing/AppRoutes.tsx` | 라우트 테이블(공개/보호 영역 분리) |
| `routing/ProtectedRoute.tsx` | 인증 가드 (미인증 → /login, 복귀 경로 보존) |
| `App.tsx` | Provider 로 감싼 라우트 트리 |

`main.tsx`(src 루트)는 React 마운트 한 줄만 담당하고, 실제 앱은 `app/App.tsx` 입니다.

## 핵심 교보재 포인트
- **부팅 책임의 집결**: 라우팅·테마·인증 컨텍스트가 여기서 한 번에 감싸집니다.
- **라우팅은 app 의 관심사**: `ProtectedRoute` 는 인증 상태(`features/auth.useAuth`)를 읽어
  접근을 제어합니다. (app → feature 정방향)
- 토큰 로드 순서: 킷 스타일 → 앱 토큰(보강/오버라이드) → Tailwind.

## import 방향
- app 은 모든 하위 레이어(pages~shared)를 import 할 수 있는 **최상위**입니다.
- 다른 레이어는 app 을 import 하지 않습니다(역방향 금지).
