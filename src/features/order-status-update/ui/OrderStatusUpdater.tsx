import { useState } from "react";
import { Button } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import {
  updateOrderStatus,
  nextStatuses,
  ORDER_STATUS_LABEL,
  type Order,
} from "@/entities/order";

/**
 * OrderStatusUpdater — "주문 상태 변경하기" 행위(feature).
 *
 * 도메인 규칙(전이 그래프)을 entities/order.nextStatuses 로 읽어, "지금 갈 수 있는
 * 다음 상태"만 버튼으로 노출한다. 종료 상태(배송완료/취소)면 안내만 표시.
 * 실제 변경/검증은 entities/order.updateOrderStatus 가 책임진다.
 */
export function OrderStatusUpdater({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated?: (order: Order) => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const options = nextStatuses(order.status);

  async function move(to: Order["status"]) {
    setPending(to);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, to);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "변경에 실패했습니다.");
    } finally {
      setPending(null);
    }
  }

  if (options.length === 0) {
    return <span className="text-xs text-muted-foreground">변경 불가 (종료 상태)</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {options.map((to) => (
          <Button
            key={to}
            size="xs"
            variant={to === "cancelled" ? "destructive-tinted" : "outline"}
            disabled={pending !== null}
            onClick={() => move(to)}
          >
            {pending === to ? "처리 중…" : `${ORDER_STATUS_LABEL[to]}(으)로`}
          </Button>
        ))}
      </div>
      {error && <span className="text-xs text-destructive-foreground">{error}</span>}
    </div>
  );
}
