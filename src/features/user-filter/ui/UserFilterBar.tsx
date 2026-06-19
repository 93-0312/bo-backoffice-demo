import { Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import {
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
  type UserListParams,
  type UserRole,
  type UserStatus,
} from "@/entities/user";

/**
 * UserFilterBar — "사용자 검색·필터링" 행위(feature).
 *
 * 제어 컴포넌트: 상태(params)는 page 가 소유하고, 이 feature 는 변경을 emit 만 한다.
 * 역할/상태는 킷 Select 로 고른다. 옵션 라벨은 도메인 지식이라 entities/user 에서 가져온다.
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

export interface UserFilterBarProps {
  value: UserListParams;
  onChange: (next: UserListParams) => void;
}

export function UserFilterBar({ value, onChange }: UserFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        leftIcon={<IconSearch />}
        placeholder="이름 또는 이메일 검색"
        value={value.search ?? ""}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        containerClassName="w-full max-w-xs"
      />
      <Select
        options={ROLE_OPTIONS}
        value={value.role ?? "all"}
        onValueChange={(v) => onChange({ ...value, role: v as UserRole | "all" })}
        className="w-36"
      />
      <Select
        options={STATUS_OPTIONS}
        value={value.status ?? "all"}
        onValueChange={(v) => onChange({ ...value, status: v as UserStatus | "all" })}
        className="w-36"
      />
    </div>
  );
}
