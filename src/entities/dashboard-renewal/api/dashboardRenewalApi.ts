import { delay } from "@/shared/api";
import { DASHBOARD_RENEWAL_SEED } from "../model/mock";
import type { DashboardRenewalData } from "../model/types";

/** Dashboard Renewal API (entities/dashboard-renewal/api). */
export async function fetchDashboardRenewal(): Promise<DashboardRenewalData> {
  return delay(DASHBOARD_RENEWAL_SEED, 350);
}
