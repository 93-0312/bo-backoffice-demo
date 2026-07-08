import { delay, mockMutation } from "@/shared/api";
import { USER_SEED } from "../model/mock";
import type { User, UserRole } from "../model/types";

/**
 * User API (entities/user/api).
 *
 * 도메인 데이터 접근의 단일 창구. shared/api 의 범용 도구(delay/mockMutation)로
 * 네트워크를 흉내 낸다. features 는 여기를 호출할 뿐 fetch 세부를 모른다.
 *
 * 모듈 스코프 배열을 "DB" 처럼 써서 생성/삭제가 세션 동안 유지되게 한다.
 */
let db: User[] = [...USER_SEED];

export interface UserListParams {
  search?: string;
  role?: UserRole | "all";
  status?: User["status"] | "all";
}

export async function fetchUsers(params: UserListParams = {}): Promise<User[]> {
  const { search = "", role = "all", status = "all" } = params;
  const q = search.trim().toLowerCase();
  const result = db.filter((u) => {
    const matchQ =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = role === "all" || u.role === role;
    const matchStatus = status === "all" || u.status === status;
    return matchQ && matchRole && matchStatus;
  });
  return delay(result, 350);
}

export async function fetchUser(id: string): Promise<User | undefined> {
  return delay(
    db.find((u) => u.id === id),
    300,
  );
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const user: User = {
    id: `u_${String(db.length + 1).padStart(3, "0")}_${input.email.split("@")[0]}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: "invited",
    createdAt: new Date().toISOString(),
  };
  const created = await mockMutation(user, { ms: 600 });
  db = [created, ...db];
  return created;
}

export async function deleteUser(id: string): Promise<{ id: string }> {
  const res = await mockMutation({ id }, { ms: 500 });
  db = db.filter((u) => u.id !== id);
  return res;
}

/** 데모 리셋용 (설정 페이지에서 사용) */
export function __resetUsers() {
  db = [...USER_SEED];
}
