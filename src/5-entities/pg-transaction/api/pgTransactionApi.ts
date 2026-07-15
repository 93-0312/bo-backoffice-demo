import { delay, hasBoSession, boJson } from "@/shared/api";
import { PG_TRANSACTION_SEED } from "../model/mock";
import type {
  PgTransactionDetailResponse,
  PgTransactionListParams,
  PgTransactionListResponse,
} from "../model/types";

/**
 * PG 거래내역 조회 (entities/pg-transaction/api).
 *
 * 실 엔드포인트: POST /bo-api/admin/transaction/listData (Vite 프록시 → dev 호스트).
 *
 * 토글: 실 BO 세션(Bearer 토큰)이 있으면 실서버, 없으면 mock.
 * → 기본(둘러보기/오프라인/CI)은 mock 으로 self-contained 유지, 로그인 시에만 실데이터.
 */
export async function fetchPgTransactions(
  params: PgTransactionListParams,
): Promise<PgTransactionListResponse> {
  return hasBoSession() ? fetchReal(params) : fetchMock(params);
}

/** 실서버 조회 — 구 BO listData 요청 body 계약을 그대로 채워 보낸다. */
async function fetchReal(params: PgTransactionListParams): Promise<PgTransactionListResponse> {
  const { start, end } = todayRange();
  // 서버 계약은 "YYYY-MM-DD hh:mm:ss" — 필터에서 날짜만 오면 하루 경계 시각을 붙인다.
  const withTime = (d: string | undefined, time: string) =>
    d && d.length === 10 ? `${d} ${time}` : d;
  const body = {
    allTime: false,
    startDate: withTime(params.startDate, "00:00:00") ?? start,
    endDate: withTime(params.endDate, "23:59:59") ?? end,
    contractDataCode: "",
    branchDataCode: "",
    type: params.type ?? "",
    result: params.result ?? "",
    schemeCd: params.schemeCd ?? "",
    environmentType: "",
    partnerCd: "",
    currencyCode: "",
    filter: "",
    search: params.search ?? "",
    timeZone: "9",
    excludePayverse: false,
    excludePaypalReferral: false,
    page: params.page,
    rows: params.rows,
    locale: params.locale ?? "ko",
  };
  return boJson<PgTransactionListResponse>("/admin/transaction/listData", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 거래 상세 조회 (entities/pg-transaction/api).
 *
 * 실 엔드포인트: GET /bo-api/admin/transaction/detail?transactId={tid}
 * 토글: BO 세션 있으면 실서버, 없으면 mock(시드로 동일 응답 구조 합성).
 */
export async function fetchPgTransactionDetail(
  tid: string,
): Promise<PgTransactionDetailResponse | null> {
  return hasBoSession() ? fetchRealDetail(tid) : fetchMockDetail(tid);
}

async function fetchRealDetail(tid: string): Promise<PgTransactionDetailResponse | null> {
  return boJson<PgTransactionDetailResponse>(
    `/admin/transaction/detail?transactId=${encodeURIComponent(tid)}`,
    { method: "GET" },
  );
}

/** mock — 목록 시드 한 건으로 상세 응답 구조를 합성한다(상세 전용 필드는 비움). */
async function fetchMockDetail(tid: string): Promise<PgTransactionDetailResponse | null> {
  const b = PG_TRANSACTION_SEED.find((t) => t.transactId === tid);
  if (!b) return delay(null, 300);
  return delay(
    {
      status: { status: 200, code: "0000", message: "Success" },
      transactGroupList: [
        {
          transactId: b.transactId,
          transactDate: b.transactDate,
          merchantId: b.merchantId,
          merchantName: b.merchantName,
          transactOrderId: b.transactOrderId,
          transactTypeName: b.transactTypeName,
          transactStatusName: b.transactStatusName,
          transactProcessCurrency: b.transactProcessCurrency,
          transactProcessAmount: b.transactProcessAmount,
          transactSchemeName: b.transactSchemeName,
          transactCardNo: b.transactCardNo,
          transactCardHolder: b.transactCardHolder ?? "",
          customerId: b.customerId,
          regionName: b.transCountryNm,
          regionDisplayName: b.transCountryNm,
          methodName: b.methodDisplayName,
          methodDisplayName: b.methodDisplayName,
          transactRequestCurrency: b.transactRequestCurrency,
          transactRequestAmount: b.transactRequestAmount,
          countryCode: b.transCountryCd,
        },
      ],
      transactDetails: {
        merchantId: b.merchantId,
        merchantName: b.merchantName,
        transactOrderId: b.transactOrderId,
        transactStatusName: b.transactStatusName,
        transactProductName: "",
        remainPartnerAmount: 0,
        transactRequestAmount: b.transactRequestAmount,
        transactPartnerAmount: b.transactProcessAmount,
        transactRequestCurrency: b.transactRequestCurrency,
        transactPartnerCurrency: b.transactProcessCurrency,
        transactCustomerId: b.customerId,
        transactSchemeName: b.transactSchemeName,
        transactCountryName: b.transCountryNm,
        transactCardNo: b.transactCardNo,
        transactCardHolder: b.transactCardHolder ?? "",
        transactId: b.transactId,
        transactType: b.transactTypeName,
        partnerName: "",
        transactRequestDatetime: b.transactDate,
        transactPartnerDatetime: b.transactDate,
        installmentMonths: "00",
        customerId: b.customerId,
        methodName: b.methodDisplayName,
        appCardAmt: 0,
        appMoneyAmt: 0,
        partialCcUse: "N",
        ccUse: "N",
        refundPeriod: 0,
        webHookLogExists: false,
      },
      transactCheck: {
        transactRefund: false,
        transactChargeback: false,
        transactReversal: false,
        transactGroupCnt: 1,
      },
    },
    300,
  );
}

/** 오늘 00:00:00 ~ 23:59:59 (실서버 기본 조회 범위) */
function todayRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { start: `${y}-${m}-${d} 00:00:00`, end: `${y}-${m}-${d} 23:59:59` };
}

/** mock 조회 — 시드에 검색·상태·유형·기간 필터 + 페이지네이션을 적용해 동일 계약으로 반환. */
async function fetchMock(params: PgTransactionListParams): Promise<PgTransactionListResponse> {
  const {
    search = "",
    result = "",
    schemeCd = "",
    type = "",
    startDate,
    endDate,
    page,
    rows,
  } = params;
  const q = search.trim().toLowerCase();

  const filtered = PG_TRANSACTION_SEED.filter((t) => {
    const matchQ =
      !q ||
      t.merchantName.toLowerCase().includes(q) ||
      t.transactOrderId.toLowerCase().includes(q) ||
      t.transactId.toLowerCase().includes(q) ||
      t.customerId.toLowerCase().includes(q);
    const matchStatus = !result || t.transactStatusName === result;
    const matchScheme = !schemeCd || t.transactSchemeName === schemeCd;
    const matchType = !type || t.transactTypeName === type;
    // 기간 필터 — transactDate("YYYY-MM-DD hh:mm:ss")의 날짜부만 문자열 비교.
    // (실서버와 달리 mock 은 기간 미지정 시 전체를 보여준다 — 데모 self-contained 유지)
    const day = t.transactDate.slice(0, 10);
    const matchDate =
      (!startDate || day >= startDate.slice(0, 10)) && (!endDate || day <= endDate.slice(0, 10));
    return matchQ && matchStatus && matchScheme && matchType && matchDate;
  });

  const count = filtered.length;
  const totalPage = Math.max(1, Math.ceil(count / rows));
  const startIdx = (page - 1) * rows;
  const list = filtered
    .slice(startIdx, startIdx + rows)
    .map((t, i) => ({ ...t, rownum: startIdx + i + 1 }));

  return delay(
    {
      status: { status: 200, code: "0000", message: "Success" },
      res_msg: "Success",
      count,
      totalPage,
      list,
    },
    350,
  );
}
