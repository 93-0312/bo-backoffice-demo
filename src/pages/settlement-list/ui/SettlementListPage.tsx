import { useEffect, useState } from "react";
import { Card, Select, Input, type SelectOption } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { formatNumber } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import { FilterBar, DownloadButton, DateRangeField, type DateRange } from "@/widgets/query-filters";
import {
  fetchSettlements,
  MerchantStatusBadge,
  SettlementStateBadge,
  SETTLEMENT_TYPE_LABEL,
  SETTLEMENT_STATE_LABEL,
  type Settlement,
  type SettlementState,
} from "@/entities/settlement";

/**
 * SettlementListPage — "정산 리스트" / "영중소 정산서 목록" (page).
 *
 * 두 화면은 컬럼만 다른 같은 정산 레코드라 `sme` 플래그로 분기한다.
 * (정산 리스트=지급보류금·R/R, 영중소=그룹ID·영중소 지급보류금)
 */
const STATE_OPTIONS: SelectOption[] = [
  { value: "all", label: "정산 상태 전체" },
  ...(Object.keys(SETTLEMENT_STATE_LABEL) as SettlementState[]).map((s) => ({
    value: s,
    label: SETTLEMENT_STATE_LABEL[s],
  })),
];
const EMPTY_RANGE: DateRange = { from: "", to: "" };

export function SettlementListPage({ sme = false }: { sme?: boolean }) {
  const [keyword, setKeyword] = useState("");
  const [state, setState] = useState<SettlementState | "all">("all");
  const [range, setRange] = useState<DateRange>(EMPTY_RANGE);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Settlement[] | null>(null);
  const debounced = useDebouncedValue(keyword, 300);

  useEffect(() => {
    let alive = true;
    setRows(null);
    fetchSettlements({ keyword: debounced, state, sme }).then((d) => alive && setRows(d));
    return () => {
      alive = false;
    };
  }, [debounced, state, sme]);

  useEffect(() => setPage(1), [debounced, state, range, pageSize, sme]);

  const list = rows ?? [];
  const paged = list.slice((page - 1) * pageSize, page * pageSize);
  const startNo = (page - 1) * pageSize;

  const money = (n: number) => <span className="text-sm tabular-nums">{formatNumber(n)}.00</span>;

  const columns: Column<Settlement>[] = [
    { header: "NO", cell: (s) => <span className="text-sm text-muted-foreground">{startNo + paged.indexOf(s) + 1}</span> },
    { header: "MID", cell: (s) => <span className="text-sm">{s.mid}</span> },
    { header: "가맹점명", cell: (s) => <span className="text-sm">{s.merchantName}</span> },
    ...(sme
      ? [{ header: "그룹ID", cell: (s: Settlement) => <span className="font-mono text-sm text-primary">{s.groupId}</span> }]
      : []),
    { header: "가맹점 상태", cell: (s) => <MerchantStatusBadge status={s.merchantStatus} /> },
    { header: "셀러 정산유형", cell: (s) => <span className="text-sm">{SETTLEMENT_TYPE_LABEL[s.settlementType]}</span> },
    { header: "셀러 수", align: "right", cell: (s) => <span className="text-sm tabular-nums">{s.sellerCount}</span> },
    { header: "정산 회차", align: "right", cell: (s) => <span className="text-sm tabular-nums">{s.round}</span> },
    { header: "정산일자", cell: (s) => <span className="text-sm text-muted-foreground">{s.settledAt}</span> },
    { header: "거래통화", cell: (s) => <span className="text-sm">{s.txCurrency}</span> },
    { header: "정산금액", align: "right", cell: (s) => money(s.settlementAmount) },
    { header: "정산 통화", cell: (s) => <span className="text-sm">{s.settlementCurrency}</span> },
    { header: "확정 정산금액", align: "right", cell: (s) => <span className="text-sm font-medium tabular-nums">{formatNumber(s.confirmedAmount)}.00</span> },
    { header: "정산 상태", cell: (s) => <SettlementStateBadge state={s.state} /> },
    {
      header: sme ? "영중소 지급보류금" : "지급보류금",
      align: "right",
      cell: (s) =>
        s.holdAmount > 0 ? (
          <span className="text-sm font-medium tabular-nums text-destructive-foreground">{formatNumber(s.holdAmount)}.00</span>
        ) : (
          <span className="text-sm tabular-nums text-muted-foreground">0.00</span>
        ),
    },
  ];

  function reset() {
    setKeyword("");
    setState("all");
    setRange(EMPTY_RANGE);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={sme ? "영중소 정산서 목록" : "셀러 > 분할정산 > 정산 리스트"}
        description={sme ? "영중소(SME) 정산서를 조회합니다." : "가맹점·셀러별 정산 현황을 조회합니다."}
        actions={<DownloadButton />}
      />
      <Card>
        <FilterBar
          onReset={reset}
          note={sme ? "정산지급일 기준 최대 12개월 조회 가능합니다." : "최대 검색가능 기간: 12개월"}
        >
          <DateRangeField value={range} onChange={setRange} />
          <Select options={STATE_OPTIONS} value={state} onValueChange={(v) => setState(v as SettlementState | "all")} className="w-36" />
          <Input
            placeholder={sme ? "MID · 가맹점명 · 그룹ID 검색" : "MID · 가맹점명 검색"}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            containerClassName="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable
          columns={columns}
          rows={paged}
          loading={rows === null}
          getRowKey={(s) => s.id}
          emptyMessage="조건에 맞는 정산 내역이 없습니다."
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
