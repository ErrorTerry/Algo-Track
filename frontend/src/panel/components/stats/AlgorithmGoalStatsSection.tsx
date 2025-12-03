// src/panel/components/stats/AlgorithmGoalStatsSection.tsx
import { BarChart3 } from "lucide-react";
import type { MonthlySummaryResponse } from "../../../types/statistics";

type Props = {
    algorithmStats?: MonthlySummaryResponse["algorithmStats"];
};

type AlgorithmGoalStat = {
    name: string;
    solved: number;
    goal: number;
};

// 🎨 7개 색상 (반복)
const COLOR_SET = [
    {
        bg: "bg-[#EDF4FF]",
        border: "border-[#C6DAFF]",
        accent: "text-[#2563EB]",
    },
    {
        bg: "bg-[#EBF8F2]",
        border: "border-[#C4EEDB]",
        accent: "text-[#16A34A]",
    },
    {
        bg: "bg-[#F5EFFD]",
        border: "border-[#E2CCFF]",
        accent: "text-[#7C3AED]",
    },
    {
        bg: "bg-[#FFF4E6]",
        border: "border-[#FFD8A8]",
        accent: "text-[#F97316]",
    },
    {
        bg: "bg-[#FFECEF]",
        border: "border-[#FFC9D4]",
        accent: "text-[#EC4899]",
    },
    {
        bg: "bg-[#E6F7FF]",
        border: "border-[#B3E5FF]",
        accent: "text-[#0EA5E9]",
    },
    {
        bg: "bg-[#FFF8E1]",
        border: "border-[#FFEAA7]",
        accent: "text-[#EAB308]",
    },
];

function AlgorithmGoalCard({
                               stat,
                               color,
                           }: {
    stat: AlgorithmGoalStat;
    color: (typeof COLOR_SET)[number];
}) {
    const percent =
        stat.goal > 0 ? Math.round((stat.solved / stat.goal) * 100) : 0;

    return (
        <div
            className={`h-full rounded-2xl border p-4 ${color.bg} ${color.border}`}
        >
            <p className="text-xl font-semibold text-base-content/80">
                {stat.name}
            </p>

            <p className={`mt-3 text-2xl font-semibold ${color.accent}`}>
                {stat.solved}
                <span className="text-lg text-base-content/70">
                    {" "}
                    / {stat.goal}
                </span>
            </p>

            <p className="mt-1 text-lg text-base-content/60">
                {percent}% 달성
            </p>
        </div>
    );
}

export default function AlgorithmGoalStatsSection({ algorithmStats }: Props) {
    // 🔁 API → 내부용 구조로 변환 (algorithmName → name)
    const stats: AlgorithmGoalStat[] = (algorithmStats ?? []).map((s) => ({
        name: s.algorithmName,
        solved: s.solved,
        goal: s.goal,
    }));

    const isOdd = stats.length % 2 === 1;

    return (
        <section className="rounded-2xl border border-base-200 bg-base-100/90 p-5 shadow-sm space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-base-200/80">
                    <BarChart3 className="w-4 h-4 text-violet-500" />
                </div>

                <p className="text-2xl font-semibold text-base-content">
                    알고리즘별 통계
                </p>
                <p className="text-xl text-base-content/60">
                    목표 대비 알고리즘별 풀이 현황
                </p>

            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, idx) => {
                    const color = COLOR_SET[idx % COLOR_SET.length]; // 🎨 7개 색 반복
                    const isLastOdd = isOdd && idx === stats.length - 1;

                    return (
                        <div
                            key={stat.name}
                            className={isLastOdd ? "sm:col-span-2" : ""}
                        >
                            <AlgorithmGoalCard stat={stat} color={color} />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
