import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionResultBadge } from "@/entities/transaction";

/**
 * entity UI 컴포넌트 렌더 테스트 예시 (jsdom + Testing Library).
 * 도메인 표현(거래 결과 배지)이 값에 맞게 그려지는지 확인.
 */
describe("entities/transaction · TransactionResultBadge", () => {
  it("결과 코드를 텍스트로 렌더한다", () => {
    render(<TransactionResultBadge result="SUCCESS" />);
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
  });

  it("결과 값에 따라 다른 텍스트를 보여준다", () => {
    render(<TransactionResultBadge result="FAILED" />);
    expect(screen.getByText("FAILED")).toBeInTheDocument();
  });
});
