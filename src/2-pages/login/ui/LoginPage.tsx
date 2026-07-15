import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Alert, Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { LoginForm } from "@/features/auth";

/**
 * LoginPage — 라우트 `/login` 한 장 (page).
 *
 * page 는 "조립과 라우팅"만 한다: 화면 레이아웃을 잡고, feature(LoginForm)를 배치하고,
 * 성공 시 원래 가려던 곳(또는 대시보드)으로 이동시킨다. 폼/인증 로직은 feature 안에 있다.
 * 세션 만료로 쫓겨온 경우(?reason=session-expired — shared/api 인터셉터가 붙임) 안내를 띄운다.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard;
  const sessionExpired = searchParams.get("reason") === "session-expired";

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid size-11 place-items-center rounded-radius-lg bg-primary text-base font-bold text-primary-foreground">
            BO
          </span>
          <h1 className="text-lg font-semibold">백오피스 로그인</h1>
          <p className="text-sm text-muted-foreground">FSD 데모 관리자 콘솔</p>
        </div>
        {sessionExpired && (
          <Alert type="warning" title="세션이 만료되었습니다" className="mb-4">
            보안을 위해 로그아웃되었어요. 다시 로그인해 주세요.
          </Alert>
        )}
        <Card>
          <CardContent className="p-6">
            <LoginForm onSuccess={() => navigate(from, { replace: true })} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
