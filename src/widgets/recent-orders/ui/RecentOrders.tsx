import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatCurrency, formatRelativeTime } from "@/shared/lib";
import { fetchOrders, OrderStatusBadge, type Order } from "@/entities/order";

/**
 * RecentOrders — 대시보드의 "최근 주문" 위젯.
 * entities/order 에서 데이터를 받아 카드 리스트로 보여준다. 표현(상태색)은
 * entities 의 OrderStatusBadge 를 재사용 → widget 은 레이아웃만 책임진다.
 */
export function RecentOrders({ limit = 5 }: { limit?: number }) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchOrders().then((data) => alive && setOrders(data.slice(0, limit)));
    return () => {
      alive = false;
    };
  }, [limit]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>최근 주문</CardTitle>
        <Link to={ROUTES.orders} className="text-xs font-medium text-primary hover:underline">
          전체 보기
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col">
        {orders === null
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-t border-border py-3 first:border-t-0">
                <Skeleton className="h-4 w-40 rounded-radius-sm" />
                <Skeleton className="h-5 w-16 rounded-radius-full" />
              </div>
            ))
          : orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.id} · {formatRelativeTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums">{formatCurrency(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
