import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatCurrency } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, applySort, type Column, type SortState } from "@/widgets/data-table";
import {
  useTransactionsQuery,
  TransactionResultBadge,
  PAYMENT_TYPE_LABEL,
  type Transaction,
} from "@/entities/transaction";

/**
 * TransactionsPage — 라우트 `/transactions` (page).
 * 거래 목록. 행 클릭 시 거래 상세(`/transactions/:id`)로 이동한다.
 */
export function TransactionsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useTransactionsQuery();
  const rows: Transaction[] = data ?? [];

  const [sort, setSort] = useState<SortState | null>(null);

  const columns: Column<Transaction>[] = [
    {
      header: "거래번호 (TID)",
      cell: (t) => <span className="font-mono text-sm text-primary">{t.tid}</span>,
    },
    {
      header: "거래일시",
      cell: (t) => <span className="text-sm">{t.transactedAt}</span>,
      sortKey: "transactedAt",
      sortAccessor: (t) => t.transactedAt,
    },
    { header: "MID명", cell: (t) => <span className="text-sm">{t.midName}</span> },
    {
      header: "결제유형",
      cell: (t) => <span className="text-sm">{PAYMENT_TYPE_LABEL[t.paymentType]}</span>,
    },
    { header: "결과", cell: (t) => <TransactionResultBadge result={t.result} /> },
    {
      header: "금액",
      align: "right",
      cell: (t) => (
        <span className="text-sm font-medium tabular-nums">
          {formatCurrency(t.amount)} {t.currency}
        </span>
      ),
      sortKey: "amount",
      sortAccessor: (t) => t.amount,
    },
  ];

  const sortedRows = useMemo(() => applySort(rows, sort, columns), [rows, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="거래" description="결제 거래 내역을 조회하고 상세로 진입합니다." />
      <Card>
        <DataTable
          storageKey="transactions"
          columns={columns}
          rows={sortedRows}
          loading={isLoading}
          getRowKey={(t) => t.id}
          onRowClick={(t) => navigate(ROUTES.transactionDetail(t.id))}
          emptyMessage="거래가 없습니다."
          sort={sort}
          onSortChange={setSort}
        />
      </Card>
    </div>
  );
}
