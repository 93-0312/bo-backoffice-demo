import { delay } from "@/shared/api";
import { SETTLEMENT_SEED } from "../model/mock";
import type { Settlement, SettlementState } from "../model/types";

/** 정산 API (entities/settlement/api). */
const db: Settlement[] = [...SETTLEMENT_SEED];

export interface SettlementListParams {
  keyword?: string;
  state?: SettlementState | "all";
  /** true 면 영중소 정산서만, false/미지정이면 일반 정산 리스트만 */
  sme?: boolean;
}

export async function fetchSettlements(params: SettlementListParams = {}): Promise<Settlement[]> {
  const { keyword = "", state = "all", sme = false } = params;
  const q = keyword.trim().toLowerCase();
  const result = db.filter((s) => {
    if (s.isSme !== sme) return false;
    const matchQ =
      !q ||
      s.mid.toLowerCase().includes(q) ||
      s.merchantName.toLowerCase().includes(q) ||
      (s.groupId?.toLowerCase().includes(q) ?? false);
    const matchState = state === "all" || s.state === state;
    return matchQ && matchState;
  });
  return delay(result, 350);
}
