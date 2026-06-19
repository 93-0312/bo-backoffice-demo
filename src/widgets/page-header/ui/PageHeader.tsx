import type { ReactNode } from "react";

/**
 * PageHeader — 모든 페이지 상단의 제목/설명/액션 영역 (widget).
 * 페이지마다 같은 레이아웃을 보장하는 재사용 블록. actions 슬롯에 feature 버튼을 꽂는다.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
