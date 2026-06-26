import { delay, mockMutation } from "@/shared/api";
import { SELLER_TX_SEED } from "../model/mock";
import type { SellerTransaction, SellerTxType, SellerTxState } from "../model/types";

/** 분할정산 거래내역 API. */
let db: SellerTransaction[] = [...SELLER_TX_SEED];

export interface SellerTxListParams {
  keyword?: string;
  type?: SellerTxType | "all";
  state?: SellerTxState | "all";
  /** '페이버스 결제 제외' 토글 */
  excludePayverse?: boolean;
}

export async function fetchSellerTransactions(
  params: SellerTxListParams = {},
): Promise<SellerTransaction[]> {
  const { keyword = "", type = "all", state = "all", excludePayverse = false } = params;
  const q = keyword.trim().toLowerCase();
  const result = db.filter((t) => {
    const matchQ =
      !q ||
      t.stid.toLowerCase().includes(q) ||
      t.sellerName.toLowerCase().includes(q) ||
      t.sid.toLowerCase().includes(q) ||
      t.midName.toLowerCase().includes(q) ||
      t.tid.toLowerCase().includes(q);
    const matchType = type === "all" || t.type === type;
    const matchState = state === "all" || t.state === state;
    const matchPayverse = !excludePayverse || !t.payverse;
    return matchQ && matchType && matchState && matchPayverse;
  });
  return delay(result, 350);
}

/**
 * 한 TID 에 속한 STID 목록 (환불 대상). 환불 가능 금액이 남은 SUCCESS 건만 환불 대상이 된다.
 * 비어 있으면(=셀러 거래내역 없음) 환불 불가.
 */
export async function fetchStidsByTid(tid: string): Promise<SellerTransaction[]> {
  return delay(
    db.filter((t) => t.tid === tid),
    300,
  );
}

export interface RefundItem {
  stid: string;
  amount: number;
}

/**
 * 환불 실행. 각 STID 의 환불 가능 금액에서 차감한다(환불 가능 금액 초과분은 보정).
 * 도메인 규칙: 환불 가능 금액이 0 이하면 환불 대상에서 제외.
 */
export async function refundStids(tid: string, items: RefundItem[]): Promise<{ refunded: number }> {
  const res = await mockMutation({ refunded: items.length }, { ms: 600 });
  db = db.map((t) => {
    if (t.tid !== tid) return t;
    const item = items.find((i) => i.stid === t.stid);
    if (!item) return t;
    const applied = Math.min(item.amount, t.refundableAmount);
    return { ...t, refundableAmount: t.refundableAmount - applied };
  });
  return res;
}
