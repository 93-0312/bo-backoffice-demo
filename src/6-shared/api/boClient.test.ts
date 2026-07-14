import { describe, it, expect } from "vitest";
import { toApiError, ApiError } from "@/shared/api";

/**
 * toApiError 정규화 — "에러 봉투 모양을 다 몰라도" 안 깨지고 최선을 뽑는지 검증.
 * 아는 후보는 우선순위대로 뽑고, 모르는 모양은 HTTP status 폴백 + raw 보존.
 */
const resWith = (status: number) => ({ status } as Response);

describe("shared/api · toApiError", () => {
  it("이 BO 관찰 봉투 { status: { code, message } } 를 뽑는다", () => {
    const err = toApiError(resWith(400), {
      status: { status: 400, code: "1000", message: "Invalid token" },
    });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Invalid token");
    expect(err.code).toBe("1000");
    expect(err.status).toBe(400);
  });

  it("평면 { message } 모양도 뽑는다", () => {
    const err = toApiError(resWith(422), { message: "필수값 누락" });
    expect(err.message).toBe("필수값 누락");
    expect(err.code).toBeUndefined();
  });

  it("{ error: { message, code } } 모양도 뽑는다", () => {
    const err = toApiError(resWith(403), { error: { message: "권한 없음", code: "E403" } });
    expect(err.message).toBe("권한 없음");
    expect(err.code).toBe("E403");
  });

  it("문자열 error 모양도 뽑는다", () => {
    const err = toApiError(resWith(500), { error: "서버 오류" });
    expect(err.message).toBe("서버 오류");
  });

  it("모르는 모양이면 HTTP status 폴백 + raw 로 원본 보존", () => {
    const weird = { whatever: { nested: true } };
    const err = toApiError(resWith(503), weird);
    expect(err.message).toBe("요청에 실패했습니다 (503)");
    expect(err.status).toBe(503);
    expect(err.raw).toBe(weird); // 못 뽑아도 원본은 안 잃는다
  });

  it("body 가 null 이어도(본문 없음) 안 깨진다", () => {
    const err = toApiError(resWith(404), null);
    expect(err.message).toBe("요청에 실패했습니다 (404)");
    expect(err.status).toBe(404);
  });

  it("code 가 숫자여도 문자열로 정규화한다", () => {
    const err = toApiError(resWith(400), { status: { code: 1000, message: "x" } });
    expect(err.code).toBe("1000");
  });
});
