import { cn } from "@/shared/lib";
import { LOW_STOCK_THRESHOLD } from "../model/types";

/**
 * StockIndicator — 재고 수량 + 부족/품절 색 경고.
 * "임계치 이하 = 경고" 라는 도메인 규칙(LOW_STOCK_THRESHOLD)을 반영한다.
 */
export function StockIndicator({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "text-destructive-foreground"
      : stock <= LOW_STOCK_THRESHOLD
        ? "text-warning-foreground"
        : "text-foreground";
  return (
    <span className={cn("tabular-nums text-sm font-medium", tone)}>
      {stock.toLocaleString("ko-KR")}개
      {stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
        <span className="ml-1 text-xs">· 부족</span>
      )}
    </span>
  );
}
