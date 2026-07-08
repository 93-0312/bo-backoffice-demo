/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// FSD 경로 별칭.
// import 는 표준 이름(`@/shared/...`)으로 쓰고, 물리 폴더는 탐색기 정렬을 위해
// 1-app…6-shared 로 둔다. 아래 매핑이 그 둘을 잇는다(구체 별칭 먼저, `@` catch-all 마지막).
// tsconfig.json 의 paths 와 항상 같이 맞춰야 한다.
// (Vitest 는 이 파일을 그대로 읽으므로 별칭이 테스트에도 자동 적용됨 — 설정 중복 없음)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@/app", replacement: r("./src/1-app") },
      { find: "@/pages", replacement: r("./src/2-pages") },
      { find: "@/widgets", replacement: r("./src/3-widgets") },
      { find: "@/features", replacement: r("./src/4-features") },
      { find: "@/entities", replacement: r("./src/5-entities") },
      { find: "@/shared", replacement: r("./src/6-shared") },
      { find: "@", replacement: r("./src") },
    ],
  },
  server: { port: 5180 },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    // 테스트 파일은 슬라이스 안에 co-location (Component.test.tsx / util.test.ts)
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
});
