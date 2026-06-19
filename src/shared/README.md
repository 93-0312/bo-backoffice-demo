# shared 레이어

**도메인과 무관한 범용 재료.** 어떤 앱에 옮겨 붙여도 그대로 동작하는 것만 둡니다.
모든 레이어가 가져다 쓰지만, shared 는 **위 레이어를 절대 import 하지 않습니다.**

> 핵심: 여기 `bo-ui-kit`(디자인 시스템)이 통째로 들어옵니다. FSD 문서가 말한 "BO UI Kit = shared" 가 이 폴더입니다.

## 세그먼트 (슬라이스가 없는 "통짜" 레이어)

| 폴더 | 역할 | 예시 |
|---|---|---|
| `ui/` | 범용 UI 부품 | 킷 re-export(Button·Input·Select·Dialog·Badge·Avatar…) + app 프리미티브(Card·Table) + 아이콘 |
| `lib/` | 순수 유틸 | `cn()`, 포맷터(통화·날짜·상대시간) |
| `api/` | 통신 인프라 | `delay`/`mockMutation`/`ApiError` (엔드포인트는 모름) |
| `hooks/` | 범용 훅 | `useToggle`·`useDebouncedValue`·`useMediaQuery`·`useLocalStorage` |
| `config/` | 앱 상수/구성 | 라우트 경로, 사이드바 메뉴 데이터 |
| `theme/` | 교차관심사 | 라이트/다크 컨텍스트 (비즈니스 아님 → shared) |

## 규칙
- 도메인 지식 금지: "주문 상태 → 색" 같은 매핑은 여기 두지 않습니다(그건 entities).
- `ui/index.ts` 배럴로만 노출(킷이든 app-shared 든 출처를 숨겨 캡슐화).
- app-shared 프리미티브는 **킷과 같은 토큰**(`bg-card`, `border-border`, `shadow-xs` …)을 씁니다.

## 자주 헷갈리는 것
- **Card/Dialog 는 features 아닌가요?** 아니요. "로그인 기능"이 feature 이고, 거기 쓰이는 Card·Dialog 는 shared 입니다.
- **Card/Table 만 왜 직접 만들었나요?** 킷(0.2.0)에 그 둘이 없어서요. 킷에 추가되면 `shared/ui/index.ts` 한 줄만 교체합니다.
- **theme 이 왜 shared?** 테마 전환은 UI 인프라(범용)라서요. feature→shared 정방향으로 안전하게 쓰입니다.
