const API_BASE = "https://algotrack.store";

chrome.runtime.onInstalled.addListener(() => {
    console.log("[AlgoTrack] installed.");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type !== "SUBMIT_RESULT") return;

    console.log("[AlgoTrack] submit received from content:", msg);

    const { algorithmName, problemId, solvedDate, tierNumber } = msg;

    const body = {
        algorithmName: algorithmName,
        problemId: Number(problemId),
        solvedDate: solvedDate,
        problemTier:
            tierNumber === "NULL" || tierNumber == null
                ? null
                : Number(tierNumber),
    };

    console.log("[AlgoTrack] sending /api/solve-log body:", body);

    // 🔥 토큰 가져오기 + Authorization 헤더 붙이기
    chrome.storage.local.get(["accessToken"], (res) => {
        const token = res.accessToken;

        const headers = {
            "Content-Type": "application/json",
        };

        // 🔥 토큰이 있으면 Authorization 추가
        if (token && token.trim() !== "") {
            headers["Authorization"] = `Bearer ${token}`;
            console.log("[AlgoTrack] Attached Authorization header");
        } else {
            console.warn("[AlgoTrack] No accessToken found in chrome.storage");
        }

        fetch(`${API_BASE}/api/solve-log`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        })
            .then(async (resp) => {
                const text = await resp.text().catch(() => "");
                console.log(
                    "[AlgoTrack] /api/solve-log response",
                    resp.status,
                    resp.ok,
                    text
                );
            })
            .catch((err) => {
                console.error("[AlgoTrack] /api/solve-log error", err);
            });
    });
});
