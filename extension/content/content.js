// extension/content/content.js
(() => {
    // =========================
    // 0) 중복 주입 방지
    // =========================
    if (document.getElementById("bj-helper-panel")) return;

    // =========================
    // 1) 토글 버튼
    // =========================
    const btn = document.createElement("button");
    btn.id = "bj-helper-toggle-btn";
    btn.textContent = "Helper 열기";
    document.body.appendChild(btn);

    // =========================
    // 2) 패널 + 리사이저 + React 루트(고유 id)
    // =========================
    const panel = document.createElement("div");
    panel.id = "bj-helper-panel";

    const resizer = document.createElement("div");
    resizer.id = "bj-helper-resizer";
    panel.appendChild(resizer);

    const root = document.createElement("div");
    root.id = "bj-helper-react-root"; // ★ 고유 id로 변경
    panel.appendChild(root);

    document.body.appendChild(panel);

    // =========================
    // 2.5) 레이아웃 스타일
    // =========================
    const styleEl = document.createElement("style");
    styleEl.id = "bj-helper-style";
    styleEl.textContent = `
    :root {
      --bj-panel-width: 50vw;
      --bj-panel-min: 320px;
      --bj-panel-max: 90vw;
      --bj-z-panel: 2147483000;
      --bj-z-btn:   2147483600;
    }
    /* 버튼: 기본은 화면 오른쪽 아래(패널 닫힘 시) */
    #bj-helper-toggle-btn {
      position: fixed; right: 16px; bottom: 16px; z-index: var(--bj-z-btn);
      padding: 10px 14px; border: none; border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      background: #111827; color: #fff; font-size: 14px; cursor: pointer;
    }
    /* 패널 */
    #bj-helper-panel {
      position: fixed; top: 0; right: 0; height: 100vh;
      width: var(--bj-panel-width); max-width: var(--bj-panel-max); min-width: var(--bj-panel-min);
      background: #fff; box-shadow: -8px 0 24px rgba(0,0,0,.1);
      display: none; z-index: var(--bj-z-panel); overflow: hidden;
    }
    #bj-helper-panel.open { display: block; }

    /* 리사이저 */
    #bj-helper-resizer {
      position: absolute; left: 0; top: 0; width: 6px; height: 100%;
      cursor: col-resize; background: transparent;
    }
    #bj-helper-resizer::after {
      content: ""; position: absolute; right: -1px; top: 0; width: 2px; height: 100%;
      opacity: .15; background: #000;
    }

    /* React 루트 */
    #bj-helper-react-root {
      position: absolute; left: 6px; top: 0; right: 0; bottom: 0;
      overflow: auto;
    }

    /* 패널 열릴 때 본문을 오른쪽으로 밀기 */
    html.bj-helper-open body {
      padding-right: var(--bj-panel-width) !important;
      box-sizing: border-box !important;
      transition: padding-right .2s ease;
      overflow-x: hidden !important;
    }

    /* 안전망 */
    html.bj-helper-open body > *:not(#bj-helper-panel):not(#bj-helper-toggle-btn) {
      max-width: calc(100vw - var(--bj-panel-width)) !important;
      overflow: visible !important;
    }

    /* 패널 열렸을 땐 버튼을 패널 안으로 이동해 오른쪽 아래 고정 */
    #bj-helper-panel.open #bj-helper-toggle-btn {
      position: absolute; right: 16px; bottom: 16px;
    }

    /* 작은 화면에서는 패널이 전체 */
    @media (max-width: 800px) {
      :root { --bj-panel-width: 100vw; }
      html.bj-helper-open body { padding-right: 0 !important; }
      #bj-helper-panel { width: 100vw !important; left: 0; }
    }
  `;
    document.head.appendChild(styleEl);

    // =========================
    // 3) 토글
    // =========================
    const setOpen = (open) => {
        if (open) {
            panel.classList.add("open");
            document.documentElement.classList.add("bj-helper-open");
            btn.textContent = "Helper 닫기";
            if (btn.parentElement !== panel) panel.appendChild(btn);
        } else {
            panel.classList.remove("open");
            document.documentElement.classList.remove("bj-helper-open");
            btn.textContent = "Helper 열기";
            if (btn.parentElement !== document.body) document.body.appendChild(btn);
        }
    };
    btn.addEventListener("click", () => setOpen(!panel.classList.contains("open")));

    // =========================
    // 4) 드래그 리사이즈
    // =========================
    let dragging = false, startX = 0, startWidthPx = 0;
    const px = (v) => `${Math.round(v)}px`;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const getPanelWidthPx = () => panel.getBoundingClientRect().width;
    const getBoundsPx = () => {
        const cs = getComputedStyle(document.documentElement);
        const minStr = cs.getPropertyValue("--bj-panel-min").trim() || "320px";
        const maxStr = cs.getPropertyValue("--bj-panel-max").trim() || "90vw";
        const toPx = (s) =>
            s.endsWith("vw") ? (parseFloat(s)/100)*window.innerWidth
                : s.endsWith("px") ? parseFloat(s)
                    : parseFloat(s) || 320;
        return { min: toPx(minStr), max: toPx(maxStr) };
    };
    const onMouseMove = (e) => {
        if (!dragging) return;
        const dx = startX - e.clientX;
        const { min, max } = getBoundsPx();
        const newWidth = clamp(startWidthPx + dx, min, max);
        document.documentElement.style.setProperty("--bj-panel-width", px(newWidth));
    };
    const onMouseUp = () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };
    resizer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (!panel.classList.contains("open")) setOpen(true);
        dragging = true;
        startX = e.clientX;
        startWidthPx = getPanelWidthPx();
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    });

    // =========================
    // 5) React 번들 동적 import (CSP 우회)
    // =========================
    const moduleUrl = chrome.runtime.getURL("dist/react-panel.js");
    import(moduleUrl)
        .then(() => console.log("[BJ-Helper] panel module loaded"))
        .catch((e) => console.error("[BJ-Helper] panel module load failed", e, moduleUrl));

    // =========================
    // 6) 제출 결과 감지(옵션)
    // =========================
    try {
        const observer = new MutationObserver(() => {
            if (document.body && document.body.innerText.includes("맞았습니다!!")) {
                chrome.runtime.sendMessage({ type: "SUBMIT_RESULT", verdict: "AC", at: Date.now() });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
})();
