# widgets 레이어

**여러 조각을 합친 큰 UI 블록.** 사이드바, 헤더, 통계 카드, 데이터 테이블처럼
*독립적으로 의미 있는 합성 단위*입니다. entities·features·shared 를 조립합니다.

## 이 레이어의 슬라이스

| 슬라이스 | 무엇 | 조립하는 것 |
|---|---|---|
| `app-sidebar` | 좌측 내비게이션 | `shared/config`(메뉴 데이터) + react-router |
| `app-header` | 상단 바 | `features/theme-toggle` + `features/auth`(로그아웃) |
| `page-header` | 페이지 제목/설명/액션 슬롯 | (재사용 레이아웃) |
| `stat-card` | KPI 카드 | `shared/ui`(Card·Badge·아이콘) |
| `data-table` | 범용 테이블(제네릭) | `shared/ui`(Table) + 로딩 스켈레톤/빈 상태 |
| `recent-orders` | 최근 주문 리스트 | `entities/order`(데이터 + 상태배지) |

## 핵심 교보재 포인트
- **구성과 표현의 분리**: `app-sidebar` 는 메뉴를 `shared/config.NAV_ITEMS` 에서 읽어 렌더만 합니다.
  새 페이지가 생기면 config 한 줄만 추가하면 메뉴에 노출됩니다.
- **feature 들을 "배치"만**: `app-header` 는 테마토글·로그아웃 feature 를 한 줄에 놓을 뿐,
  각 행위의 로직은 해당 feature 안에 있습니다.
- **도메인 무관한 범용 위젯**: `DataTable<T>` 는 컬럼 정의와 행만 받습니다. "어떤 컬럼을
  보여줄지"는 page 가 결정하고, entities 의 표현 컴포넌트를 셀 render 에 끼웁니다.

## import 방향
- ✅ `widgets → features/entities/shared`
- ❌ `widgets → pages/app`, `widgets → 다른 widget`
