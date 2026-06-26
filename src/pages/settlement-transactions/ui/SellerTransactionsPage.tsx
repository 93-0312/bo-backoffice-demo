import { useEffect, useState } from "react";
import { Card, Select, Input, Checkbox, Label, type SelectOption } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { formatNumber } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import { FilterBar, DownloadButton, DateRangeField, type DateRange } from "@/widgets/query-filters";
import { RefundButton } from "@/features/seller-refund";
import {
  fetchSellerTransactions,
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
 * STID 단위 셀러 거래내역. '페이버스 결제 제외' 토글·유형/상태 필터가 동작한다.
 */
const TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "거래 유형 전체" },
  ...(Object.keys(SELLER_TX_TYPE_LABEL) as SellerTxType[]).map((t) => ({ value: t, label: SELLER_TX_TYPE_LABEL[t] })),
];
const STATE_OPTIONS: SelectOption[] = [
  { value: "all", label: "거래 상태 전체" },
  ...(Object.keys(SELLER_TX_STATE_LABEL) as SellerTxState[]).map((s) => ({ value: s, label: SELLER_TX_STATE_LABEL[s] })),
];
const EMPTY_RANGE: DateRange = { from: "", to: "" };

export function SellerTransactionsPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<SellerTxType | "all">("all");
  const [state, setState] = useState<SellerTxState | "all">("all");
  const [excludePayverse, setExcludePayverse] = useState(false);
  const [range, setRange] = useState<DateRange>(EMPTY_RANGE);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<SellerTransaction[] | null>(null);
  const [version, setVersion] = useState(0);
  const debounced = useDebouncedValue(keyword, 300);

  useEffect(() => {
    let alive = true;
    setRows(null);
    fetchSellerTransactions({ keyword: debounced, type, state, excludePayverse }).then(
      (d) => alive && setRows(d),
    );
    return () => {
      alive = false;
    };
  }, [debounced, type, state, excludePayverse, version]);

  useEffect(() => setPage(1), [debounced, type, state, excludePayverse, range, pageSize]);

  const list = rows ?? [];
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
    {
      header: "환불",
      align: "right",
      cell: (t) => <RefundButton tid={t.tid} onRefunded={() => setVersion((v) => v + 1)} />,
    },
  ];

  function reset() {
    setKeyword("");
    setType("all");
    setState("all");
    setExcludePayverse(false);
    setRange(EMPTY_RANGE);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="셀러 > 분할정산 > 거래내역"
        description="STID 단위 셀러 거래내역을 조회합니다."
        actions={<DownloadButton />}
      />
      <Card>
        <FilterBar onReset={reset} note="최대 검색가능 기간: 1개월">
          <DateRangeField value={range} onChange={setRange} />
          <Select options={TYPE_OPTIONS} value={type} onValueChange={(v) => setType(v as SellerTxType | "all")} className="w-36" />
          <Select options={STATE_OPTIONS} value={state} onValueChange={(v) => setState(v as SellerTxState | "all")} className="w-36" />
          <Input
            placeholder="STID · SID · 셀러명 · TID 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            containerClassName="w-full max-w-xs"
          />
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={excludePayverse} onCheckedChange={setExcludePayverse} />
            <Label className="cursor-pointer">페이버스 결제 제외</Label>
          </label>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={paged}
          loading={rows === null}
          getRowKey={(t) => t.id}
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
