// Vitest 전역 setup.
// - jest-dom 매처(toBeInTheDocument 등) 등록
// - 각 테스트 후 React Testing Library 렌더 트리 정리(누수 방지)
// - jsdom 에 없는 브라우저 API 폴리필(Radix 기반 킷 컴포넌트 + userEvent 용)
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom 미구현 API 폴리필 — Radix Dialog/Popover 등이 pointer capture·scroll 을 호출한다.
const proto = window.Element.prototype as unknown as Record<string, unknown>;
if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
if (!proto.scrollIntoView) proto.scrollIntoView = () => {};
