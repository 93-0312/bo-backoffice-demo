import { useEffect, useState } from "react";
import { Card, Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { useDebouncedValue } from "@/shared/hooks";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import {
  usePgTransactionsQuery,
  PgTransactionStatusBadge,
  type PgTransaction,
} from "@/entities/pg-transaction";

/**
 * PgTransactionsPage — 라우트 `/pg-transactions` (page).
 *
 * 구 BO 거래내역 API(`/admin/transaction/listData`) 계약을 그대로 쓰는 목록 화면.
 * page 가 조회 파라미터(검색·상태·페이지) 상태를 소유하고, entities api 로 조회한 뒤
 * widget(page-header·data-table·pagination)으로 조립한다.
 */
const STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "전체 상태" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "PENDING", label: "PENDING" },
  { value: "FAILED", label: "FAILED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

const columns: Column<PgTransaction>[] = [
  {
    header: "거래번호",
    cell: (t) => (
      // 거래번호 클릭 → 상세를 새 "창"(팝업)으로 오픈 (구 BO 동작 재현: window.open _blank)
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.open(
            ROUTES.pgTransactionDetail(t.transactId),
            `tx_${t.transactId}`,
            "width=1400,height=900,resizable=yes,scrollbars=yes",
          );
        }}
        className="cursor-pointer font-mono text-xs text-primary underline-offset-2 hover:underline"
      >
        {t.transactId}
      </button>
    ),
  },
  { header: "거래일시", cell: (t) => <span className="text-sm">{t.transactDate}</span> },
  {
    header: "가맹점",
    cell: (t) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{t.merchantName}</p>
        <p className="truncate text-xs text-muted-foreground">{t.merchantId}</p>
      </div>
    ),
  },
  {
    header: "주문번호",
    cell: (t) => <span className="font-mono text-xs">{t.transactOrderId}</span>,
  },
  { header: "유형", cell: (t) => <span className="text-sm">{t.transactTypeName}</span> },
  { header: "결제수단", cell: (t) => <span className="text-sm">{t.transactSchemeName}</span> },
  { header: "결제 방식", cell: (t) => <span className="text-sm">{t.methodDisplayName}</span> },
  {
    header: "금액",
    align: "right",
    cell: (t) => (
      <span className="text-sm font-medium tabular-nums">
        {formatNumber(t.transactProcessAmount)} {t.transactProcessCurrency}
      </span>
    ),
  },
  {
    header: "상태",
    cell: (t) => <PgTransactionStatusBadge status={t.transactStatusName} />,
  },
  {
    header: "국가",
    cell: (t) => (
      <span className="text-sm">
        {t.transCountryNm}
        <span className="ml-1 text-xs text-muted-foreground">({t.transCountryCd})</span>
      </span>
    ),
  },
  {
    header: "카드번호",
    cell: (t) => (
      <span className="font-mono text-xs text-muted-foreground">{t.transactCardNo || "-"}</span>
    ),
  },
  {
    header: "고객 ID",
    cell: (t) => <span className="font-mono text-xs">{t.customerId}</span>,
  },
];

export function PgTransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebouncedValue(search, 300);

  // 검색/상태/페이지 크기 변경 시 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, pageSize]);

  // 데이터 로딩/캐싱/재조회는 TanStack Query 가 담당 (파라미터 변경 시 자동 재조회).
  const { data, isLoading } = usePgTransactionsQuery({
    search: debouncedSearch,
    result: status,
    page,
    rows: pageSize,
    locale: "ko",
  });
  const rows: PgTransaction[] = data?.list ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="거래내역"
        description="구 BO 거래내역 API(/admin/transaction/listData) 계약으로 조회하는 목록입니다."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <Input
            leftIcon={<IconSearch />}
            placeholder="가맹점명 · 주문번호 · 거래번호 · 고객ID 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="min-w-64 flex-1"
          />
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onValueChange={setStatus}
            className="w-40"
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          getRowKey={(t) => t.transactId}
          emptyMessage="거래내역이 없습니다."
        />

        <Pagination
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
