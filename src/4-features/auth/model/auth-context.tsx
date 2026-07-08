import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/shared/hooks";
import { mockMutation, ApiError } from "@/shared/api";
import type { UserRole } from "@/entities/user";

/**
 * 인증 상태/액션 (features/auth/model).
 *
 * "로그인하기"는 사용자 행위 → feature. 로그인된 사용자의 표현 타입(역할 등)은
 * 도메인이므로 entities/user 의 타입을 가져다 쓴다(feature → entities, 정방향 import).
 *
 * 데모 계정: admin@example.com / admin1234
 */
export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

const DEMO_USER: AuthUser = { name: "김하늘", email: "admin@example.com", role: "admin" };

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<AuthUser | null>("bo-auth-user", null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      async login(email, password) {
        // 데모 인증: 고정 자격증명만 통과. 실패도 흉내 낸다.
        if (email.trim().toLowerCase() !== DEMO_USER.email || password !== "admin1234") {
          await mockMutation(null, { ms: 500 });
          throw new ApiError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
        }
        await mockMutation(null, { ms: 600 });
        setUser(DEMO_USER);
      },
      logout() {
        setUser(null);
      },
    }),
    [user, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 는 <AuthProvider> 안에서만 사용할 수 있습니다.");
  return ctx;
}

export { DEMO_USER };
