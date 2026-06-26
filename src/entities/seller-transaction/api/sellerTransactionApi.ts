import { delay } from "@/shared/api";
import { SELLER_TX_SEED } from "../model/mock";
import type { SellerTransaction, SellerTxType, SellerTxState } from "../model/types";

/** 분할정산 거래내역 API. */
const db: SellerTransaction[] = [...SELLER_TX_SEED];

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
