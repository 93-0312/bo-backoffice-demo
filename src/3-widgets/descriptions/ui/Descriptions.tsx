import type { ReactNode } from "react";
import { cn } from "@/shared/lib";

/**
 * Descriptions — 범용 키-값 상세 테이블 (widget).
 *
 * "라벨 | 값" 쌍을 2열 그리드로 보여주는 도메인 무관 표현 블록. 거래 정보/구매자 정보처럼
 * 상세 페이지에서 반복되는 레이아웃을 한 번만 구현해 재사용한다.
 * 어떤 항목을 보여줄지는 page 가 결정(items 주입).
 */
export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** 값이 한 행 전체를 차지(긴 텍스트용) */
  full?: boolean;
}

export function Descriptions({ items }: { items: DescriptionItem[] }) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-radius-lg border border-border sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn("flex border-b border-border", item.full && "sm:col-span-2")}
        >
          <div className="w-28 shrink-0 border-r border-border bg-muted px-3 py-2.5 text-xs font-medium text-muted-foreground">
            {item.label}
          </div>
          <div className="min-w-0 flex-1 break-all px-3 py-2.5 text-sm text-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
