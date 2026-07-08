# FSD 실전 가이드 (bo-backoffice-demo 기준)

> **이 문서의 원칙: 추상 설명 한 줄 = 우리 코드 한 곳.**
> 모든 개념에 `bo-backoffice-demo`의 실제 파일 경로를 붙인다. 막히면 개념을 다시
> 읽지 말고 **그 파일을 열어라.** 이 레포 자체가 살아있는 예제집이다.

읽는 법: Lv.0→3 순서. 지금 필요한 곳에서 멈춰도 됨. FSD가 어려운 건 "규칙"이
아니라 "언제 어디에 두느냐(판단)"라서, Lv.2~3의 **판단 기준**과 맨 뒤 **워크드 예제**가
실전의 핵심이다.

---

## Lv.0 — FSD가 뭐예요? (완전 처음)

**한 줄:** "코드를 어느 폴더에 둘지"를 모두가 같은 규칙으로 정하는 약속.

**왜:** 규칙이 없으면 → 중복이 흩어지고, 버튼 하나 고쳤는데 엉뚱한 화면이 깨지고,
새 사람이 어디부터 볼지 모른다. FSD는 **층을 나누고 "위층만 아래층을 쓰게"** 해서 막는다.

**핵심 한 줄:** 완성품(자동차)은 블록을 꺼내 쓰지만, 블록은 자동차를 몰라도 된다.
→ **위에서 아래로만 참조.** 나머지는 다 디테일.

---

## Lv.1 — 6층 + 단방향 (각 층을 우리 파일로)

`bo-backoffice-demo/src`가 그대로 이 6층이다:

```
app       앱 부팅 껍데기
 ↓        src/app/providers, src/app/routing/AppRoutes.tsx
pages     라우트 = 화면 한 장
 ↓        src/pages/dashboard-renewal, src/pages/users, src/pages/settings
widgets   여러 조각을 합친 큰 UI 블록
 ↓        src/widgets/stat-card, src/widgets/data-table, src/widgets/app-sidebar
features  사용자가 하는 "행동"
 ↓        src/features/seller-refund(환불하기), src/features/auth(로그인하기)
entities  비즈니스 "대상"(명사)
 ↓        src/entities/user, src/entities/order, src/entities/dashboard-renewal
shared    도메인 무관 범용 재료
          src/shared/ui(Button·ConfirmDialog), src/shared/lib(cn·format), src/shared/config
```

> **폴더 이름 규칙(우리 레포 관례):** 물리 폴더는 탐색기에서 위→아래로 정렬되도록
> `1-app` `2-pages` `3-widgets` `4-features` `5-entities` `6-shared`처럼 숫자 접두어를
> 붙인다. 하지만 **import는 숫자 없는 표준 이름**(`@/shared/ui`, `@/features/...`)으로 쓴다.
> 둘을 잇는 건 `tsconfig.json`의 `paths` + `vite.config.ts`의 `alias`다 — 레이어 폴더명을
> 바꾸면 **이 두 파일을 반드시 같이** 고쳐야 한다(하나만 고치면 전체 import가 깨진다).

**절대 규칙 하나 — 위→아래로만 import**
- ✅ `pages → widgets/features/entities/shared`
- ✅ `features → entities/shared`
- ❌ `shared → features` (역방향)
- ❌ `feature A → feature B`, `page A → page B` (같은 레이어끼리)

우리 레포에서 실제로 지켜지는 모습:
- `features/auth`가 `entities/user`의 타입을 가져옴 (feature→entity, 정방향) ✅
- `pages/dashboard-renewal2`가 `pages/dashboard-renewal`을 **못** 가져옴 → 그래서 둘이
  공유할 타입은 아래(widget/entity)로 내려야 함. (이게 나중에 "왜 위젯으로 빼요?"의 이유)

**shared 안은 통짜가 아니라 성격별 칸으로 또 나뉜다:**

```
src/shared/
├── ui/       컴포넌트 (Button, Card, Table, ConfirmDialog …)
├── lib/      유틸 함수 (cn, format, initials)
├── config/   라우트·내비 상수 (routes, nav)
├── hooks/    공용 훅 (useContainerWidth 등)
└── api/      공용 통신 (client)
```

> 참고: `src/shared/ui`는 두 출처를 하나로 노출한다 — ① `bo-ui-kit`(npm) 컴포넌트를
> re-export + ② 킷에 없어 우리가 만든 프리미티브(Card·Table·ConfirmDialog).
> 즉 **bo-ui-kit은 shared/ui를 채우는 재료 출처 중 하나**일 뿐, 상위 레이어는 출처를
> 신경 쓸 필요 없이 `@/shared/ui` 한 곳에서만 가져온다. (`src/shared/ui/index.ts` 배럴)

---

## Lv.2 — 명사 vs 동사, 그리고 "성격 ≠ 폴더" (여기가 실전 진입)

**1차 판별: 명사(대상)냐 동사(행위)냐**
- 명사 → **entities**: `User`, `Order`, `Transaction` (그 데이터 자체)
- 동사 → **features**: 로그인하기, 환불하기, 삭제하기 (그걸로 하는 행동)

우리 레포가 그대로 증거다. entities는 전부 명사(`user`, `order`, `transaction`),
features는 전부 동사(`auth`, `seller-refund`, `user-create`, `user-delete`).

**2차 판별(실무의 절반): 행위라고 무조건 `features/` 폴더가 아니다.**

"동사 = feature 성격"은 맞다. 하지만 **폴더로 뗄지는 별개 결정** — 재사용·복잡도가
정한다.

| 상황 | 어디에 |
|---|---|
| 순차 호출 몇 줄 + 한 곳에서만 씀 | **page 핸들러에 인라인** (feature 폴더 X) |
| 진입점이 둘 이상 / 자체 UI·상태·규칙이 붙음 | **feature 슬라이스로 추출** |

예: "파일 다운로드"는 분명 사용자 행위지만, 지금은 한 페이지에서만 쓰고 단순해서
`features/` 안 만들고 **page의 `handleDownload`에 인라인**한다. 여러 화면에서 쓰이거나
옵션·진행률이 붙으면 그때 `features/xxx-export`로 옮긴다.

> 한 줄: **성격은 판별로, 폴더는 재사용·복잡도로.** 임계점 아래의 행위는 page에 그냥 산다.

---

## Lv.3 — 슬라이스 / 세그먼트 + 성장 모델 (직접 짤 때)

**슬라이스** = 한 레이어 안의 기능 단위 폴더 (`features/seller-refund`, `entities/user`).
`entities`~`pages`에만 있음. `shared`·`app`은 통짜(슬라이스 없음).

**세그먼트** = 슬라이스 안의 표준 칸:
```
features/seller-refund/
├── ui/        컴포넌트 (보이는 것)
├── model/     상태·로직 (타입, store, 훅)
├── api/       서버 통신
├── lib/       그 슬라이스 전용 순수 유틸
├── config/    그 슬라이스 전용 상수
└── index.ts   Public API (바깥에 노출할 것만 export)
```

### 성장 모델 — 세그먼트는 "미리" 만들지 않는다 (가장 흔한 함정)

새 슬라이스는 **`index.ts` + `ui/` 최소 골격**으로 시작한다. 세그먼트는 **신호가 올 때**
하나씩 추가:

| 이런 게 생기면 | 이 세그먼트로 | 우리 레포 예 |
|---|---|---|
| 상태 로직/배치 정의가 커짐 | `model/` | `pages/dashboard-renewal/model/layout.ts` |
| 그 슬라이스 전용 상수(탭·옵션·플래그) | `config/` | (아직 없음 — 생기면 여기) |
| 그 슬라이스 전용 순수 계산 함수 | `lib/` | (아직 없음) |
| 여러 소스를 합쳐 로딩하는 조합이 커짐 | `api/` | `entities/dashboard-renewal/api` |

실제로 이 레포 page 12개 중 대부분이 `ui/` + `index.ts` 하나로 끝난다. `dashboard-renewal`만
배치가 있어서 `model/layout.ts`를 가진다. **빈 세그먼트를 미리 파두는 건 안티패턴.**

> ⚠️ 우리가 실제로 겪은 실수: `dashboard-renewal2`를 만들 때 처음부터 5개 세그먼트를
> 다 채웠다가, "필요할 때 추가"로 되돌렸다. 시작은 항상 `ui/` + `index.ts`.

### Public API 규칙

바깥에서는 **반드시 `index.ts`를 통해서만** import.
- ✅ `import { SellerRefundModal } from "@/features/seller-refund"`
- ❌ `import { SellerRefundModal } from "@/features/seller-refund/ui/SellerRefundModal"`

이유: 내부 세그먼트를 어떻게 바꾸든 `index.ts`만 유지하면 바깥이 안 깨짐(캡슐화).
`shared/ui`도 같은 원리 — `src/shared/ui/index.ts` 배럴로만 노출.

### "새 코드 어디에?" 결정 트리 (실제 예 붙여서)

```
도메인 무관 범용 재료인가? (버튼, 포맷터, 토큰, 확인창 껍데기)
  └ 예 → shared            예: ConfirmDialog, cn(), formatCurrency()
  └ 아니오 ↓
명사(대상)인가 동사(행위)인가?
  ├ 대상        → entities   예: entities/user, entities/transaction
  ├ 행위        → features   예: features/seller-refund  (단, 단발성이면 page 인라인)
  ├ 합성 UI 블록 → widgets    예: widgets/data-table, widgets/stat-card
  └ 화면 한 장   → pages      예: pages/transactions
```

---

## 워크드 예제 (제일 실무적 — 실제 커밋 기반)

### 예제 1 — "복붙 3번" → shared로 추출한 ConfirmDialog

**문제:** `user-delete`, `seller-refund` 등이 Dialog 껍데기(Header/Body/Footer + 버튼)를
각자 그리고 있었다. 껍데기는 같고 내용만 달랐다.

**해결:** 제목·메시지·버튼만 props로 받는 껍데기를 `shared/ui/confirm-dialog.tsx`로 한 번
추출 → 두 결로 재사용:
- 간단 확인(텍스트만): `pages`에서 바로 `<ConfirmDialog title description onConfirm />` (자동 닫힘)
- 비동기 행위(삭제): `features/user-delete`에서 `loading`/`error`/`closeOnConfirm={false}`로 제어

**배운 것:** 껍데기 = shared, 그 안 내용 = 호출측. **"복붙이 반복되면(rule of three)
shared로 한 겹."** 처음부터 shared로 만들지 말고, 반복이 보일 때 추출.

### 예제 2 — 한 "행위"가 세 층으로 쪼개진다 (다운로드 버튼)

"Top 5 국가 파일 다운로드"는 하나로 안 간다. 성격대로 흩어진다:

```
[page] handleDownload()          ← 조립(행위) = page (단발성이라 인라인)
   ├─ fetchTopCountriesExport()  ← 데이터 받기 = entities/api
   └─ downloadBlob(name, blob)   ← 파일 저장 유틸 = shared/lib (도메인 무관)
[widget] TopCountriesCard        ← onDownload 이벤트만 emit. 다운로드 방법은 모름
```

**배운 것:** ① "행위"가 통째로 한 폴더로 안 간다 — 데이터는 entity, 유틸은 shared,
조립만 page/feature. ② **위젯은 표현 유지** — `onDownload`만 쏘고, entity를 직접 불러
다운로드하지 않는다(그러면 표현 컴포넌트가 side-effect를 가짐).

---

## 안티패턴 (우리가 실제로 부딪힌 것들)

| 안티패턴 | 왜 나쁜가 | 대신 | 실제 사례 |
|---|---|---|---|
| 세그먼트를 미리 다 만들기 | 빈 구조만 늘어남 | `ui/`+`index.ts`로 시작, 신호 올 때 추가 | dashboard-renewal2 최초 버전 |
| 죽은 코드가 배럴에 export | "쓰이는 척" 위장돼 안 지워짐 | 소비처 사라지면 파일+export 정리 | RefundButton (커밋 9f62951에서 제거) |
| widget이 entity 불러 side-effect | 표현 컴포넌트 재사용성 붕괴 | widget은 이벤트 emit, 조립은 page/feature | 다운로드 버튼 논의 |
| shared에 도메인 로직 | 범용성 깨짐 | 도메인은 entities/features | — |
| 슬라이스 내부 직접 import | 캡슐화 깨짐 | `index.ts` 경유 | — |
| 같은 레이어끼리 참조 | 결합도↑ | 공통은 한 층 아래로 내림 | dashboard-renewal ↔ 2 |

---

## 한 줄 요약

**FSD = 위→아래로만 쓰는 6층 폴더 규칙.** `bo-backoffice-demo`의 `src`가 그대로 그
6층이다. 새 코드는 "범용 재료 → shared / 명사 → entities / 동사 → features / 합성블록
→ widgets / 화면 → pages"로 층을 정하고, 새 슬라이스는 항상 **`ui/` + `index.ts`로
시작**해 세그먼트는 신호가 올 때 늘린다. 판단이 막히면 같은 종류의 기존 파일을 열어
흉내 내라 — 이 레포가 답지다.
