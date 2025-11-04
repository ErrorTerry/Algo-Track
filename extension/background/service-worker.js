// 간단 로그만 남기는 초기 형태
chrome.runtime.onInstalled.addListener(() => {
    console.log("[BJ-Helper] installed.");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "SUBMIT_RESULT") {
        console.log("[BJ-Helper] Submit:", msg);
        // 여기서 chrome.storage 에 누적 or 백엔드로 전송 가능
    }
});
