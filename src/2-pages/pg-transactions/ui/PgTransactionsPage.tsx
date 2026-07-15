import { useEffect, useState } from "react";
import { Alert, Button, Card, type SelectOption } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { formatNumber } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import {
  FilterBar,
  useFilters,
  DATE_RANGE_PRESETS,
  type FilterDef,
  type DateRangeValue,
} from "@/widgets/filter-bar";
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
    fixed: "left",
    width: 200,
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
  {
    header: "거래일시",
    cell: (t) => <span className="text-sm">{t.transactDate}</span>,
  },
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
  {
    header: "유형",
    cell: (t) => <span className="text-sm">{t.transactTypeName}</span>,
  },
  {
    header: "결제수단",
    cell: (t) => <span className="text-sm">{t.transactSchemeName}</span>,
  },
  {
    header: "결제 방식",
    cell: (t) => <span className="text-sm">{t.methodDisplayName}</span>,
  },
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
        <span className="ml-1 text-xs text-muted-foreground">
          ({t.transCountryCd})
        </span>
      </span>
    ),
  },
  {
    header: "카드번호",
    cell: (t) => (
      <span className="font-mono text-xs text-muted-foreground">
        {t.transactCardNo || "-"}
      </span>
    ),
  },
  {
    header: "고객 ID",
    width: 140,
    cell: (t) => <span className="font-mono text-xs">{t.customerId}</span>,
  },
];

/** 필터 스키마 — FilterBar 가 이 선언대로 렌더한다(상태는 useFilters 가 소유). */
const FILTER_DEFS: FilterDef[] = [
  {
    type: "search",
    key: "search",
    placeholder: "가맹점명 · 주문번호 · 거래번호 · 고객ID 검색",
  },
  { type: "select", key: "status", options: STATUS_OPTIONS },
  {
    type: "dateRange",
    key: "period",
    presets: [
      DATE_RANGE_PRESETS.today,
      DATE_RANGE_PRESETS.last7Days,
      DATE_RANGE_PRESETS.thisMonth,
    ],
  },
];

export function PgTransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  // 필터 상태 — 이 메뉴는 persist:"url"(새로고침+링크 공유 유지) + 검색어만 디바운스.
  // 유지가 싫은 메뉴는 "none", URL 없이 유지하고 싶은 메뉴는 "storage"+storageKey.
  const { values, debouncedValues, setValue, reset, isDirty } = useFilters({
    defaults: {
      search: "",
      status: "",
      period: { from: null, to: null } as DateRangeValue,
    },
    persist: "url",
    debounceKeys: ["search"],
  });

  // 필터/페이지 크기 변경 시 첫 페이지로 + 선택 초기화(다른 조회 결과이므로)
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [debouncedValues, pageSize]);

  // 데이터 로딩/캐싱/재조회는 TanStack Query 가 담당 (파라미터 변경 시 자동 재조회).
  // 에러도 여기서 나온다 — queryFn(boJson) 이 throw 한 ApiError 가 isError/error 로 노출됨.
  const { data, isLoading, isError, error } = usePgTransactionsQuery({
    search: debouncedValues.search,
    result: debouncedValues.status,
    startDate: debouncedValues.period.from ?? undefined,
    endDate: debouncedValues.period.to ?? undefined,
    page,
    rows: pageSize,
    locale: "ko",
  });

  // error 는 타입상 Error | null 이라, ApiError 로 좁혀 정규화된 필드(message·code)를 꺼낸다.
  const errorMessage = isError
    ? error instanceof ApiError
      ? error.message
      : "거래내역을 불러오지 못했습니다."
    : null;
  const rows: PgTransaction[] = data?.list ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="거래내역"
        description="구 BO 거래내역 API(/admin/transaction/listData) 계약으로 조회하는 목록입니다."
      />

      <Card>
        <FilterBar
          defs={FILTER_DEFS}
          values={values}
          onChange={setValue}
          onReset={reset}
          dirty={isDirty}
        />

        {/* useQuery 에러 소비 예시 — 정규화된 ApiError.message(·code) 를 그대로 표시 */}
        {errorMessage && (
          <div className="p-4">
            <Alert type="error" title={errorMessage}>
              {error instanceof ApiError && error.code ? `에러 코드: ${error.code}` : null}
            </Alert>
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {selected.length}건 선택됨
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                선택 해제
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert(`${selected.length}건 일괄 처리 (데모)`);
                  console.log(selected, "selected");
                }}
              >
                일괄 처리
              </Button>
            </div>
          </div>
        )}

        <DataTable
          storageKey="pg-transactions"
          columns={columns}
          rows={rows}
          loading={isLoading}
          getRowKey={(t) => t.transactId}
          emptyMessage="거래내역이 없습니다."
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          stickyHeader
          maxHeight={520}
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
