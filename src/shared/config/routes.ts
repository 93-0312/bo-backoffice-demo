/**
 * 라우트 경로 상수 (shared/config).
 *
 * 문자열 경로를 한 곳에 모아 오타/중복을 막는다. pages·widgets·features 가 공통 참조.
 * 동적 경로는 빌더 함수로 제공한다(타입 안전).
 */
export const ROUTES = {
  login: "/login",
  dashboard: "/",
  users: "/users",
  userDetail: (id: string | number = ":id") => `/users/${id}`,
  products: "/products",
  orders: "/orders",
  settings: "/settings",
} as const;
