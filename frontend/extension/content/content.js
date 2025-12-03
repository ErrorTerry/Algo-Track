// extension/content/content.js
(() => {
    // =========================
    // 0) 중복 주입 방지
    // =========================
    if (document.getElementById("algo-panel")) return;

    // =========================
    // 1) 토글 버튼
    // =========================
    const btn = document.createElement("button");
    btn.id = "algo-toggle-btn";
    btn.textContent = "Algo-Track";
    document.body.appendChild(btn);

    // =========================
    // 2) 패널 + 리사이저 + Shadow DOM + React 루트
    // =========================
    const panel = document.createElement("div");
    panel.id = "algo-panel";

    const resizer = document.createElement("div");
    resizer.id = "algo-resizer";
    panel.appendChild(resizer);

    // ★ Shadow DOM 호스트
    const reactHost = document.createElement("div");
    reactHost.id = "algo-react-host";
    panel.appendChild(reactHost);

    // ★ Shadow DOM 생성
    const shadowRoot = reactHost.attachShadow({mode: "open"});

    // Pretendard
    const fontStyle = document.createElement("style");
    fontStyle.textContent = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard...');
  :host, * { font-family: Pretendard, sans-serif !important; }
`;
    shadowRoot.appendChild(fontStyle);

// 👉 여기에 모나코 고정폭 폰트 스타일 추가!
    const monoFixStyle = document.createElement("style");
    monoFixStyle.textContent = `
  .algo-ide-editor .monaco-editor,
  .algo-ide-editor .monaco-editor * {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Courier New', monospace !important;
  }
`;
    shadowRoot.appendChild(monoFixStyle);


    // ★ Shadow DOM 안에 React 루트 & CSS 주입
    const reactStyleLink = document.createElement("link");
    reactStyleLink.rel = "stylesheet";
    // 👉 빌드 결과 CSS 파일 이름 맞춰서 수정 가능
    reactStyleLink.href = chrome.runtime.getURL("dist/react-panel.css");
    shadowRoot.appendChild(reactStyleLink);

    const reactRoot = document.createElement("div");
    reactRoot.id = "algo-react-root";
    shadowRoot.appendChild(reactRoot);

    // React 번들이 참고할 수 있게 전역에 노출
    (globalThis).__ALGO_PANEL_SHADOW_ROOT = shadowRoot;
    (globalThis).__ALGO_PANEL_ROOT = reactRoot;

    document.body.appendChild(panel);

    // =========================
    // 2.5) 레이아웃 스타일
    // =========================
    const styleEl = document.createElement("style");
    styleEl.id = "algo-panel-style";
    styleEl.textContent = `
    :root {
      --algo-panel-width: 50vw;
      --algo-panel-min: 320px;
      --algo-panel-max: 90vw;
      --algo-z-panel: 2147483000;
      --algo-z-btn:   2147483600;
    }
    /* 버튼: 기본은 화면 오른쪽 아래(패널 닫힘 시) */
    #algo-toggle-btn {
      position: fixed; right: 16px; bottom: 16px; z-index: var(--algo-z-btn);
      padding: 10px 14px; border: none; border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      background: #111827; color: #fff; font-size: 14px; cursor: pointer;
    }
    /* 패널 */
    #algo-panel {
      position: fixed; top: 0; right: 0; height: 100vh;
      width: var(--algo-panel-width); max-width: var(--algo-panel-max); min-width: var(--algo-panel-min);
      background: #fff; box-shadow: -8px 0 24px rgba(0,0,0,.1);
      display: none; z-index: var(--algo-z-panel); overflow: hidden;
    }
    #algo-panel.open { display: block; }

    /* 리사이저 */
    #algo-resizer {
      position: absolute; left: 0; top: 0; width: 6px; height: 100%;
      cursor: col-resize; background: transparent;
    }
    #algo-resizer::after {
      content: ""; position: absolute; right: -1px; top: 0; width: 2px; height: 100%;
      opacity: .15; background: #000;
    }

    /* React 호스트(Shadow DOM) 영역 */
    #algo-react-host {
      position: absolute; left: 6px; top: 0; right: 0; bottom: 0;
      overflow: auto;
    }

    html.algo-panel-open body {
      width: calc(100vw - var(--algo-panel-width));
      overflow-x: auto;
    }

    /* 백준이 잡고 있는 고정 max-width 깨기 */
    html.algo-panel-open body #wrapper,
    html.algo-panel-open body .wrapper,
    html.algo-panel-open body #content,
    html.algo-panel-open body .container {
      max-width: 100% !important;
      width: 100% !important;
    }
    


    /* 패널 열렸을 땐 버튼을 패널 안으로 이동해 오른쪽 아래 고정 */
    #algo-panel.open #algo-toggle-btn {
      position: absolute; right: 16px; bottom: 16px;
    }

    /* 작은 화면에서는 패널이 전체 */
    @media (max-width: 800px) {
      :root { --algo-panel-width: 100vw; }
      html.algo-panel-open body { padding-right: 0 !important; }
      #algo-panel { width: 100vw !important; left: 0; }
    }
    
    
    /* ================================
       백준 테이블 글자 크기 키우기
       (패널 열렸든 말든 항상 적용)
    ================================= */
    table,
    table td,
    table th {
      font-size: 13px !important;  /* 너무 작으면 14px, 15px로 올려봐도 됨 */
      line-height: 1.4;
    }
  `;
    document.head.appendChild(styleEl);

    // =========================
    // 3) 토글
    // =========================
    const setOpen = (open) => {
        if (open) {
            panel.classList.add("open");
            document.documentElement.classList.add("algo-panel-open");
            btn.textContent = "Algo-Track";
            if (btn.parentElement !== panel) panel.appendChild(btn);
        } else {
            panel.classList.remove("open");
            document.documentElement.classList.remove("algo-panel-open");
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
        const minStr = cs.getPropertyValue("--algo-panel-min").trim() || "320px";
        const maxStr = cs.getPropertyValue("--algo-panel-max").trim() || "90vw";
        const toPx = (s) =>
            s.endsWith("vw")
                ? (parseFloat(s) / 100) * window.innerWidth
                : s.endsWith("px")
                    ? parseFloat(s)
                    : parseFloat(s) || 320;
        return {min: toPx(minStr), max: toPx(maxStr)};
    };
    const onMouseMove = (e) => {
        if (!dragging) return;
        const dx = startX - e.clientX;
        const {min, max} = getBoundsPx();
        const newWidth = clamp(startWidthPx + dx, min, max);
        document.documentElement.style.setProperty("--algo-panel-width", px(newWidth));
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
        .then(() => console.log("[AlgoPanel] panel module loaded"))
        .catch((e) =>
            console.error("[AlgoPanel] panel module load failed", e, moduleUrl)
        );

    // ===========================================================
    // 6) 공통 URL/도움 함수
    // ===========================================================
    const isStatusPage = () => location.pathname.startsWith("/status");
    const isProblemPage = () => /\/problem\/\d+/.test(location.pathname);

    const getProblemIdFromPath = () => {
        const m = location.pathname.match(/\/problem\/(\d+)/);
        return m ? m[1] : null;
    };

    const getTodayYmd = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const timestampToYmd = (tsStr) => {
        if (!tsStr) return null;
        const tsNum = Number(tsStr);
        if (!Number.isFinite(tsNum)) return null;
        const d = new Date(tsNum * 1000); // 백준 timestamp는 초 단위
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return {
            ymd: `${y}-${m}-${day}`,
            date: d,
        };
    };

    // ===========================================================
    // 6-1) 로그인 유저/페이지 유저 구분
    // ===========================================================
    const getLoggedInUserId = () => {
        const link = document.querySelector(
            "ul.loginbar a.username[href^='/user/']"
        );
        if (!link) return null;

        const href = link.getAttribute("href") || "";
        const m = href.match(/\/user\/([^/?#]+)/);
        if (m && m[1]) return decodeURIComponent(m[1]);

        const text = (link.textContent || link.innerText || "").trim();
        return text || null;
    };

    const getStatusPageUserId = () => {
        const search = new URLSearchParams(location.search);
        const uid = search.get("user_id");
        if (uid) return uid;
        // 쿼리 없으면 "내 제출" 페이지 → 로그인 아이디 사용
        return getLoggedInUserId();
    };

    const isMyStatusPage = () => {
        if (!isStatusPage()) return false;
        const myId = getLoggedInUserId();
        const pageId = getStatusPageUserId();
        if (!myId || !pageId) return false;
        return myId === pageId;
    };

    // ===========================================================
    // 6-2) solved.ac 티어 숫자 파싱
    // ===========================================================
    const parseTierNumberFromRow = (tr) => {
        if (!tr) return "NULL";
        const img = tr.querySelector("img.solvedac-tier");
        if (!img) return "NULL";

        const src = img.getAttribute("src") || "";
        const match =
            src.match(/tier[_-]small[_-]?(\d+)\.(svg|png|webp)$/i) ||
            src.match(/(\d+)\.(svg|png|webp)$/i);
        if (!match) return "NULL";
        return match[1]; // 숫자 문자열
    };

    // ===========================================================
    // 6-3) 문제 페이지에서 알고리즘명 파싱해서 저장 (배열)
    // ===========================================================
    const parseAlgorithmNamesOnProblemPage = () => {
        const root =
            document.querySelector("#problem_tags") ||
            document.querySelector(".problem-tags") ||
            document.querySelector("#problem_tag") ||
            document.querySelector("#problem_tags_container");
        if (!root) return null;

        const anchors = Array.from(root.querySelectorAll("a"));
        const names = anchors
            .map((a) => (a.textContent || a.innerText || "").trim())
            .filter(Boolean);

        if (!names.length) return null;
        return names;
    };

    const saveProblemAlgorithmToStorage = () => {
        const problemId = getProblemIdFromPath();
        if (!problemId) return;

        const names = parseAlgorithmNamesOnProblemPage();
        if (!names || !names.length) return;

        try {
            chrome.storage.local.get(["algoByProblemId"], (res) => {
                let map = {};
                if (res.algoByProblemId && typeof res.algoByProblemId === "object") {
                    map = res.algoByProblemId;
                }
                map[problemId] = names;

                chrome.storage.local.set({algoByProblemId: map}, () => {
                    console.log(
                        "[AlgoTrack] stored algorithmNames",
                        problemId,
                        names
                    );
                });
            });
        } catch (e) {
            console.error("[AlgoTrack] failed to store algorithmNames", e);
        }
    };

    // 문제 페이지일 때: 알고리즘 분류 한번 저장
    if (isProblemPage()) {
        window.addEventListener("load", () => {
            setTimeout(saveProblemAlgorithmToStorage, 200);
        });
    }

    // ===========================================================
    // 6-4) status 페이지: 최신 제출 1줄만 검사해서 로그 전송
    // ===========================================================
    const parseLatestSubmissionRow = () => {
        const tableBody = document.querySelector("table tbody");
        if (!tableBody) return null;

        const tr = tableBody.querySelector("tr:first-child");
        if (!tr) return null;

        const tds = tr.querySelectorAll("td");
        if (!tds || tds.length === 0) return null;

        // 1) 제출 번호 (첫 번째 칸)
        const submissionId = (tds[0].innerText || "").trim();
        if (!submissionId) return null;

        // 2) 문제 번호 (세 번째 칸: 문제 링크에서 숫자만 추출)
        let problemId = null;
        const problemTd = tds[2] || tds[1];
        if (problemTd) {
            const link = problemTd.querySelector("a[href*='/problem/']");
            const rawText =
                (link && (link.textContent || link.innerText)) ||
                (problemTd.innerText || problemTd.textContent || "");
            const m = rawText.trim().match(/(\d+)/);
            if (m) {
                const n = Number(m[1]);
                if (Number.isFinite(n)) problemId = n;
            }
        }

        // 3) 결과 텍스트
        let resultText = "";
        const resultTd =
            tr.querySelector("td.result") ||
            tds[3] ||
            null;
        if (resultTd) {
            resultText = (resultTd.innerText || resultTd.textContent || "").trim();
        }

        // 4) 날짜(timestamp)
        const timeAnchor = tr.querySelector("a.real-time-update");
        if (!timeAnchor) return null;
        const tsStr = timeAnchor.getAttribute("data-timestamp");
        const tsInfo = timestampToYmd(tsStr);
        if (!tsInfo) return null;

        // 5) solved.ac tier 숫자
        const tierNumber = parseTierNumberFromRow(tr); // 없으면 "NULL"

        return {
            tr,
            submissionId,
            problemId,
            resultText,
            solvedAt: tsInfo.date,
            solvedYmd: tsInfo.ymd,
            timestampRaw: tsStr,
            tierNumber,
        };
    };

    const checkAndSendLatestSubmission = () => {
        if (!isMyStatusPage()) return;

        const row = parseLatestSubmissionRow();
        if (!row) return;

        const today = getTodayYmd();

        if (row.solvedYmd !== today) return;
        if (!row.resultText.includes("맞았습니다!!")) return;

        if (!row.problemId) {
            console.log("[AlgoTrack] problemId parse failed, skip");
            return;
        }

        try {
            chrome.storage.local.get(
                ["processedSubmissions", "algoByProblemId"],
                (res) => {
                    const processed = Array.isArray(res.processedSubmissions)
                        ? res.processedSubmissions
                        : [];

                    if (processed.includes(row.submissionId)) {
                        return;
                    }

                    let map = {};
                    if (res.algoByProblemId && typeof res.algoByProblemId === "object") {
                        map = res.algoByProblemId;
                    }

                    const raw = map[String(row.problemId)] || null;

                    let candidates = [];
                    if (Array.isArray(raw)) {
                        candidates = raw;
                    } else if (typeof raw === "string") {
                        candidates = raw
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                    }

                    if (!candidates.length) {
                        console.log(
                            "[AlgoTrack] algorithmName candidates not found for problem",
                            row.problemId,
                            "skip"
                        );
                        return;
                    }

                    let finalAlgorithmName = candidates[0];

                    if (candidates.length > 1) {
                        const msg =
                            `이 문제의 알고리즘 분류가 여러 개입니다.\n` +
                            candidates
                                .map((name, idx) => `${idx + 1}. ${name}`)
                                .join("\n") +
                            `\n\n이번에 푼 알고리즘 번호를 입력해 주세요.\n` +
                            `(취소하거나 잘못 입력하면 1번으로 기록됩니다.)`;

                        const answer = window.prompt(msg, "1");

                        if (answer != null) {
                            const idx = Number(answer) - 1;
                            if (Number.isFinite(idx) && idx >= 0 && idx < candidates.length) {
                                finalAlgorithmName = candidates[idx];
                            } else {
                                console.log(
                                    "[AlgoTrack] invalid choice, using first algorithm:",
                                    finalAlgorithmName
                                );
                            }
                        } else {
                            console.log(
                                "[AlgoTrack] user canceled choice, using first algorithm:",
                                finalAlgorithmName
                            );
                        }
                    }

                    const tierNumber = row.tierNumber || "NULL";

                    const payload = {
                        type: "SUBMIT_RESULT",
                        verdict: "AC",
                        submissionId: row.submissionId,
                        problemId: row.problemId,
                        solvedDate: row.solvedYmd,
                        tierNumber,
                        algorithmName: finalAlgorithmName,
                        solvedAt: row.solvedAt.getTime(),
                    };

                    try {
                        chrome.runtime.sendMessage(payload);
                    } catch (e) {
                        console.error(
                            "[AlgoTrack] failed to send submit result",
                            e
                        );
                    }

                    const next = [...processed, row.submissionId];
                    chrome.storage.local.set(
                        {processedSubmissions: next},
                        () => {
                            console.log(
                                "[AlgoTrack] submit result sent & stored",
                                row.submissionId,
                                payload
                            );
                        }
                    );
                }
            );
        } catch (e) {
            console.error("[AlgoTrack] error while handling latest submission", e);
        }
    };

    if (isStatusPage()) {
        setTimeout(checkAndSendLatestSubmission, 300);

        const START = Date.now();
        const MAX_DURATION_MS = 5 * 60 * 1000;
        const INTERVAL_MS = 4000;

        const intervalId = setInterval(() => {
            const elapsed = Date.now() - START;
            if (elapsed > MAX_DURATION_MS) {
                clearInterval(intervalId);
                return;
            }
            checkAndSendLatestSubmission();
        }, INTERVAL_MS);
    }

    // ======================================================================
    // 7) ★ 백준 예제 입/출력 파싱 + 이벤트 발사
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
        return {problemId, problemTitle};
    };

    const extractSamplesFromDOM = () => {
        const inputBlocks = new Map();
        const outputBlocks = new Map();

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
                    if (isInput) inputBlocks.set(idx, {label, text});
                    else outputBlocks.set(idx, {label, text});
                }
            });

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
                if (isInputLabel(label)) inputBlocks.set(idx, {label, text});
                if (isOutputLabel(label)) outputBlocks.set(idx, {label, text});
            });
        }

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

    let __lastPayload;

    const emitSamples = () => {
        const {problemId, problemTitle} = getProblemMeta();
        const payload = {
            problemId,
            problemTitle,
            url: location.href,
            samples: extractSamplesFromDOM(),
            parsedAt: Date.now(),
        };
        __lastPayload = payload;

        document.dispatchEvent(
            new CustomEvent("boj:samples", {detail: payload, bubbles: true})
        );
        try {
            window.postMessage({type: "BOJ_SAMPLES", payload}, location.origin);
        } catch {
        }

        console.log("[BojSamples] emit", {
            url: payload.url,
            count: payload.samples.length,
            problemId: payload.problemId,
        });
    };

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

    // =====================================================
    // 8) 로그인 성공 postMessage 브릿지 (웹 → 확장앱)
    // =====================================================
    const allowedOrigins = [
        location.origin,
        "https://algotrack.store",
        "https://www.algotrack.store",
        "http://localhost:5173",
    ];

    window.addEventListener("message", (ev) => {
        if (!allowedOrigins.includes(ev.origin)) {
            return;
        }

        const data = ev.data;
        if (!data || !data.type) return;

        if (data.type === "REQUEST_SAMPLES") {
            emitSamples();
            return;
        }

        if (data.type === "ALGO_LOGIN_SUCCESS") {
            const {accessToken, nickname, profileImageUrl} = data;
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
                            {nickname, origin: ev.origin}
                        );
                    }
                );
            } catch (e) {
                console.error("[AlgoTrack] failed to save login info", e);
            }
        }
    });

    window.__emitBojSamples = emitSamples;
})();
