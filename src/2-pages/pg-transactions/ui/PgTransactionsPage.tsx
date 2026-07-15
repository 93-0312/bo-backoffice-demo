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
/**
 * 셀렉트 옵션 — 구 BO 거래내역 필터 세트.
 * value 는 listData body 로 그대로 전송된다. ⚠️ 법인·거래환경·프로세서·필터 코드는
 * 데모 placeholder — 실서버 연동 시 구 BO 코드 조회 API 값으로 교체해야 한다.
 * (상태·유형·결제수단·통화는 mock 시드와 일치해 데모에서도 실제 걸러진다.)
 */
const STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "거래 상태" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "PENDING", label: "PENDING" },
  { value: "FAILED", label: "FAILED" },
  { value: "CANCELLED", label: "CANCELLED" },
];
const TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "거래 유형" },
  { value: "SALE", label: "SALE" },
  { value: "REFUND", label: "REFUND" },
];
const SCHEME_OPTIONS: SelectOption[] = [
  { value: "", label: "결제수단" },
  { value: "PayPal", label: "PayPal" },
  { value: "Visa", label: "Visa" },
  { value: "Master", label: "Master" },
  { value: "AMEX", label: "AMEX" },
  { value: "UnionPay", label: "UnionPay" },
  { value: "JCB", label: "JCB" },
];
const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "", label: "통화" },
  ...["USD", "KRW", "JPY", "EUR", "CNY", "GBP"].map((c) => ({
    value: c,
    label: c,
  })),
];
const CONTRACT_OPTIONS: SelectOption[] = [
  { value: "", label: "계약법인" },
  { value: "PAYVERSE", label: "PayVerse" },
  { value: "EROMNET", label: "Eromnet" },
];
const BRANCH_OPTIONS: SelectOption[] = [
  { value: "", label: "영업법인" },
  { value: "KR", label: "한국" },
  { value: "SG", label: "싱가포르" },
];
const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { value: "", label: "거래환경" },
  { value: "PC", label: "PC" },
  { value: "MOBILE", label: "Mobile" },
];
const PARTNER_OPTIONS: SelectOption[] = [
  { value: "", label: "프로세서" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "NICE", label: "NICE" },
  { value: "KCP", label: "KCP" },
];
/** 검색어를 적용할 대상 필드(구 BO "필터" 셀렉트) */
const SEARCH_FILTER_OPTIONS: SelectOption[] = [
  { label: "가맹점ID", value: "MA.id" },
  { label: "가맹점명", value: "MA.name" },
  { label: "거래번호", value: "TD.transact_id" },
  { label: "매입번호", value: "TD.acquiring_id" },
  { label: "주문번호", value: "TD.order_id" },
  {
    label: "호스팅명",
    value: "MA.hosting_name",
  },
  { label: "파트너 TID", value: "TD.partner_tid" },
  { label: "고객 ID", value: "TD.customer_id" },
  { label: "승인번호", value: "TD.app_no" },
];
const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "9", label: "UTC+9" },
  { value: "8", label: "UTC+8" },
  { value: "7", label: "UTC+7" },
  { value: "0", label: "UTC+0" },
  { value: "-5", label: "UTC-5" },
  { value: "-8", label: "UTC-8" },
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

/**
 * 필터 스키마 — FilterBar 가 이 선언대로 렌더한다(상태는 useFilters 가 소유).
 * 배치는 구 BO 거래내역 필터 순서를 따른다: 일자 해제 → 기간 → 코드 셀렉트 9종 →
 * 검색어 → 타임존 → 제외 체크박스 2종.
 */
const FILTER_DEFS: FilterDef[] = [
  { type: "checkbox", key: "allTime", label: "일자 해제" },
  {
    type: "dateRange",
    key: "period",
    presets: [
      DATE_RANGE_PRESETS.today,
      DATE_RANGE_PRESETS.last7Days,
      DATE_RANGE_PRESETS.thisMonth,
    ],
  },
  {
    type: "select",
    key: "contract",
    options: CONTRACT_OPTIONS,
    className: "w-36",
  },
  { type: "select", key: "branch", options: BRANCH_OPTIONS, className: "w-36" },
  { type: "select", key: "type", options: TYPE_OPTIONS, className: "w-36" },
  { type: "select", key: "status", options: STATUS_OPTIONS, className: "w-36" },
  { type: "select", key: "scheme", options: SCHEME_OPTIONS, className: "w-36" },
  {
    type: "select",
    key: "environment",
    options: ENVIRONMENT_OPTIONS,
    className: "w-36",
  },
  {
    type: "select",
    key: "partner",
    options: PARTNER_OPTIONS,
    className: "w-36",
  },
  {
    type: "select",
    key: "currency",
    options: CURRENCY_OPTIONS,
    className: "w-28",
  },
  {
    type: "select",
    key: "filter",
    options: SEARCH_FILTER_OPTIONS,
    className: "w-36",
  },
  {
    type: "search",
    key: "search",
    placeholder: "검색어를 입력하세요",
    className: "max-w-xs",
  },
  {
    type: "select",
    key: "timeZone",
    options: TIMEZONE_OPTIONS,
    className: "w-28",
  },
  { type: "checkbox", key: "excludePayverse", label: "PayVerse 결제 제외" },
  {
    type: "checkbox",
    key: "excludePaypalReferral",
    label: "PayPal Referral 제외",
  },
];

export function PgTransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  // 필터 상태 — 이 메뉴는 persist:"memory"(기존 BO 방식 — 방문 탭/메뉴 재진입 시
  // 복원, 새로고침 시 초기화) + 검색어만 디바운스. 새로고침·링크 공유까지 유지하려면
  // "url", URL 없이 새로고침 유지는 "storage", 항상 초기화는 "none".
  const { values, debouncedValues, setValue, reset, isDirty } = useFilters({
    defaults: {
      allTime: false,
      period: { from: null, to: null } as DateRangeValue,
      contract: "",
      branch: "",
      type: "",
      status: "",
      scheme: "",
      environment: "",
      partner: "",
      currency: "",
      filter: "",
      search: "",
      timeZone: "9",
      excludePayverse: false,
      excludePaypalReferral: false,
    },
    persist: "memory",
    storageKey: "pg-transactions",
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
    allTime: debouncedValues.allTime,
    startDate: debouncedValues.period.from ?? undefined,
    endDate: debouncedValues.period.to ?? undefined,
    contractDataCode: debouncedValues.contract,
    branchDataCode: debouncedValues.branch,
    type: debouncedValues.type,
    result: debouncedValues.status,
    schemeCd: debouncedValues.scheme,
    environmentType: debouncedValues.environment,
    partnerCd: debouncedValues.partner,
    currencyCode: debouncedValues.currency,
    filter: debouncedValues.filter,
    search: debouncedValues.search,
    timeZone: debouncedValues.timeZone,
    excludePayverse: debouncedValues.excludePayverse,
    excludePaypalReferral: debouncedValues.excludePaypalReferral,
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
          note="최대 검색가능 기간: 1개월"
        />

        {/* useQuery 에러 소비 예시 — 정규화된 ApiError.message(·code) 를 그대로 표시 */}
        {errorMessage && (
          <div className="p-4">
            <Alert type="error" title={errorMessage}>
              {error instanceof ApiError && error.code
                ? `에러 코드: ${error.code}`
                : null}
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
