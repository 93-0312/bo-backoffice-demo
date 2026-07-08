import { useState, type FormEvent } from "react";
import { Button, Field, Input, Checkbox, Label } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { useAuth, DEMO_USER } from "../model/auth-context";

/**
 * LoginForm — "로그인하기" 행위의 UI (features/auth/ui).
 *
 * 킷 컴포넌트(Field/Input/Checkbox/Button)를 조합해 만든다. 폼 상태/검증/제출은
 * 이 feature 가 책임지고, 실제 인증은 model 의 useAuth().login 으로 위임한다.
 */
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [password, setPassword] = useState("admin1234");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="이메일" htmlFor="login-email" required>
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          invalid={!!error}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field
        label="비밀번호"
        htmlFor="login-password"
        required
        error={error ?? undefined}
      >
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          invalid={!!error}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={remember} onCheckedChange={setRemember} />
        <Label className="cursor-pointer">로그인 상태 유지</Label>
      </label>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "로그인 중…" : "로그인"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        데모 계정: <b>admin@example.com</b> / <b>admin1234</b>
      </p>
    </form>
  );
}
