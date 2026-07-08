// Vitest 의 expect 에 jest-dom 매처(toBeInTheDocument 등) 타입을 등록한다.
// (setupFiles 는 tsconfig include 밖이라, 타입 augmentation 은 여기서 로드)
import "@testing-library/jest-dom/vitest";
