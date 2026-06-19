import type { User } from "./types";

/**
 * User 목업 시드 데이터 (entities/user/model).
 * 실제 앱에선 서버가 주지만, 데모라 정적 시드를 둔다. api 세그먼트가 이걸 복제해 사용.
 */
export const USER_SEED: User[] = [
  {
    id: "u_001",
    name: "김하늘",
    email: "haneul.kim@example.com",
    role: "admin",
    status: "active",
    createdAt: "2025-11-02T09:12:00+09:00",
    lastActiveAt: "2026-06-19T08:40:00+09:00",
  },
  {
    id: "u_002",
    name: "이도현",
    email: "dohyun.lee@example.com",
    role: "manager",
    status: "active",
    createdAt: "2025-12-15T14:05:00+09:00",
    lastActiveAt: "2026-06-18T19:20:00+09:00",
  },
  {
    id: "u_003",
    name: "박서연",
    email: "seoyeon.park@example.com",
    role: "staff",
    status: "invited",
    createdAt: "2026-06-10T11:30:00+09:00",
  },
  {
    id: "u_004",
    name: "정우진",
    email: "woojin.jung@example.com",
    role: "staff",
    status: "active",
    createdAt: "2026-01-22T16:48:00+09:00",
    lastActiveAt: "2026-06-17T10:02:00+09:00",
  },
  {
    id: "u_005",
    name: "최민지",
    email: "minji.choi@example.com",
    role: "manager",
    status: "suspended",
    createdAt: "2025-10-08T08:00:00+09:00",
    lastActiveAt: "2026-05-30T13:15:00+09:00",
  },
  {
    id: "u_006",
    name: "한지호",
    email: "jiho.han@example.com",
    role: "staff",
    status: "active",
    createdAt: "2026-03-19T09:55:00+09:00",
    lastActiveAt: "2026-06-19T07:10:00+09:00",
  },
];
