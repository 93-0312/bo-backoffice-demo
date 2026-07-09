import { useEffect, useMemo, useState } from "react";
import { Card, Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { useDebouncedValue } from "@/shared/hooks";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import {
  fetchPgTransactions,
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
    cell: (t) => <span className="font-mono text-xs text-primary">{t.transactId}</span>,
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
  const [rows, setRows] = useState<PgTransaction[] | null>(null);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebouncedValue(search, 300);

  // 검색/상태/페이지 크기 변경 시 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, pageSize]);

  useEffect(() => {
    let alive = true;
    setRows(null);
    fetchPgTransactions({
      search: debouncedSearch,
      result: status,
      page,
      rows: pageSize,
      locale: "ko",
    }).then((res) => {
      if (!alive) return;
      setRows(res.list);
      setTotal(res.count);
    });
    return () => {
      alive = false;
    };
  }, [debouncedSearch, status, page, pageSize]);

  const description = useMemo(
    () => "구 BO 거래내역 API(/admin/transaction/listData) 계약으로 조회하는 목록입니다.",
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="거래내역" description={description} />

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
          rows={rows ?? []}
          loading={rows === null}
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
