import { Link } from "react-router-dom";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config";

/** NotFoundPage — 매칭되는 라우트가 없을 때 (page). */
export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-5xl font-bold text-primary">404</p>
        <p className="text-sm text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
        <Link to={ROUTES.dashboard}>
          <Button>대시보드로</Button>
        </Link>
      </div>
    </div>
  );
}
