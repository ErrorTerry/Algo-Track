// src/panel/panelEntry.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../App";
import "../index.css";

// Shadow DOM 안 root 가져오는 함수
function getRoot(): HTMLElement {
    const globalRoot = (globalThis as any).__ALGO_PANEL_ROOT;
    if (globalRoot instanceof HTMLElement) return globalRoot;

    const el = document.getElementById("algo-react-root");
    if (el) return el;

    const fallback = document.createElement("div");
    fallback.id = "algo-react-root";
    document.body.appendChild(fallback);
    return fallback;
}

const rootEl = getRoot();

createRoot(rootEl).render(
    <StrictMode>
        <App />
    </StrictMode>
);
