/**
 * 라우트 경로 상수 (shared/config).
 *
 * 문자열 경로를 한 곳에 모아 오타/중복을 막는다. pages·widgets·features 가 공통 참조.
 * 동적 경로는 빌더 함수로 제공한다(타입 안전).
 */
export const ROUTES = {
  login: "/login",
  /** 기본 진입 화면 — 리뉴얼 대시보드 */
  dashboard: "/",
  /** 리뉴얼 이전 대시보드 (교보재 원본) */
  dashboardLegacy: "/dashboard-legacy",
  users: "/users",
  userDetail: (id: string | number = ":id") => `/users/${id}`,
  products: "/products",
  orders: "/orders",
  transactions: "/transactions",
  transactionDetail: (id: string = ":id") => `/transactions/${id}`,
  // 분할정산
  sidList: "/settlement/sids",
  sellerTransactions: "/settlement/transactions",
  sellerTransactionDetail: (tid: string = ":tid") => `/settlement/transactions/${tid}`,
  settlementList: "/settlement/list",
  smeSettlements: "/settlement/sme",
  settings: "/settings",
} as const;
