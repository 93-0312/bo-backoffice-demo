/**
 * entities/user Public API.
 *
 * 바깥(features/widgets/pages)은 반드시 이 배럴을 통해서만 user 슬라이스를 쓴다.
 * 내부 파일(model/api/ui/*)을 직접 import 하면 캡슐화가 깨진다.
 */
export type { User, UserRole, UserStatus } from "./model/types";
export { USER_ROLE_LABEL, USER_STATUS_LABEL } from "./model/types";
export {
  fetchUsers,
  fetchUser,
  createUser,
  deleteUser,
  __resetUsers,
  type UserListParams,
  type CreateUserInput,
} from "./api/userApi";
export { UserStatusBadge } from "./ui/UserStatusBadge";
export { UserRoleBadge } from "./ui/UserRoleBadge";
export { UserIdentityCell } from "./ui/UserIdentityCell";
