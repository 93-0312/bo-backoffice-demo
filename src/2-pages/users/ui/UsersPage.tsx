import { useMemo, useState } from "react";
import { Card, type SelectOption } from "@/shared/ui";
import { formatRelativeTime } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, applySort, type Column, type SortState } from "@/widgets/data-table";
import { FilterBar, useFilters, type FilterDef } from "@/widgets/filter-bar";
import { CreateUserButton } from "@/features/user-create";
import { DeleteUserButton } from "@/features/user-delete";
import {
  useUsersQuery,
  UserIdentityCell,
  UserRoleBadge,
  UserStatusBadge,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
  type User,
  type UserRole,
  type UserStatus,
} from "@/entities/user";

/**
 * UsersPage — 라우트 `/users` (page).
 *
 * 데이터 상태(목록·필터)를 소유하고, feature(추가/삭제) + widget(필터 바·테이블)을 조립한다.
 * 표현(아바타·배지)은 entities/user 의 컴포넌트를 컬럼 render 에 끼워 재사용한다.
 *
 * 흐름: 필터 변경(useFilters) → (검색어 디바운스) → fetchUsers → 테이블 갱신.
 * persist:"memory" — 방문 탭/메뉴 재진입 시 필터 유지, 새로고침 시 초기화.
 */
const ROLE_OPTIONS: SelectOption[] = [
  { value: "all", label: "역할 전체" },
  ...(Object.keys(USER_ROLE_LABEL) as UserRole[]).map((r) => ({ value: r, label: USER_ROLE_LABEL[r] })),
];
const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "상태 전체" },
  ...(Object.keys(USER_STATUS_LABEL) as UserStatus[]).map((s) => ({
    value: s,
    label: USER_STATUS_LABEL[s],
  })),
];

const FILTER_DEFS: FilterDef[] = [
  { type: "search", key: "search", placeholder: "이름 또는 이메일 검색", className: "max-w-xs" },
  { type: "select", key: "role", options: ROLE_OPTIONS, className: "w-36" },
  { type: "select", key: "status", options: STATUS_OPTIONS, className: "w-36" },
];

export function UsersPage() {
  const [sort, setSort] = useState<SortState | null>(null);
  const { values, debouncedValues, setValue, reset, isDirty } = useFilters({
    defaults: { search: "", role: "all", status: "all" },
    persist: "memory",
    storageKey: "users",
    debounceKeys: ["search"],
  });

  const { data, isLoading, refetch } = useUsersQuery({
    search: debouncedValues.search,
    role: debouncedValues.role as UserRole | "all",
    status: debouncedValues.status as UserStatus | "all",
  });
  const users: User[] = data ?? [];
  // 생성/삭제(feature mutation) 후 목록 재조회
  const load = () => void refetch();

  const columns: Column<User>[] = [
    {
      header: "사용자",
      cell: (u) => <UserIdentityCell user={u} />,
      sortKey: "name",
      sortAccessor: (u) => u.name,
    },
    { header: "역할", cell: (u) => <UserRoleBadge role={u.role} /> },
    { header: "상태", cell: (u) => <UserStatusBadge status={u.status} /> },
    {
      header: "마지막 접속",
      cell: (u) =>
        u.lastActiveAt ? (
          <span className="text-sm text-muted-foreground">{formatRelativeTime(u.lastActiveAt)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">미접속</span>
        ),
      sortKey: "lastActiveAt",
      // 미접속(undefined)은 applySort 규칙상 항상 뒤로 정렬된다.
      sortAccessor: (u) => u.lastActiveAt,
    },
    {
      header: "",
      align: "right",
      cell: (u) => <DeleteUserButton userId={u.id} userName={u.name} onDeleted={load} />,
    },
  ];

  const sortedUsers = useMemo(() => applySort(users, sort, columns), [users, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="사용자"
        description="콘솔에 접근할 수 있는 구성원을 관리합니다."
        actions={<CreateUserButton onCreated={load} />}
      />
      <Card>
        <FilterBar
          defs={FILTER_DEFS}
          values={values}
          onChange={setValue}
          onReset={reset}
          dirty={isDirty}
        />
        <DataTable
          storageKey="users"
          columns={columns}
          rows={sortedUsers}
          loading={isLoading}
          getRowKey={(u) => u.id}
          emptyMessage="조건에 맞는 사용자가 없습니다."
          sort={sort}
          onSortChange={setSort}
        />
      </Card>
    </div>
  );
}
