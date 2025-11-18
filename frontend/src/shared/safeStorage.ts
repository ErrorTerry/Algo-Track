// 로컬스토리지 자동정리 함수

export function safeSetProblemStorage(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
        return;
    } catch (e) {
        console.warn("⚠️ localStorage 용량 부족! 오래된 데이터 제거 중...", e);
    }

    // 저장 실패 → 오래된 문제 데이터부터 삭제
    const targets = Object.keys(localStorage)
        .filter(k =>
            k.startsWith("ide_code_") ||
            k.startsWith("ide_results_") ||
            k.startsWith("ide_language_")
        )
        .sort(); // 오름차순: 문제 번호 작은 순 → 오래된 순

    if (targets.length > 0) {
        const oldest = targets[0];
        console.log(`🗑️ 오래된 문제 데이터 삭제: ${oldest}`);
        localStorage.removeItem(oldest);
    }

    // 삭제 후 재시도
    try {
        localStorage.setItem(key, value);
        console.log("✨ 재저장 성공!");
    } catch (e) {
        console.warn("❌ 재저장 실패! localStorage 가득 참", e);
    }
}
