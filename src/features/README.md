# features 레이어

**사용자 "행위(동사)".** "로그인하기", "사용자 추가하기", "주문 상태 바꾸기" 같은
*하나의 완결된 행동*을 UI + 로직으로 캡슐화합니다.

## 이 레이어의 슬라이스

| 슬라이스 | 행위 | 위임하는 곳 |
|---|---|---|
| `auth` | 로그인/로그아웃 + 세션 컨텍스트 | (데모 인증) |
| `theme-toggle` | 다크모드 전환 | `shared/theme` |
| `user-filter` | 사용자 검색·필터 | (제어 컴포넌트, 상태는 page 소유) |
| `user-create` | 사용자 추가 (모달 폼) | `entities/user.createUser` |
| `user-delete` | 사용자 삭제 (확인 모달) | `entities/user.deleteUser` |
| `order-status-update` | 주문 상태 변경 | `entities/order.updateOrderStatus` + 전이 규칙 |

## 핵심 교보재 포인트
- **로직은 위임, feature 는 흐름만**: `CreateUserButton` 은 모달·폼·검증·로딩을 책임지되
  실제 생성은 `entities/user` 에 넘깁니다. (행위 ↔ 도메인의 분리)
- **규칙 기반 UI**: `OrderStatusUpdater` 는 `nextStatuses(order.status)` 로 "지금 갈 수 있는
  다음 상태"만 버튼으로 노출합니다. 규칙의 출처는 entities.
- **제어 컴포넌트 패턴**: `user-filter` 는 상태를 갖지 않고 `value`/`onChange` 만 받습니다.
  상태 소유는 page → 재사용성과 테스트성이 올라갑니다.

## import 방향
- ✅ `features → entities`, `features → shared`
- ❌ `features → widgets/pages/app`, `features → 다른 feature` (역방향·동일 레이어 금지)
- 공통이 필요하면 한 단계 아래(entities/shared)로 내리거나, widget 에서 두 feature 를 합성합니다.
