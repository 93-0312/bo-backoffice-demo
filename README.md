# BO Backoffice Demo — FSD 교보재

`@eromnet/bo-ui-kit`(디자인 시스템)을 **`shared` 레이어**로 삼고, 그 위에 **FSD(Feature-Sliced Design)** 로 조립한 백오피스 데모입니다.
각 계층마다 실제 동작하는 예시를 담아, FSD를 **코드로 읽으며 배우는 교보재**로 쓸 수 있게 만들었습니다.

> FSD 개념 원문은 `figma-to-react/docs/fsd-*.md` 를 참고하세요. 이 저장소는 그 문서의
> "킷을 import 해 화면을 만드는 실제 앱"(Lv.2~3)을 실물로 구현한 것입니다.

---

## 1. 한눈에 보는 레이어

```
app       앱 부팅 껍데기 — Provider/라우팅/레이아웃/전역 스타일
 ↓
pages     라우트 한 장   — /login /  /users /products /orders /settings
 ↓
widgets   합성 UI 블록   — 사이드바, 헤더, 페이지헤더, 통계카드, 데이터테이블, 최근주문
 ↓
features  사용자 행위    — 로그인, 테마토글, 사용자 검색/추가/삭제, 주문상태변경
 ↓
entities  도메인 대상    — user, product, order (타입·목업·api·표현 컴포넌트)
 ↓
shared    범용 재료      — bo-ui-kit(킷) + app 공용 프리미티브/유틸/훅/토큰/설정
```

**절대 규칙: import 는 위 → 아래 한 방향만.** 아래 레이어는 위 레이어를 모릅니다.
같은 레이어 슬라이스끼리도 서로 import 하지 않습니다(공통은 한 단계 아래로 내림).

## 2. bo-ui-kit 은 어디에?

FSD 문서가 못박은 대로 **`bo-ui-kit` 전체가 `shared`** 입니다. 이 앱은 킷을 **npm 에서 설치**
(`npm install bo-ui-kit`, v0.2.0 — Button·Input·Select·Tabs·Dialog·Badge·Avatar·Alert 등 35+ 컴포넌트)해
`shared/ui` 에서 재노출합니다.

킷에 없는 백오피스 필수 부품(**Card·Table**)만 **앱의 shared 레이어**에서 킷과 **같은 토큰**으로
직접 만들었습니다 → "shared = 킷 + 앱 공용 프리미티브" 라는 실전 패턴.

## 3. 실행

```bash
npm install
npm run dev      # http://localhost:5180
npm run typecheck
npm run build
```

데모 로그인: **admin@example.com / admin1234**

## 4. 둘러보기 포인트 (각 계층의 핵심 예시)

| 보고 싶은 것 | 파일 |
|---|---|
| 도메인 상태 → 색 매핑 | `entities/user/ui/UserStatusBadge.tsx` |
| 상태 전이 규칙(state machine) | `entities/order/model/types.ts` (`ORDER_STATUS_FLOW`) |
| 도메인 검증을 entity 가 보장 | `entities/order/api/orderApi.ts` (`updateOrderStatus`) |
| 행위(feature)가 entity 에 위임 | `features/user-create/ui/CreateUserButton.tsx` |
| 규칙 기반 UI(가능한 다음 상태만 노출) | `features/order-status-update/ui/OrderStatusUpdater.tsx` |
| 제어 컴포넌트(상태는 page 소유) | `features/user-filter` + `pages/users` |
| 범용 위젯(로딩/빈 상태 내장) | `widgets/data-table/ui/DataTable.tsx` |
| feature 들을 조립하는 widget | `widgets/app-header/ui/AppHeader.tsx` |
| 교차관심사를 shared 에 둠 | `shared/theme/index.tsx` |
| Public API(배럴) 경유 import | 모든 슬라이스의 `index.ts` |
| 디자인 시스템 카탈로그 | `pages/settings` (킷 컴포넌트 갤러리) |
| 킷 컴포넌트 활용 | Dialog/Select=`user-create`, AlertDialog=`user-delete`, Tabs=`orders`, Skeleton=`data-table` |

## 5. 폴더 구조

```
src/
├── app/        Provider · 라우팅 · 레이아웃 · 전역 스타일/토큰
├── pages/      login · dashboard · users · products · orders · settings · not-found
├── widgets/    app-sidebar · app-header · page-header · stat-card · data-table · recent-orders
├── features/   auth · theme-toggle · user-filter · user-create · user-delete · order-status-update
├── entities/   user · product · order
└── shared/     ui(킷+프리미티브) · lib · api · hooks · config · theme
```

각 폴더의 `README.md` 에 그 계층의 역할·규칙·예시 설명이 있습니다.
