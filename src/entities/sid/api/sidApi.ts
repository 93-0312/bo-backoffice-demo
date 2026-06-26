import { delay } from "@/shared/api";
import { SID_SEED } from "../model/mock";
import type { Sid, SidStatus } from "../model/types";

/** SID API (entities/sid/api). */
const db: Sid[] = [...SID_SEED];

export interface SidListParams {
  keyword?: string;
  status?: SidStatus | "all";
}

export async function fetchSids(params: SidListParams = {}): Promise<Sid[]> {
  const { keyword = "", status = "all" } = params;
  const q = keyword.trim().toLowerCase();
  const result = db.filter((s) => {
    const matchQ =
      !q ||
      s.mid.toLowerCase().includes(q) ||
      s.sellerId.toLowerCase().includes(q) ||
      s.corpName.toLowerCase().includes(q) ||
      s.ceoName.toLowerCase().includes(q);
    const matchStatus = status === "all" || s.status === status;
    return matchQ && matchStatus;
  });
  return delay(result, 350);
}
