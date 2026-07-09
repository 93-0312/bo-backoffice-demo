import { delay, hasBoSession, boJson } from "@/shared/api";
import { PG_TRANSACTION_SEED } from "../model/mock";
import type {
  PgTransactionDetail,
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
  const body = {
    allTime: false,
    startDate: params.startDate ?? start,
    endDate: params.endDate ?? end,
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
 * 값 연동은 이후 단계 — 지금은 상세 화면 레이아웃/필드 구조용. 목록 시드에서 기본 필드만
 * 채우고, 상세 전용 필드는 빈 값으로 둔다(구조만 표시). 실서버 어댑터는 목록과 동일 패턴으로
 * 추후 교체(토글).
 */
export async function fetchPgTransactionDetail(tid: string): Promise<PgTransactionDetail | null> {
  const base = PG_TRANSACTION_SEED.find((t) => t.transactId === tid);
  if (!base) return delay(null, 300);
  const detail: PgTransactionDetail = {
    ...base,
    seq: base.transactId,
    // 상세 전용 필드는 이후 연동 — 현재는 빈 구조
  };
  return delay(detail, 300);
}

/** 오늘 00:00:00 ~ 23:59:59 (실서버 기본 조회 범위) */
function todayRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { start: `${y}-${m}-${d} 00:00:00`, end: `${y}-${m}-${d} 23:59:59` };
}

/** mock 조회 — 시드에 검색·상태·유형 필터 + 페이지네이션을 적용해 동일 계약으로 반환. */
async function fetchMock(params: PgTransactionListParams): Promise<PgTransactionListResponse> {
  const { search = "", result = "", schemeCd = "", type = "", page, rows } = params;
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
    return matchQ && matchStatus && matchScheme && matchType;
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
