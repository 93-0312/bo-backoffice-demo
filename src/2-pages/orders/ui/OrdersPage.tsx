import { useState } from "react";
import { Card, Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { formatCurrency, formatDateTime } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { OrderStatusUpdater } from "@/features/order-status-update";
import {
  useOrdersQuery,
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

  const { data, isLoading, refetch } = useOrdersQuery(status);
  const orders: Order[] = data ?? [];

  // 상태 변경(feature mutation) 후 서버 기준으로 재조회 (필터에서 벗어난 행 자동 반영)
  const applyUpdate = () => void refetch();

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
          rows={orders}
          loading={isLoading}
          getRowKey={(o) => o.id}
          emptyMessage="해당 상태의 주문이 없습니다."
        />
      </Card>
    </div>
  );
}
