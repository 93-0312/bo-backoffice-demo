import { delay } from "@/shared/api";
import { PG_TRANSACTION_SEED } from "../model/mock";
import type { PgTransactionListParams, PgTransactionListResponse } from "../model/types";

/**
 * PG 거래내역 조회 (entities/pg-transaction/api).
 *
 * 실제 엔드포인트 (구 BO):
 *   POST https://bo-dev.payverseglobal.com/admin/transaction/listData
 *   body: { startDate, endDate, type, result, schemeCd, search, page, rows, locale, ... }
 *
 * 데모는 외부 dev API(CORS·인증) 대신 시드로 동일 계약(요청 파라미터/응답 봉투)을 흉내낸다.
 * 실서버 연결 시 이 함수 내부만 아래로 교체하면 된다(계약이 같으므로 상위 코드 무변경):
 *   const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify(params) });
 *   return res.json();
 */
export async function fetchPgTransactions(
  params: PgTransactionListParams,
): Promise<PgTransactionListResponse> {
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
