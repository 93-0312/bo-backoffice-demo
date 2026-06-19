# entities 레이어

**비즈니스 "대상(명사)".** User, Product, Order 처럼 *데이터 그 자체*와 그 표현을 정의합니다.
"무엇인가"를 다루며, "무엇을 하는가"(행위)는 두지 않습니다 — 그건 features.

## 이 레이어의 슬라이스

| 슬라이스 | 무엇 | 도메인 규칙 예시 |
|---|---|---|
| `user` | 콘솔 구성원 | 역할(admin/manager/staff)·상태(active/invited/suspended) 라벨 |
| `product` | 판매 상품 | 재고 임계치(`LOW_STOCK_THRESHOLD`) → "부족" 경고 |
| `order` | 주문 | **상태 전이 그래프**(`ORDER_STATUS_FLOW`) + 전이 검증 |

## 슬라이스 내부(세그먼트)

```
user/
├── model/   types.ts(타입·라벨) · mock.ts(시드 데이터)
├── api/      userApi.ts (shared/api 로 네트워크 흉내, fetch/create/delete)
├── ui/       UserStatusBadge · UserRoleBadge · UserIdentityCell (도메인 표현)
└── index.ts  Public API (바깥은 이 배럴로만 접근)
```

## 핵심 교보재 포인트
- **도메인 ↔ 색 매핑은 여기서**: `UserStatusBadge` 는 `active→success` 같은 매핑을 갖고,
  shared/Badge 에는 "tone(색조)"만 넘깁니다. shared 는 도메인을 몰라도 됩니다.
- **검증은 도메인이 보장**: `order.updateOrderStatus` 가 전이 규칙 위반을 `ApiError` 로 거부합니다.
  어느 feature 가 호출하든 규칙이 깨지지 않습니다.
- entities 끼리 서로 import 하지 않습니다. 공통 표현이 필요하면 widget 에서 합성합니다.

## import 방향
- ✅ `entities → shared`
- ❌ `entities → features/widgets/pages` (역방향 금지)
