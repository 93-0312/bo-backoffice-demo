import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles/index.css";

/**
 * 앱 진입점 — React 마운트만 한다. 나머지 모든 구성은 app 레이어가 책임진다.
 * (FSD: main 은 "부팅 한 줄", App 이 실제 앱)
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
