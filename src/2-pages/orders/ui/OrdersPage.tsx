import { useMemo, useState } from "react";
import { Card, Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { formatCurrency, formatDateTime } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, applySort, type Column, type SortState } from "@/widgets/data-table";
import { useFilters } from "@/widgets/filter-bar";
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
  // 필터 UI 는 탭이지만 "값"은 useFilters 가 소유 — persist:"memory" 로
  // 방문 탭/메뉴 재진입 시 선택한 상태가 유지되고 새로고침 시 초기화된다.
  const { values, setValue } = useFilters({
    defaults: { status: "all" },
    persist: "memory",
    storageKey: "orders",
  });
  const status = values.status as OrderStatus | "all";
  const [sort, setSort] = useState<SortState | null>(null);

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
      sortKey: "createdAt",
      sortAccessor: (o) => o.createdAt,
    },
    {
      header: "고객",
      cell: (o) => <span className="text-sm">{o.customerName}</span>,
      sortKey: "customerName",
      sortAccessor: (o) => o.customerName,
    },
    {
      header: "수량",
      align: "right",
      cell: (o) => <span className="text-sm tabular-nums">{o.itemCount}개</span>,
      sortKey: "itemCount",
      sortAccessor: (o) => o.itemCount,
    },
    {
      header: "금액",
      align: "right",
      cell: (o) => <span className="text-sm font-medium tabular-nums">{formatCurrency(o.total)}</span>,
      sortKey: "total",
      sortAccessor: (o) => o.total,
    },
    { header: "상태", cell: (o) => <OrderStatusBadge status={o.status} /> },
    {
      header: "변경",
      align: "right",
      cell: (o) => <OrderStatusUpdater order={o} onUpdated={applyUpdate} />,
    },
  ];

  const sortedOrders = useMemo(() => applySort(orders, sort, columns), [orders, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="주문" description="주문 상태를 추적하고 전이 규칙에 따라 변경합니다." />
      <Card>
        <Tabs
          value={status}
          onValueChange={(v) => setValue("status", v)}
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
          storageKey="orders"
          columns={columns}
          rows={sortedOrders}
          loading={isLoading}
          getRowKey={(o) => o.id}
          emptyMessage="해당 상태의 주문이 없습니다."
          sort={sort}
          onSortChange={setSort}
        />
      </Card>
    </div>
  );
}
