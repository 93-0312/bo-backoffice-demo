import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/shared/hooks";
import { ApiError, boRequest, boJson, boSession, extractBearerToken } from "@/shared/api";
import type { UserRole } from "@/entities/user";

/**
 * 인증 상태/액션 (features/auth/model).
 *
 * 앱 진입 게이트. 두 가지 로그인 경로를 제공한다:
 *  1) 실 BO 로그인 — 아이디/비번 → OTP(2FA) → Bearer 토큰. 실서버 데이터 접근용.
 *  2) 둘러보기(데모) — 로그인 없이 mock 으로 앱을 여는 우회로(오프라인·교보재·CI 용).
 *
 * "로그인하기"는 사용자 행위 → feature. 표현 타입(역할)은 도메인이라 entities/user 참조.
 */
export interface AuthUser {
  name: string;
  email: string; // 데모: 이메일 / BO: loginId(표시용)
  role?: UserRole;
  userType?: string;
  loginId?: string;
  mode: "bo" | "demo";
}

const DEMO_USER: AuthUser = {
  name: "둘러보기",
  email: "demo@local",
  role: "admin",
  mode: "demo",
};

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  mode: "bo" | "demo" | null;
  /** 1단계: 자격 검증 + 로그인 → OTP QR 반환(있으면) */
  requestOtp: (loginId: string, password: string) => Promise<{ otpUrl?: string }>;
  /** 2단계: OTP 검증 → 토큰 저장 + 로그인 완료 */
  verifyOtp: (loginId: string, otpKey: string) => Promise<void>;
  /** 로그인 없이 데모(mock)로 진입 */
  enterDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LoginQrResponse {
  otpUrl?: string;
  authStatus?: number;
}
interface OtpLoginResponse {
  loginNm?: string;
  loginId?: string;
  userType?: string;
  referenceId?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUser, setUser] = useLocalStorage<AuthUser | null>("bo-auth-user", null);

  // BO 모드인데 세션 토큰이 없으면(탭 종료 등) 만료로 간주해 로그아웃 상태로 취급한다.
  const user = storedUser && storedUser.mode === "bo" && !boSession.get() ? null : storedUser;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      mode: user?.mode ?? null,

      async requestOtp(loginId, password) {
        // 1) 자격 검증 (성공 204)
        const validRes = await boRequest("/login/valid", {
          method: "POST",
          body: JSON.stringify({ loginId, loginPw: password, lang: "ko" }),
        });
        if (validRes.status >= 400) {
          const b = (validRes.data ?? {}) as { message?: string };
          throw new ApiError(b?.message ?? "아이디 또는 비밀번호가 올바르지 않습니다.", validRes.status);
        }
        // 2) 로그인 → OTP QR
        const login = await boJson<LoginQrResponse>("/login", {
          method: "POST",
          body: JSON.stringify({ loginId, loginPw: password, lang: "ko" }),
        });
        return { otpUrl: login?.otpUrl };
      },

      async verifyOtp(loginId, otpKey) {
        const res = await boRequest("/otpLogin", {
          method: "POST",
          body: JSON.stringify({ loginId, otpKey }),
        });
        if (res.status >= 400) {
          const b = (res.data ?? {}) as { message?: string };
          throw new ApiError(b?.message ?? "OTP 인증에 실패했습니다.", res.status);
        }
        const body = (res.data ?? {}) as OtpLoginResponse;
        const token = extractBearerToken(res, body);
        if (!token) {
          throw new ApiError(
            "로그인은 됐지만 응답에서 토큰을 찾지 못했습니다. 개발자도구 Network 에서 otpLogin 응답의 토큰 위치(헤더명)를 확인해 알려주세요.",
            500,
          );
        }
        boSession.set(token);
        setUser({
          name: body.loginNm ?? loginId,
          email: body.loginId ?? loginId,
          loginId: body.loginId ?? loginId,
          userType: body.userType,
          mode: "bo",
        });
      },

      enterDemo() {
        boSession.clear();
        setUser(DEMO_USER);
      },

      logout() {
        boSession.clear();
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
