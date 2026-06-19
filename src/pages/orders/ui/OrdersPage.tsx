import { useEffect, useState } from "react";
import { Card, Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { formatCurrency, formatDateTime } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { OrderStatusUpdater } from "@/features/order-status-update";
import {
  fetchOrders,
  OrderStatusBadge,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/entities/order";

/**
 * OrdersPage — 라우트 `/orders` (page).
 *
 * 상태 필터 + 주문 테이블. 각 행의 액션 컬럼에 features/order-status-update 를 끼워,
 * 도메인 전이 규칙에 맞는 버튼만 노출한다. 변경 결과는 로컬 행에 즉시 반영.
 */
const STATUS_TABS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let alive = true;
    setOrders(null);
    fetchOrders(status).then((d) => alive && setOrders(d));
    return () => {
      alive = false;
    };
  }, [status]);

  function applyUpdate(updated: Order) {
    setOrders((prev) =>
      prev
        ? prev
            // 현재 필터에서 벗어난 상태면 목록에서 제거, 아니면 갱신
            .map((o) => (o.id === updated.id ? updated : o))
            .filter((o) => status === "all" || o.status === status)
        : prev,
    );
  }

  const columns: Column<Order>[] = [
    {
      header: "주문번호",
      cell: (o) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-medium">{o.id}</p>
          <p className="truncate text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</p>
        </div>
      ),
    },
    { header: "고객", cell: (o) => <span className="text-sm">{o.customerName}</span> },
    { header: "수량", align: "right", cell: (o) => <span className="text-sm tabular-nums">{o.itemCount}개</span> },
    { header: "금액", align: "right", cell: (o) => <span className="text-sm font-medium tabular-nums">{formatCurrency(o.total)}</span> },
    { header: "상태", cell: (o) => <OrderStatusBadge status={o.status} /> },
    {
      header: "변경",
      align: "right",
      cell: (o) => <OrderStatusUpdater order={o} onUpdated={applyUpdate} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="주문" description="주문 상태를 추적하고 전이 규칙에 따라 변경합니다." />
      <Card>
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | "all")}
          className="p-4 pb-0"
        >
          <TabsList>
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "전체" : ORDER_STATUS_LABEL[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <DataTable
          columns={columns}
          rows={orders ?? []}
          loading={orders === null}
          getRowKey={(o) => o.id}
          emptyMessage="해당 상태의 주문이 없습니다."
        />
      </Card>
    </div>
  );
}
