import { describe, it, expect } from "vitest";
import { toApiError, isSessionExpiredError, ApiError } from "@/shared/api";

/**
 * toApiError 정규화 — "에러 봉투 모양을 다 몰라도" 안 깨지고 최선을 뽑는지 검증.
 * 아는 후보는 우선순위대로 뽑고, 모르는 모양은 HTTP status 폴백 + raw 보존.
 * (전송 무관 순수 함수 — status 와 body 만 받는다.)
 */
describe("shared/api · toApiError", () => {
  it("이 BO 관찰 봉투 { status: { code, message } } 를 뽑는다", () => {
    const err = toApiError(400, {
      status: { status: 400, code: "1000", message: "Invalid token" },
    });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Invalid token");
    expect(err.code).toBe("1000");
    expect(err.status).toBe(400);
  });

  it("평면 { message } 모양도 뽑는다", () => {
    const err = toApiError(422, { message: "필수값 누락" });
    expect(err.message).toBe("필수값 누락");
    expect(err.code).toBeUndefined();
  });

  it("{ error: { message, code } } 모양도 뽑는다", () => {
    const err = toApiError(403, { error: { message: "권한 없음", code: "E403" } });
    expect(err.message).toBe("권한 없음");
    expect(err.code).toBe("E403");
  });

  it("문자열 error 모양도 뽑는다", () => {
    const err = toApiError(500, { error: "서버 오류" });
    expect(err.message).toBe("서버 오류");
  });

  it("모르는 모양이면 HTTP status 폴백 + raw 로 원본 보존", () => {
    const weird = { whatever: { nested: true } };
    const err = toApiError(503, weird);
    expect(err.message).toBe("요청에 실패했습니다 (503)");
    expect(err.status).toBe(503);
    expect(err.raw).toBe(weird); // 못 뽑아도 원본은 안 잃는다
  });

  it("body 가 null 이어도(본문 없음) 안 깨진다", () => {
    const err = toApiError(404, null);
    expect(err.message).toBe("요청에 실패했습니다 (404)");
    expect(err.status).toBe(404);
  });

  it("code 가 숫자여도 문자열로 정규화한다", () => {
    const err = toApiError(400, { status: { code: 1000, message: "x" } });
    expect(err.code).toBe("1000");
  });
});

/**
 * 세션 만료 판별 — 표준 401 + 이 BO 실측 봉투(400/code 1000 "Invalid token") 둘 다 만료.
 * 그 외 에러(권한 403, 검증 400, 서버 500)는 만료로 오판하면 안 된다(로그아웃 루프 방지).
 */
describe("shared/api · isSessionExpiredError", () => {
  it("표준 401 은 만료다", () => {
    expect(isSessionExpiredError(new ApiError("Unauthorized", 401))).toBe(true);
  });

  it("이 BO 실측: 400 + code 1000(Invalid token) 도 만료다", () => {
    const err = toApiError(400, {
      status: { status: 400, code: "1000", message: "Invalid token" },
    });
    expect(isSessionExpiredError(err)).toBe(true);
  });

  it("다른 코드의 400(검증 실패 등)은 만료가 아니다", () => {
    expect(isSessionExpiredError(toApiError(400, { status: { code: "2001", message: "필수값" } }))).toBe(false);
    expect(isSessionExpiredError(new ApiError("Bad Request", 400))).toBe(false);
  });

  it("403/500 은 만료가 아니다", () => {
    expect(isSessionExpiredError(new ApiError("Forbidden", 403))).toBe(false);
    expect(isSessionExpiredError(new ApiError("Server Error", 500))).toBe(false);
  });
});
