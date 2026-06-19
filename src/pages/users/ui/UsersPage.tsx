import { useCallback, useEffect, useState } from "react";
import { Card } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { formatRelativeTime } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { UserFilterBar } from "@/features/user-filter";
import { CreateUserButton } from "@/features/user-create";
import { DeleteUserButton } from "@/features/user-delete";
import {
  fetchUsers,
  UserIdentityCell,
  UserRoleBadge,
  UserStatusBadge,
  type User,
  type UserListParams,
} from "@/entities/user";

/**
 * UsersPage — 라우트 `/users` (page).
 *
 * 데이터 상태(목록·필터)를 소유하고, feature(필터/추가/삭제) + widget(테이블)을 조립한다.
 * 표현(아바타·배지)은 entities/user 의 컴포넌트를 컬럼 render 에 끼워 재사용한다.
 *
 * 흐름: 필터 변경 → params → (검색어 디바운스) → fetchUsers → 테이블 갱신.
 */
export function UsersPage() {
  const [params, setParams] = useState<UserListParams>({ search: "", role: "all", status: "all" });
  const [users, setUsers] = useState<User[] | null>(null);
  const debouncedSearch = useDebouncedValue(params.search ?? "", 300);

  const load = useCallback(() => {
    setUsers(null);
    fetchUsers({ ...params, search: debouncedSearch }).then(setUsers);
  }, [params, debouncedSearch]);

  useEffect(() => {
    let alive = true;
    setUsers(null);
    fetchUsers({ ...params, search: debouncedSearch }).then((d) => alive && setUsers(d));
    return () => {
      alive = false;
    };
  }, [params.role, params.status, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: Column<User>[] = [
    { header: "사용자", cell: (u) => <UserIdentityCell user={u} /> },
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
    },
    {
      header: "",
      align: "right",
      cell: (u) => <DeleteUserButton userId={u.id} userName={u.name} onDeleted={load} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="사용자"
        description="콘솔에 접근할 수 있는 구성원을 관리합니다."
        actions={<CreateUserButton onCreated={load} />}
      />
      <Card>
        <div className="border-b border-border p-4">
          <UserFilterBar value={params} onChange={setParams} />
        </div>
        <DataTable
          columns={columns}
          rows={users ?? []}
          loading={users === null}
          getRowKey={(u) => u.id}
          emptyMessage="조건에 맞는 사용자가 없습니다."
        />
      </Card>
    </div>
  );
}
