# pages 레이어

**라우트 한 장 = 화면.** URL 하나에 대응하는 최상위 화면입니다.
pages 가 하는 일은 **조립과 라우팅뿐** — 데이터 상태를 들고, widget·feature·entity 를 배치합니다.
(스스로 저수준 UI 를 그리지 않습니다.)

## 이 레이어의 슬라이스

| 슬라이스 | 라우트 | 조립 구성 |
|---|---|---|
| `login` | `/login` | `features/auth.LoginForm` + 성공 시 라우팅 |
| `dashboard-renewal` | `/` (기본 진입) | `widgets/renewal-*` 6종 벤토 조립 + `entities/dashboard-renewal` (styled-components 순수 SVG 차트) |
| `dashboard-renewal2` | `/dashboard-renewal-2` | 동일 위젯 재사용 A/B 변형 B — 최소 골격(`index.ts` + `ui/`)으로 시작 |
| `dashboard` | `/dashboard-legacy` | `widgets/stat-card` · `recent-orders` + `shared/Meter` (리뉴얼 이전 대시보드) |
| `users` | `/users` | `widgets/filter-bar` + `features/user-create·user-delete` + `widgets/data-table` + `entities/user` 표현 |
| `products` | `/products` | 검색/카테고리 필터 + `data-table` + `entities/product` |
| `orders` | `/orders` | 상태 필터 + `data-table` + `features/order-status-update` |
| `settings` | `/settings` | 환경설정 + **컴포넌트 갤러리(교보재 카탈로그)** |
| `not-found` | `*` | 404 |

## 핵심 교보재 포인트
- **상태 소유는 page**: 필터 값은 page 가 `useFilters` 로 소유하고(persist:"memory" —
  방문 탭 재진입 시 유지, 새로고침 초기화), `FilterBar` 는 스키마(defs)대로 그리고 변경을 emit 만 합니다.
- **데이터 흐름**: 필터 변경 → params → (검색 디바운스) → `entities` api → 테이블 갱신.
  로딩/빈 상태는 `data-table` 위젯이 내장 처리.
- **표현 재사용**: 테이블 컬럼의 셀에 `entities` 의 배지/아이덴티티 컴포넌트를 그대로 끼웁니다.

## import 방향
- ✅ `pages → widgets/features/entities/shared`
- ❌ `pages → app`, `pages → 다른 page`
