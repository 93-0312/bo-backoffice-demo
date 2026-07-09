import { useState, type FormEvent } from "react";
import { Button, Field, Input, Alert } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { useAuth } from "../model/auth-context";

/**
 * LoginForm — 실 BO 로그인(2단계) + 둘러보기 우회로 (features/auth/ui).
 *
 * 1단계: 아이디/비밀번호 → requestOtp (자격검증 + OTP 발급)
 * 2단계: OTP 코드 → verifyOtp (Bearer 토큰 저장 + 로그인 완료)
 * 하단: "로그인 없이 둘러보기" → enterDemo (mock 으로 앱 진입)
 *
 * 폼 상태/단계 전환은 이 feature 가 책임지고, 실제 인증은 model 의 useAuth 로 위임한다.
 */
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { requestOtp, verifyOtp, enterDemo } = useAuth();
  const [stage, setStage] = useState<"creds" | "otp">("creds");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [otpKey, setOtpKey] = useState("");
  const [otpUrl, setOtpUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitCreds(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await requestOtp(loginId.trim(), password);
      setOtpUrl(res.otpUrl);
      setStage("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function submitOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await verifyOtp(loginId.trim(), otpKey.trim());
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "OTP 인증에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {stage === "creds" ? (
        <form onSubmit={submitCreds} className="flex flex-col gap-4" noValidate>
          <Field label="아이디" htmlFor="login-id" required>
            <Input
              id="login-id"
              autoComplete="username"
              placeholder="loginId"
              value={loginId}
              invalid={!!error}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </Field>
          <Field label="비밀번호" htmlFor="login-pw" required error={error ?? undefined}>
            <Input
              id="login-pw"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              invalid={!!error}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" disabled={pending || !loginId || !password} className="w-full">
            {pending ? "확인 중…" : "로그인"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="flex flex-col gap-4" noValidate>
          {otpUrl && (
            <div className="flex flex-col items-center gap-2 rounded-radius-lg bg-muted p-3">
              <img
                src={`data:image/png;base64,${otpUrl}`}
                alt="OTP 등록 QR"
                className="size-32"
              />
              <p className="text-center text-xs text-muted-foreground">
                OTP 미등록 시 인증 앱으로 스캔 후 코드를 입력하세요.
              </p>
            </div>
          )}
          <Field label="OTP 코드" htmlFor="login-otp" required error={error ?? undefined}>
            <Input
              id="login-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6자리 코드"
              value={otpKey}
              invalid={!!error}
              onChange={(e) => setOtpKey(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStage("creds");
                setOtpKey("");
                setError(null);
              }}
              disabled={pending}
            >
              뒤로
            </Button>
            <Button type="submit" size="lg" disabled={pending || otpKey.length < 6} className="flex-1">
              {pending ? "인증 중…" : "인증"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        또는
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          enterDemo();
          onSuccess?.();
        }}
      >
        로그인 없이 둘러보기 (데모)
      </Button>

      {stage === "creds" && (
        <Alert type="info" title="실 BO(dev) 로그인은 OTP(2FA)가 필요합니다">
          계정이 없거나 오프라인이면 "둘러보기"로 mock 데이터를 볼 수 있어요.
        </Alert>
      )}
    </div>
  );
}
