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
    btn.textContent = "Algo-Track";
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
            btn.textContent = "Algo-Track";
            if (btn.parentElement !== panel) panel.appendChild(btn);
        } else {
            panel.classList.remove("open");
            document.documentElement.classList.remove("bj-helper-open");
            btn.textContent = "Algo-Track";
            if (btn.parentElement !== document.body) document.body.appendChild(btn);
        }
    };
    btn.addEventListener("click", () =>
        setOpen(!panel.classList.contains("open"))
    );

    // =========================
    // 4) 드래그 리사이즈
    // =========================
    let dragging = false,
        startX = 0,
        startWidthPx = 0;
    const px = (v) => `${Math.round(v)}px`;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const getPanelWidthPx = () => panel.getBoundingClientRect().width;
    const getBoundsPx = () => {
        const cs = getComputedStyle(document.documentElement);
        const minStr = cs.getPropertyValue("--bj-panel-min").trim() || "320px";
        const maxStr = cs.getPropertyValue("--bj-panel-max").trim() || "90vw";
        const toPx = (s) =>
            s.endsWith("vw")
                ? (parseFloat(s) / 100) * window.innerWidth
                : s.endsWith("px")
                    ? parseFloat(s)
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
        .catch((e) =>
            console.error("[BJ-Helper] panel module load failed", e, moduleUrl)
        );

    // =========================
    // 6) 제출 결과 감지(옵션)
    // =========================
    try {
        const observer = new MutationObserver(() => {
            if (document.body && document.body.innerText.includes("맞았습니다!!")) {
                chrome.runtime.sendMessage({
                    type: "SUBMIT_RESULT",
                    verdict: "AC",
                    at: Date.now(),
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}

    // ======================================================================
    // 7) ★ 백준 예제 입/출력 파싱 + 이벤트 발사 (이 파일 안에서 전부 처리)
    // ======================================================================
    const normalizePreText = (t) =>
        (t || "")
            .replace(/\u00A0/g, " ")
            .replace(/\r\n?/g, "\n")
            .replace(/\s+$/g, "");

    const extractIndex = (label) => {
        const m = (label || "").match(/(\d+)\s*$/);
        return m ? Number(m[1]) : undefined;
    };

    const getProblemMeta = () => {
        let problemId, problemTitle;
        const m = location.pathname.match(/\/problem\/(\d+)/);
        if (m) problemId = m[1];
        const idTitle = document.querySelector("#problem_title");
        if (idTitle && idTitle.innerText && idTitle.innerText.trim()) {
            problemTitle = idTitle.innerText.trim();
        } else {
            const h = document.querySelector("h1, h2");
            if (h && h.textContent && h.textContent.trim())
                problemTitle = h.textContent.trim();
        }
        return { problemId, problemTitle };
    };

    const extractSamplesFromDOM = () => {
        const inputBlocks = new Map();
        const outputBlocks = new Map();

        // A) id 기반 (#sample-input-1, #sample-output-1) — pre 자체가 id일 수 있음
        document
            .querySelectorAll('[id^="sample-input"], [id^="sample-output"]')
            .forEach((node) => {
                const isInput = node.id.startsWith("sample-input");
                const pre =
                    (node.matches("pre, code, textarea") ? node : null) ||
                    node.querySelector("pre, code, textarea");
                const text = normalizePreText(
                    (pre && (pre.innerText || pre.textContent)) || ""
                );

                const ownLabel =
                    (node.querySelector("h4, h3, .headline, .sample-title") &&
                        node
                            .querySelector("h4, h3, .headline, .sample-title")
                            .textContent.trim()) ||
                    node.getAttribute("aria-label") ||
                    node.id;

                const siblingHeading =
                    (node.previousElementSibling &&
                        node.previousElementSibling.textContent &&
                        node.previousElementSibling.textContent.trim()) ||
                    (node.parentElement &&
                        node.parentElement.querySelector("h4, h3, .headline, .sample-title") &&
                        node.parentElement
                            .querySelector("h4, h3, .headline, .sample-title")
                            .textContent.trim());

                const label =
                    ownLabel || siblingHeading || (isInput ? "예제 입력" : "예제 출력");
                const idx = extractIndex(label) ?? extractIndex(node.id) ?? 1;

                if (text) {
                    if (isInput) inputBlocks.set(idx, { label, text });
                    else outputBlocks.set(idx, { label, text });
                }
            });

        // B) 헤딩 기반 보조 수집
        if (inputBlocks.size === 0 && outputBlocks.size === 0) {
            const headings = Array.from(
                document.querySelectorAll(
                    "h2, h3, h4, .problem-section-title, .sample-title, .section-title"
                )
            );
            const isInputLabel = (s) => /예제\s*입력|sample\s*input/i.test(s);
            const isOutputLabel = (s) => /예제\s*출력|sample\s*output/i.test(s);

            headings.forEach((h) => {
                const label = (h.textContent || "").trim();
                const idx = extractIndex(label) ?? 1;
                const preCandidate =
                    (h.nextElementSibling &&
                        h.nextElementSibling.querySelector("pre, code, textarea")) ||
                    (h.parentElement &&
                        h.parentElement.querySelector("pre, code, textarea"));
                const text = normalizePreText(
                    (preCandidate && preCandidate.textContent) || ""
                );
                if (!text) return;
                if (isInputLabel(label)) inputBlocks.set(idx, { label, text });
                if (isOutputLabel(label)) outputBlocks.set(idx, { label, text });
            });
        }

        // C) 페어링
        const indices = Array.from(
            new Set([...inputBlocks.keys(), ...outputBlocks.keys()])
        ).sort((a, b) => a - b);
        const pairs = indices
            .map((i) => ({
                index: i,
                input: (inputBlocks.get(i) && inputBlocks.get(i).text) || "",
                output: (outputBlocks.get(i) && outputBlocks.get(i).text) || "",
                inputLabel:
                    (inputBlocks.get(i) && inputBlocks.get(i).label) ||
                    `예제 입력 ${i}`,
                outputLabel:
                    (outputBlocks.get(i) && outputBlocks.get(i).label) ||
                    `예제 출력 ${i}`,
            }))
            .filter((p) => p.input || p.output);

        return pairs;
    };

    let __lastPayload; // 최신 payload 캐시

    const emitSamples = () => {
        const { problemId, problemTitle } = getProblemMeta();
        const payload = {
            problemId,
            problemTitle,
            url: location.href,
            samples: extractSamplesFromDOM(),
            parsedAt: Date.now(),
        };
        __lastPayload = payload;

        // 문서 이벤트 (패널/콘솔에서 받기 쉬움)
        document.dispatchEvent(
            new CustomEvent("boj:samples", { detail: payload, bubbles: true })
        );
        // postMessage 브릿지 (훅에서 이 경로만 들어도 OK)
        try {
            window.postMessage({ type: "BOJ_SAMPLES", payload }, location.origin);
        } catch {}

        console.log("[BojSamples] emit", {
            url: payload.url,
            count: payload.samples.length,
            problemId: payload.problemId,
        });
    };

    // 초기 2회(로드 직후/로드 완료) + DOM 변화 감지 + 네비게이션
    emitSamples();
    window.addEventListener("load", () => setTimeout(emitSamples, 50));

    const mo = new MutationObserver(() => {
        clearTimeout(emitSamples.__t);
        emitSamples.__t = setTimeout(emitSamples, 120);
    });
    mo.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    window.addEventListener("popstate", emitSamples);
    window.addEventListener("hashchange", emitSamples);

    window.addEventListener("message", (ev) => {
        if (ev.origin !== location.origin) return;
        const data = ev.data;
        if (!data || !data.type) return;

        if (data.type === "REQUEST_SAMPLES") {
            // 예제 입출력 다시 쏴달라는 요청
            emitSamples();
            return;
        }

        if (data.type === "ALGO_LOGIN_SUCCESS") {
            // 웹 로그인에서 온 토큰/닉네임/프로필 저장
            const { accessToken, nickname, profileImageUrl } = data;
            if (!accessToken) return;

            try {
                chrome.storage.local.set(
                    {
                        accessToken,
                        nickname: nickname || null,
                        profileImageUrl: profileImageUrl || null,
                    },
                    () => {
                        console.log(
                            "[AlgoTrack] login info saved in chrome.storage",
                            { nickname }
                        );
                    }
                );
            } catch (e) {
                console.error("[AlgoTrack] failed to save login info", e);
            }
        }
    });


    // 디버그 훅
    window.__emitBojSamples = emitSamples;
})();
