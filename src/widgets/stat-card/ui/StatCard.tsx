import type { ComponentType, SVGProps } from "react";
import { Card, CardContent, Badge } from "@/shared/ui";
import { IconArrowUp, IconArrowDown } from "@/shared/ui";
import { cn } from "@/shared/lib";

/**
 * StatCard — 대시보드 KPI 카드 (widget).
 * shared 의 Card/Badge/아이콘을 조립한 표현 전용 블록. 값/추세는 page 가 주입한다.
 */
export interface StatCardProps {
  label: string;
  value: string;
  /** 전기 대비 증감률(%). 양수=상승, 음수=하락 */
  delta?: number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          {delta !== undefined && (
            <Badge color={up ? "success" : "destructive"} variant="tinted" className="mt-2 inline-flex items-center gap-1">
              {up ? <IconArrowUp className="size-3" /> : <IconArrowDown className="size-3" />}
              {Math.abs(delta)}%
            </Badge>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-radius-lg bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
