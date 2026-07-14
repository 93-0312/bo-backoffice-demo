import { useEffect, useMemo, useState } from "react";
import { Card, Button, Select, Input, type SelectOption } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Pagination } from "@/widgets/pagination";
import { FilterBar, DownloadButton, DateRangeField, type DateRange } from "@/widgets/query-filters";
import {
  useSidsQuery,
  SidStatusBadge,
  SID_STATUS_LABEL,
  type Sid,
  type SidStatus,
} from "@/entities/sid";

/**
 * SidListPage — "셀러 > 분할정산 > SID 리스트" (page).
 *
 * Figma 리스트 화면을 FSD로 조립: PageHeader(브레드크럼+다운로드) · FilterBar(날짜·상태·검색) ·
 * DataTable · Pagination. 검색/상태/날짜 필터와 페이지네이션이 실제 동작한다.
 */
const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "진행 상태 전체" },
  ...(Object.keys(SID_STATUS_LABEL) as SidStatus[]).map((s) => ({ value: s, label: SID_STATUS_LABEL[s] })),
];
const EMPTY_RANGE: DateRange = { from: "", to: "" };

export function SidListPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<SidStatus | "all">("all");
  const [range, setRange] = useState<DateRange>(EMPTY_RANGE);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debounced = useDebouncedValue(keyword, 300);

  const { data, isLoading } = useSidsQuery({ keyword: debounced, status });

  // 날짜 범위는 클라이언트에서 최초접수일 기준으로 거른다.
  const filtered = useMemo(() => {
    const list: Sid[] = data ?? [];
    return list.filter(
      (s) => (!range.from || s.receivedAt >= range.from) && (!range.to || s.receivedAt <= range.to),
    );
  }, [data, range]);

  useEffect(() => setPage(1), [debounced, status, range, pageSize]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const startNo = (page - 1) * pageSize;

  const columns: Column<Sid>[] = [
    { header: "NO", cell: (s) => <span className="text-sm text-muted-foreground">{startNo + paged.indexOf(s) + 1}</span> },
    { header: "가맹점 ID (MID)", cell: (s) => <span className="text-sm">{s.mid}</span> },
    { header: "sellerID", cell: (s) => <span className="font-mono text-sm text-primary">{s.sellerId}</span> },
    { header: "법인명", cell: (s) => <span className="text-sm">{s.corpName}</span> },
    { header: "대표자명", cell: (s) => <span className="text-sm">{s.ceoName}</span> },
    { header: "진행 상태", cell: (s) => <SidStatusBadge status={s.status} /> },
    { header: "최초접수일", cell: (s) => <span className="text-sm text-muted-foreground">{s.receivedAt}</span> },
    { header: "최종수정일", cell: (s) => <span className="text-sm text-muted-foreground">{s.updatedAt}</span> },
    {
      header: "MID 생성",
      cell: (s) =>
        s.midCreated ? (
          <span className="text-xs text-muted-foreground">생성완료</span>
        ) : (
          <Button size="xs" variant="outline" disabled={s.status !== "approved"}>
            MID 생성
          </Button>
        ),
    },
  ];

  function reset() {
    setKeyword("");
    setStatus("all");
    setRange(EMPTY_RANGE);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="셀러 > 분할정산 > SID 리스트"
        description="분할정산 셀러(SID) 등록 현황을 조회합니다."
        actions={<DownloadButton />}
      />
      <Card>
        <FilterBar onReset={reset} note="진행 상태가 '승인'인 건만 MID 생성이 가능합니다.">
          <DateRangeField value={range} onChange={setRange} />
          <Select options={STATUS_OPTIONS} value={status} onValueChange={(v) => setStatus(v as SidStatus | "all")} className="w-40" />
          <Input
            placeholder="MID · sellerID · 법인명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            containerClassName="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable
          storageKey="settlement-sids"
          columns={columns}
          rows={paged}
          loading={isLoading}
          getRowKey={(s) => s.id}
          emptyMessage="조건에 맞는 SID 가 없습니다."
        />
        <Pagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
