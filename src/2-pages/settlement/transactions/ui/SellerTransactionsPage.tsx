import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, type SelectOption } from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import { DownloadButton } from "@/widgets/query-filters";
import { FilterBar, useFilters, type FilterDef, type DateRangeValue } from "@/widgets/filter-bar";
import {
  useSellerTransactionsQuery,
  SellerTxTypeBadge,
  SellerTxStateBadge,
  SELLER_TX_TYPE_LABEL,
  SELLER_TX_STATE_LABEL,
  type SellerTransaction,
  type SellerTxType,
  type SellerTxState,
} from "@/entities/seller-transaction";

/**
 * SellerTransactionsPage — "셀러 > 분할정산 > 거래내역" (page).
 * STID 단위 셀러 거래내역. 필터는 스키마(defs) + useFilters(memory — 재방문 유지).
 */
const TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "거래 유형 전체" },
  ...(Object.keys(SELLER_TX_TYPE_LABEL) as SellerTxType[]).map((t) => ({ value: t, label: SELLER_TX_TYPE_LABEL[t] })),
];
const STATE_OPTIONS: SelectOption[] = [
  { value: "all", label: "거래 상태 전체" },
  ...(Object.keys(SELLER_TX_STATE_LABEL) as SellerTxState[]).map((s) => ({ value: s, label: SELLER_TX_STATE_LABEL[s] })),
];

const FILTER_DEFS: FilterDef[] = [
  { type: "dateRange", key: "period" },
  { type: "select", key: "type", options: TYPE_OPTIONS, className: "w-36" },
  { type: "select", key: "state", options: STATE_OPTIONS, className: "w-36" },
  { type: "search", key: "keyword", placeholder: "STID · SID · 셀러명 · TID 검색", className: "max-w-xs" },
  { type: "checkbox", key: "excludePayverse", label: "페이버스 결제 제외" },
];

export function SellerTransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { values, debouncedValues, setValue, reset, isDirty } = useFilters({
    defaults: {
      period: { from: null, to: null } as DateRangeValue,
      type: "all",
      state: "all",
      keyword: "",
      excludePayverse: false,
    },
    persist: "memory",
    storageKey: "settlement-seller-transactions",
    debounceKeys: ["keyword"],
  });

  const { data, isLoading } = useSellerTransactionsQuery({
    keyword: debouncedValues.keyword,
    type: debouncedValues.type as SellerTxType | "all",
    state: debouncedValues.state as SellerTxState | "all",
    excludePayverse: debouncedValues.excludePayverse,
  });

  useEffect(() => setPage(1), [debouncedValues, pageSize]);

  const list: SellerTransaction[] = data ?? [];
  const paged = list.slice((page - 1) * pageSize, page * pageSize);
  const startNo = (page - 1) * pageSize;

  const columns: Column<SellerTransaction>[] = [
    { header: "NO", cell: (t) => <span className="text-sm text-muted-foreground">{startNo + paged.indexOf(t) + 1}</span> },
    { header: "STID", cell: (t) => <span className="font-mono text-sm text-primary">{t.stid}</span> },
    { header: "거래일시", cell: (t) => <span className="text-sm">{t.transactedAt}</span> },
    { header: "셀러주문ID", cell: (t) => <span className="text-sm">{t.sellerOrderId}</span> },
    { header: "SID", cell: (t) => <span className="text-sm">{t.sid}</span> },
    { header: "셀러명", cell: (t) => <span className="text-sm">{t.sellerName}</span> },
    { header: "가맹점ID", cell: (t) => <span className="text-sm">{t.mid}</span> },
    { header: "가맹점명", cell: (t) => <span className="text-sm">{t.midName}</span> },
    { header: "TID", cell: (t) => <span className="font-mono text-sm">{t.tid}</span> },
    { header: "주문ID", cell: (t) => <span className="text-sm">{t.orderId}</span> },
    { header: "거래 유형", cell: (t) => <SellerTxTypeBadge type={t.type} /> },
    { header: "거래 상태", cell: (t) => <SellerTxStateBadge state={t.state} /> },
    { header: "통화", cell: (t) => <span className="text-sm">{t.currency}</span> },
    { header: "금액", align: "right", cell: (t) => <span className="text-sm font-medium tabular-nums">{formatNumber(t.amount)}.00</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="셀러 > 분할정산 > 거래내역"
        description="STID 단위 셀러 거래내역을 조회합니다."
        actions={<DownloadButton />}
      />
      <Card>
        <FilterBar
          defs={FILTER_DEFS}
          values={values}
          onChange={setValue}
          onReset={reset}
          dirty={isDirty}
          note="최대 검색가능 기간: 1개월"
        />
        <DataTable
          storageKey="settlement-seller-transactions"
          columns={columns}
          rows={paged}
          loading={isLoading}
          getRowKey={(t) => t.id}
          onRowClick={(t) => navigate(ROUTES.sellerTransactionDetail(t.tid))}
          emptyMessage="조건에 맞는 거래내역이 없습니다."
        />
        <Pagination
          total={list.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
