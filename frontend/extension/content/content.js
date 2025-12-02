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
    root.id = "bj-helper-react-root"; // ★ 고유 id
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
    // 6-3) 문제 페이지에서 알고리즘명 파싱해서 저장
    //  → 이제 "배열"로 저장
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
        return names; // 배열 그대로
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
                // 배열로 저장
                map[problemId] = names;

                chrome.storage.local.set({ algoByProblemId: map }, () => {
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
        // 내 status 페이지가 아니면 아무것도 안 함
        if (!isMyStatusPage()) return;

        const row = parseLatestSubmissionRow();
        if (!row) return;

        const today = getTodayYmd();

        // 1. 오늘 제출이 아니면 바로 스킵
        if (row.solvedYmd !== today) return;

        // 2. 결과가 "맞았습니다!!" 인지 확인
        if (!row.resultText.includes("맞았습니다!!")) return;

        // 3. problemId 파싱 실패 시 전체 스킵
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

                    // 이미 처리한 제출이면 바로 스킵 (팝업도 안 뜨게)
                    if (processed.includes(row.submissionId)) {
                        return;
                    }

                    let map = {};
                    if (res.algoByProblemId && typeof res.algoByProblemId === "object") {
                        map = res.algoByProblemId;
                    }

                    const raw = map[String(row.problemId)] || null;

                    // 문자열/배열 모두 케어
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

                    // ===== 알고리즘 최종 선택 =====
                    let finalAlgorithmName = candidates[0]; // 기본값: 첫 번째

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
                        problemId: row.problemId,          // 숫자
                        solvedDate: row.solvedYmd,         // yyyy-MM-dd
                        tierNumber: tierNumber,            // 숫자 문자열 or "NULL"
                        algorithmName: finalAlgorithmName, // ★ 단일 알고리즘명
                        solvedAt: row.solvedAt.getTime(),  // ms timestamp (옵션)
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
                        { processedSubmissions: next },
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

    // status 페이지일 때: 일정 시간 동안 최신 제출 감시
    if (isStatusPage()) {
        setTimeout(checkAndSendLatestSubmission, 300);

        const START = Date.now();
        const MAX_DURATION_MS = 5 * 60 * 1000; // 5분
        const INTERVAL_MS = 4000; // 4초

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
        return { problemId, problemTitle };
    };

    const extractSamplesFromDOM = () => {
        const inputBlocks = new Map();
        const outputBlocks = new Map();

        // A) id 기반 (#sample-input-1, #sample-output-1)
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

        document.dispatchEvent(
            new CustomEvent("boj:samples", { detail: payload, bubbles: true })
        );
        try {
            window.postMessage({ type: "BOJ_SAMPLES", payload }, location.origin);
        } catch {}

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
                            { nickname, origin: ev.origin }
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
