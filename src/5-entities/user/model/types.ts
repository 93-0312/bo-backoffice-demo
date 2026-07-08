/**
 * User 도메인 타입 (entities/user/model).
 *
 * entities 는 "비즈니스 대상(명사)" 다. 여기엔 User 가 무엇인지(필드/상태/역할)만 정의하고,
 * "로그인하기" 같은 행위는 두지 않는다(그건 features).
 */
export type UserRole = "admin" | "manager" | "staff";
export type UserStatus = "active" | "invited" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  /** 가입 ISO 일시 */
  createdAt: string;
  /** 마지막 로그인 ISO 일시 (없으면 미접속) */
  lastActiveAt?: string;
}

/** 역할 → 한글 라벨 (도메인 지식이라 entities 에 둔다) */
export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: "관리자",
  manager: "매니저",
  staff: "스태프",
};

/** 상태 → 한글 라벨 */
export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "활성",
  invited: "초대됨",
  suspended: "정지",
};
