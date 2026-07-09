import { useQuery } from "@tanstack/react-query";
import { fetchDashboardRenewal } from "./dashboardRenewalApi";

/** dashboard-renewal TanStack Query 훅 (entities/dashboard-renewal/api). */
export const dashboardRenewalKeys = {
  all: ["dashboard-renewal"] as const,
};

export function useDashboardRenewalQuery() {
  return useQuery({
    queryKey: dashboardRenewalKeys.all,
    queryFn: () => fetchDashboardRenewal(),
  });
}
