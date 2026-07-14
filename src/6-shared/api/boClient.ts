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

/**
 * 응답 → ApiError 정규화 (에러 경로 전용).
 *
 * 백엔드 에러 봉투가 어떤 모양이든 앱은 항상 같은 ApiError(status·message·code·raw)만
 * 상대하도록 만든다. "규약을 다 알아야" 하는 게 아니라, 아는 후보를 순서대로 훑고
 * 없으면 HTTP status 로 폴백한다(안 깨짐). 원본은 raw 로 통째 보관하므로 못 뽑은 정보도
 * 잃지 않는다 — 나중에 실제 규약이 확정되면 이 함수의 후보 목록만 보강하면 된다.
 *
 * (성공 응답 봉투는 아직 규약 미확정이라 여기서 건드리지 않는다. "200 + 에러봉투" 케이스도
 *  확인되면 boJson 에서 body 의 내부 status 를 함께 검사하도록 한 줄 추가하면 된다.)
 */
export function toApiError(res: Response, body: unknown): ApiError {
  const b = (body ?? {}) as Record<string, any>;
  const message: string =
    b?.status?.message ?? // 이 BO 의 관찰된 봉투: { status: { code, message } }
    b?.message ?? // 흔한 평면 모양
    b?.error?.message ??
    (typeof b?.error === "string" ? b.error : undefined) ??
    `요청에 실패했습니다 (${res.status})`; // 정말 모르면 폴백
  const codeRaw = b?.status?.code ?? b?.code ?? b?.error?.code;
  const code = codeRaw != null ? String(codeRaw) : undefined;
  return new ApiError(String(message), res.status, code, body);
}

/** JSON 요청 — 실패 시 정규화된 ApiError 를 던진다. */
export async function boJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await boRequest(path, init);
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* 본문 없음/비JSON — raw=null 로 두고 status 폴백 */
    }
    throw toApiError(res, body);
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
