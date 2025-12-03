// 알고리즘 조언 생성 + 강조(볼드) 처리
import type { MonthlySummaryResponse } from "../../../types/statistics";

export type AdviceType = "warn" | "info" | "success";

export type AdviceItem = {
    type: AdviceType;
    html: string;
};

// 🔥 특정 알고리즘명만 정확하게 볼드 처리
function boldAlgorithmName(text: string, name: string): string {
    if (!name) return text;

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 정규식 안전 처리
    const reg = new RegExp(`${escaped} 알고리즘`, "g");

    return text.replace(
        reg,
        `<strong class="font-semibold text-gray-900">${name} 알고리즘</strong>`
    );
}

// 🔥 숫자와 퍼센트 강조 + 소수 두 자리 처리
function highlight(text: string): string {
    let result = text;

    // 1) 퍼센트 (정수 또는 소수)
    result = result.replace(/(\d+(\.\d+)?%)/g, (match) => {
        const num = parseFloat(match.replace("%", ""));
        const fixed = Number.isInteger(num) ? num : num.toFixed(2);
        return `<strong class='font-semibold text-gray-900'>${fixed}%</strong>`;
    });

    // 2) 숫자 + 단위 (문제/일/주/점)
    result = result.replace(/(\d+(\.\d+)?)(문제|일|주|점)/g, (_, numStr, __, unit) => {
        const num = parseFloat(numStr);
        const fixed = Number.isInteger(num) ? num : num.toFixed(2);
        return `<strong class='font-semibold text-gray-900'>${fixed}${unit}</strong>`;
    });

    return result;
}

export function makeAdviceItems(summary: MonthlySummaryResponse["advice"]): AdviceItem[] {
    const items: AdviceItem[] = [];
    if (!summary) return items;

    // ============================
    // 1) 가장 낮은 비중 알고리즘
    // ============================
    if (summary.lowestRatioAlgorithmName && summary.lowestRatioPercent != null) {
        let text = `이번 달에는 ${summary.lowestRatioAlgorithmName} 알고리즘의 풀이 비중이 ${summary.lowestRatioPercent}%로 가장 낮아요. 시간을 내서 조금 더 연습해보면 좋을 것 같아요.`;

        text = highlight(text);
        text = boldAlgorithmName(text, summary.lowestRatioAlgorithmName);

        items.push({ type: "warn", html: text });
    }

    // ============================
    // 2) 알고리즘 편향 유무
    // ============================
    if (summary.biasedAlgorithmName == null) {
        const text = highlight(
            "이번 달에는 다양한 알고리즘을 고르게 풀이했어요. 균형 잡힌 학습 흐름을 잘 유지하고 있어요."
        );
        items.push({ type: "success", html: text });
    } else {
        let text = `이번 달은 ${summary.biasedAlgorithmName} 알고리즘 풀이가 전체의 ${summary.biasedAlgorithmPercent}%를 차지하고 있어요. 다른 알고리즘도 함께 풀어보면 학습 균형을 맞추는 데 도움이 될 거예요.`;

        text = highlight(text);
        text = boldAlgorithmName(text, summary.biasedAlgorithmName);

        items.push({ type: "warn", html: text });
    }

    // ============================
    // 3) 주간 난이도 변화
    // ============================
    if (summary.difficultyWeeklyTrend) {
        const t = summary.difficultyWeeklyTrend;
        const streak = summary.difficultyWeeklyTrendStreakWeeks;

        let text = "";

        if (t === "UP") {
            text =
                streak === 0
                    ? "이번 주는 지난주보다 난이도가 조금 더 높은 문제들을 도전했어요. 좋은 흐름이에요."
                    : `최근 ${streak}주 동안 꾸준히 난이도를 높여가고 있어요. 성장 속도가 인상적이에요.`;
            items.push({ type: "success", html: highlight(text) });
        }

        if (t === "DOWN") {
            text =
                streak === 0
                    ? "이번 주는 지난주보다 쉬운 문제들을 풀었어요. 학습 페이스를 다시 조정해보는 것도 좋아요."
                    : `최근 ${streak}주 동안 난이도가 조금씩 낮아지고 있어요. 어려운 문제도 가끔 도전해보면 실력 향상에 도움이 돼요.`;
            items.push({ type: "warn", html: highlight(text) });
        }

        if (t === "SAME") {
            text =
                streak === 0
                    ? "이번 주는 지난주와 비슷한 수준의 문제를 풀었어요. 안정적인 학습 흐름을 이어가고 있어요."
                    : `최근 ${streak}주 동안 비슷한 난이도의 문제를 꾸준히 풀고 있어요. 때때로 새로운 난이도에 도전해보는 것도 도움이 될 거예요.`;
            items.push({ type: "info", html: highlight(text) });
        }

        if (t === "NONE") {
            text = "난이도 변화 데이터를 파악하기엔 풀이 수가 부족해요. 조금 더 다양한 문제를 풀어보면 분석이 가능해져요.";
            items.push({ type: "warn", html: highlight(text) });
        }
    }

    // ============================
    // 4) 월간 난이도 변화
    // ============================
    if (summary.difficultyMonthlyTrend) {
        const t = summary.difficultyMonthlyTrend;

        const textMap: Record<"UP" | "DOWN" | "SAME" | "NONE", string> = {
            UP: "이번 달 평균 난이도가 지난달보다 높아요. 한 단계 성장한 모습이에요.",
            DOWN: "이번 달 평균 난이도가 지난달보다 조금 낮아요. 난이도 높은 문제에도 가끔 도전해보면 실력 향상에 도움이 될 거예요.",
            SAME: "이번 달 평균 난이도는 지난달과 비슷해요. 안정적으로 실력을 유지하고 있어요.",
            NONE: "난이도 분석을 위한 데이터가 부족해요. 다양한 난이도의 문제를 조금 더 풀어보면 좋겠어요.",
        };

        const type = t === "UP" ? "success" : t === "SAME" ? "info" : "warn";

        items.push({
            type,
            html: highlight(textMap[t as keyof typeof textMap]),
        });
    }

    return items;
}
