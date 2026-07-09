import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchUsers } from "./userApi";
import type { UserListParams } from "./userApi";

/** user TanStack Query 훅 (entities/user/api). */
export const userKeys = {
  all: ["user"] as const,
  list: (params: UserListParams) => ["user", "list", params] as const,
};

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}
