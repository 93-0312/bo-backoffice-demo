import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserButton } from "@/features/user-delete";
import { deleteUser } from "@/entities/user";

/**
 * feature 인터랙션 테스트 예시.
 * 실제 deleteUser 는 랜덤 실패하는 mock-mutation 이라, 결정적 테스트를 위해
 * entity api 를 vi.mock 으로 대체한다(의존을 통제). feature 는 "삭제 행위"만
 * 소유하므로, 여기서 검증하는 건 "버튼→확인창→확정→api 호출→콜백" 흐름이다.
 */
vi.mock("@/entities/user", () => ({
  deleteUser: vi.fn(),
}));

describe("features/user-delete · DeleteUserButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteUser).mockResolvedValue({ id: "u1" });
  });

  it("삭제 클릭 → 확인창 표시 → 확정 시 deleteUser 호출 + onDeleted 콜백 + 닫힘", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    render(<DeleteUserButton userId="u1" userName="김하늘" onDeleted={onDeleted} />);

    // 1) 처음엔 확인창이 화면에 없다
    expect(screen.queryByText("사용자 삭제")).not.toBeInTheDocument();

    // 2) 삭제 버튼(아이콘, aria-label) 클릭 → 확인창이 뜬다
    await user.click(screen.getByRole("button", { name: "김하늘 삭제" }));
    expect(screen.getByText("사용자 삭제")).toBeVisible();
    expect(screen.getByText(/삭제할까요/)).toBeVisible();

    // 3) 확인창의 "삭제" 확정
    await user.click(screen.getByRole("button", { name: "삭제" }));

    // 4) entity api 가 해당 id 로 호출되고, 성공 콜백이 불린다
    expect(deleteUser).toHaveBeenCalledWith("u1");
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("u1"));

    // 5) 성공하면 확인창이 닫힌다
    await waitFor(() => expect(screen.queryByText("사용자 삭제")).not.toBeInTheDocument());
  });

  it("취소하면 삭제하지 않고 확인창만 닫힌다", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    render(<DeleteUserButton userId="u1" userName="김하늘" onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "김하늘 삭제" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(deleteUser).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("사용자 삭제")).not.toBeInTheDocument());
  });
});
