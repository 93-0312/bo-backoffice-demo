import axios, { AxiosError, type AxiosResponse, type Method } from "axios";
import { ROUTES } from "@/shared/config";
import { ApiError } from "./client";

/**
 * 실 BO(payverse dev) HTTP 클라이언트 (shared/api).
 *
 * axios 인스턴스(`boAxios`) 위에 얇게 올린 래퍼다. 전송(transport)은 이 파일 안에
 * 숨기고, 상위(entities/pages)는 `boJson` 만 쓴다 → 나중에 전송을 바꿔도 호출부 불변.
 *
 *  - 모든 요청은 Vite/Vercel 프록시(`/bo-api/*` → BO 호스트)를 통해 나가 CORS 를 우회.
 *  - 인증: 요청 인터셉터가 저장된 Bearer 토큰을 Authorization 헤더로 자동 주입.
 *  - 에러: 응답 인터셉터가 어떤 에러든 정규화된 ApiError 로 reject (아래 toApiError).
 *  - 토큰은 localStorage 에 둔다(새 창/탭 공유 — 상세를 새 창으로 여는 흐름 지원).
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

/**
 * BO 전용 axios 인스턴스.
 * baseURL 로 `/bo-api` 프록시 경로를 고정하고, 인터셉터로 토큰 주입 + 에러 정규화를 건다.
 */
export const boAxios = axios.create({
  baseURL: "/bo-api",
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 — 저장된 토큰을 Authorization 으로 주입
boAxios.interceptors.request.use((config) => {
  const token = boSession.get();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

/**
 * 세션 만료(무효 토큰) 에러 판별.
 * 표준 401 외에, 이 BO 는 만료/무효 토큰에 400 + code "1000"("Invalid token")을
 * 주는 것이 실측으로 확인되어 둘 다 만료로 취급한다.
 */
export function isSessionExpiredError(error: ApiError): boolean {
  return error.status === 401 || error.code === "1000";
}

// 만료 처리 원샷 가드 — 동시 다발 실패(재시도·병렬 쿼리)로 리다이렉트가 중복 실행되는 것 방지.
let sessionExpiryHandled = false;

/**
 * 세션 만료 공통 처리: 토큰 폐기 → 로그인 페이지로 하드 이동(앱 상태 전체 리셋).
 * BO 모드는 "토큰 없음 = 로그아웃"(features/auth 규칙)이라 토큰만 지우면 게이트가 막는다.
 * 로그인 페이지는 ?reason=session-expired 를 읽어 만료 안내를 띄운다.
 */
function handleSessionExpiry() {
  if (sessionExpiryHandled) return;
  sessionExpiryHandled = true;
  boSession.clear();
  window.location.assign(`${ROUTES.login}?reason=session-expired`);
}

// 응답 인터셉터 — 실패는 항상 정규화된 ApiError 로 reject.
// 세션 만료는 여기(모든 요청의 단일 관문)서 감지한다 — useQuery/useMutation/명령형 호출 전부 커버.
// hasBoSession 가드: 로그인 시도 자체의 실패(아직 토큰 없음)에는 리다이렉트하지 않는다.
// (boRequest 처럼 validateStatus 로 모든 상태를 resolve 시키는 호출은 여기 안 탐)
boAxios.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response) {
      const apiError = toApiError(error.response.status, error.response.data);
      if (hasBoSession() && isSessionExpiredError(apiError)) handleSessionExpiry();
      return Promise.reject(apiError);
    }
    // 응답 자체가 없음(네트워크 끊김/타임아웃/취소 등) → status 0
    return Promise.reject(new ApiError(error.message || "네트워크 오류가 발생했습니다.", 0));
  },
);

/**
 * 응답 → ApiError 정규화 (에러 경로 전용, 전송 무관).
 *
 * 백엔드 에러 봉투가 어떤 모양이든 앱은 항상 같은 ApiError(status·message·code·raw)만
 * 상대하도록 만든다. "규약을 다 알아야" 하는 게 아니라, 아는 후보를 순서대로 훑고
 * 없으면 HTTP status 로 폴백한다(안 깨짐). 원본은 raw 로 통째 보관하므로 못 뽑은 정보도
 * 잃지 않는다 — 나중에 실제 규약이 확정되면 이 함수의 후보 목록만 보강하면 된다.
 *
 * (성공 응답 봉투는 아직 규약 미확정이라 여기서 건드리지 않는다.)
 */
export function toApiError(status: number, body: unknown): ApiError {
  // 어떤 키에 들었는지 몰라 여러 후보를 뒤져야 하므로, 옵셔널 체이닝용 객체 별칭으로 좁힌다.
  const parsed = (body ?? {}) as Record<string, any>;
  const message: string =
    parsed?.status?.message ?? // 이 BO 의 관찰된 봉투: { status: { code, message } }
    parsed?.message ?? // 흔한 평면 모양
    parsed?.error?.message ??
    (typeof parsed?.error === "string" ? parsed.error : undefined) ??
    `요청에 실패했습니다 (${status})`; // 정말 모르면 폴백
  const codeRaw = parsed?.status?.code ?? parsed?.code ?? parsed?.error?.code;
  const code = codeRaw != null ? String(codeRaw) : undefined;
  return new ApiError(String(message), status, code, body);
}

/**
 * 저수준 요청 — 상태와 무관하게 AxiosResponse 를 그대로 반환(헤더/상태 검사용).
 * `validateStatus: () => true` 라 4xx/5xx 여도 throw 하지 않는다 → 호출부가 status 로 분기.
 * (로그인 흐름처럼 "실패 응답의 헤더/본문"을 직접 봐야 할 때 쓴다.)
 */
export function boRequest(path: string, init: RequestInit = {}): Promise<AxiosResponse> {
  return boAxios.request({
    url: path,
    method: (init.method as Method) ?? "GET",
    data: init.body, // JSON 문자열을 그대로 전송(Content-Type 은 인스턴스 기본값)
    headers: init.headers as Record<string, string> | undefined,
    validateStatus: () => true,
  });
}

/** JSON 요청 — 성공 시 data 반환, 실패 시 (인터셉터가) 정규화된 ApiError 를 던진다. */
export async function boJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await boAxios.request<T>({
    url: path,
    method: (init.method as Method) ?? "GET",
    data: init.body,
    headers: init.headers as Record<string, string> | undefined,
  });
  // 204 등 본문 없는 응답은 null 로 (axios 는 빈 본문을 "" 로 줄 수 있음)
  const data = res.data as unknown;
  return (data === "" || data == null ? null : data) as T;
}

/**
 * 응답에서 Bearer 토큰을 뽑아낸다.
 * BO 로그인 응답은 body 에 토큰이 없어(사용자 정보만), 헤더에 실려 온다고 보고
 * Authorization 을 우선 확인 + 흔한 대체 헤더/필드까지 방어적으로 탐색한다.
 */
export function extractBearerToken(res: AxiosResponse, body?: unknown): string | null {
  const stripBearer = (value: string) => value.replace(/^Bearer\s+/i, "").trim();
  const TOKEN_FIELDS = ["token", "accessToken", "access_token"];

  const authHeader = res.headers?.["authorization"] ?? res.headers?.["Authorization"];
  if (typeof authHeader === "string" && authHeader) return stripBearer(authHeader);

  for (const headerName of ["x-auth-token", "x-access-token", "access-token", "token"]) {
    const headerValue = res.headers?.[headerName];
    if (typeof headerValue === "string" && headerValue) return stripBearer(headerValue);
  }

  const source = body ?? res.data;
  if (source && typeof source === "object") {
    const payload = source as Record<string, unknown>;
    for (const field of TOKEN_FIELDS) {
      if (typeof payload[field] === "string") return stripBearer(payload[field] as string);
    }
    const data = payload.data as Record<string, unknown> | undefined;
    if (data) {
      for (const field of TOKEN_FIELDS) {
        if (typeof data[field] === "string") return stripBearer(data[field] as string);
      }
    }
  }
  return null;
}
