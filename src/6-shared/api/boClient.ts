import { ApiError } from "./client";

/**
 * 실 BO(payverse dev) HTTP 클라이언트 (shared/api).
 *
 * 모든 요청은 Vite 프록시(`/bo-api/*` → dev 호스트)를 통해 나가 CORS 를 우회한다.
 * 인증은 Bearer 토큰 — 로그인 성공 시 저장한 토큰을 Authorization 헤더로 붙인다.
 * 토큰은 localStorage 에 둔다(새 창/탭에서도 공유되도록 — 상세를 새 창으로 여는 흐름 지원).
 */
const BO_TOKEN_KEY = "bo-access-token";

export const boSession = {
  get: (): string | null => {
    try {
      return localStorage.getItem(BO_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(BO_TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(BO_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** 실 BO 세션(Bearer 토큰) 보유 여부 — mock↔real 분기 판단에 쓴다. */
export function hasBoSession(): boolean {
  return !!boSession.get();
}

/** 저수준 요청 — Response 를 그대로 반환(헤더/상태 검사용). */
export async function boRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = boSession.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`/bo-api${path}`, { ...init, headers });
}

/** JSON 요청 — 실패 시 서버 message 로 ApiError 를 던진다. */
export async function boJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await boRequest(path, init);
  if (!res.ok) {
    let message = `요청에 실패했습니다 (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      /* 본문 없음 */
    }
    throw new ApiError(message, res.status);
  }
  // 204 등 본문 없는 응답 대응
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/**
 * 응답에서 Bearer 토큰을 뽑아낸다.
 * BO 로그인 응답은 body 에 토큰이 없어(사용자 정보만), 헤더에 실려 온다고 보고
 * Authorization 을 우선 확인 + 흔한 대체 헤더/필드까지 방어적으로 탐색한다.
 */
export function extractBearerToken(res: Response, body?: unknown): string | null {
  const strip = (v: string) => v.replace(/^Bearer\s+/i, "").trim();

  const authHeader = res.headers.get("authorization");
  if (authHeader) return strip(authHeader);

  for (const name of ["x-auth-token", "x-access-token", "access-token", "token"]) {
    const v = res.headers.get(name);
    if (v) return strip(v);
  }

  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    for (const k of ["token", "accessToken", "access_token"]) {
      if (typeof b[k] === "string") return strip(b[k] as string);
    }
    const data = b.data as Record<string, unknown> | undefined;
    if (data) {
      for (const k of ["token", "accessToken", "access_token"]) {
        if (typeof data[k] === "string") return strip(data[k] as string);
      }
    }
  }
  return null;
}
