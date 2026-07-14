/**
 * Mock API 클라이언트 (shared/api).
 *
 * 실제 서버가 없으므로 네트워크 지연/실패를 흉내 내는 범용 도구만 둔다.
 * "어떤 엔드포인트가 있는지"(users, orders …)는 도메인 지식이므로 여기 두지 않고
 * 각 entities 슬라이스의 api 세그먼트에서 이 도구를 이용해 정의한다.
 */

/** 지정 시간(ms)만큼 지연된 뒤 값을 resolve. 로딩 상태 데모용. */
export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    /** 백엔드 업무 코드(있으면). 전역에서 특정 코드 분기용. */
    readonly code?: string,
    /** 원본 응답 body 통째 보관 — 정규화가 못 뽑은 정보도 잃지 않도록. */
    readonly raw?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 성공/실패를 확률로 흉내 내는 mutation 헬퍼.
 * @param value 성공 시 resolve 할 값
 * @param opts.failRate 0~1 실패 확률 (기본 0 = 항상 성공)
 */
export function mockMutation<T>(
  value: T,
  opts: { ms?: number; failRate?: number; errorMessage?: string } = {},
): Promise<T> {
  const { ms = 500, failRate = 0, errorMessage = "요청을 처리하지 못했습니다." } = opts;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 결정적이지 않은 Math.random 대신, 호출 시점 ms 기반 의사난수로 데모 실패를 만든다.
      const seed = (Date.now() % 100) / 100;
      if (failRate > 0 && seed < failRate) {
        reject(new ApiError(errorMessage, 500));
      } else {
        resolve(value);
      }
    }, ms);
  });
}
