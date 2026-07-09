import { describe, it, expect } from "vitest";
import { getPageItems } from "@/widgets/pagination";

/**
 * getPageItems 순수 로직 테스트 — 페이지 번호 생략(…) 규칙.
 * UI(mock 데이터)로는 페이지가 적어 재현이 안 되므로 여기서 경계를 검증한다.
 */
describe("widgets/pagination · getPageItems", () => {
  it("적으면(7 이하) 전부 노출하고 생략하지 않는다", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("앞쪽 페이지: 끝을 접는다", () => {
    // 1 [2 3] … 20  (현재 2, 좌우 sibling 1)
    expect(getPageItems(2, 20)).toEqual([1, 2, 3, "ellipsis", 20]);
  });

  it("중간 페이지: 양쪽을 접는다", () => {
    // 1 … 9 10 11 … 20
    expect(getPageItems(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });

  it("뒤쪽 페이지: 앞을 접는다", () => {
    // 1 … 18 19 20
    expect(getPageItems(19, 20)).toEqual([1, "ellipsis", 18, 19, 20]);
  });

  it("생략이 페이지 1개만 가리게 되면 접지 않고 그 번호를 보여준다", () => {
    // 현재 4 / 총 9: 왼쪽 gap 이 [2] 하나뿐이므로 … 대신 2 를 노출
    expect(getPageItems(4, 9)).toEqual([1, 2, 3, 4, 5, "ellipsis", 9]);
  });

  it("sibling 을 넓히면 더 많은 이웃을 보여준다", () => {
    expect(getPageItems(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });
});
