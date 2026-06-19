import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// FSD 경로 별칭: 모든 import 를 `@/<layer>/...` 절대경로로 쓴다.
// (역방향 import 를 한눈에 잡기 쉽고, 슬라이스 이동 시 경로가 안 깨진다)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { port: 5180 },
});
