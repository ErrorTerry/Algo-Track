// src/components/stats/AlgorithmGoalStatsSection.tsx
import { BarChart3 } from "lucide-react";

type AlgorithmGoalStat = {
    name: string;
    solved: number;
    goal: number;
    colorClass: string;
    accentClass: string;
};

// 👉 여기 더미데이터 넣기
const ALGO_STATS: AlgorithmGoalStat[] = [
    {
        name: "다이나믹 프로그래밍",
        solved: 5,
        goal: 20,
        colorClass: "bg-[#EDF4FF] border-[#C6DAFF]",
        accentClass: "text-[#2563EB]",
    },
    {
        name: "그래프 탐색",
        solved: 7,
        goal: 20,
        colorClass: "bg-[#EBF8F2] border-[#C4EEDB]",
        accentClass: "text-[#16A34A]",
    },
    {
        name: "그리디",
        solved: 10,
        goal: 20,
        colorClass: "bg-[#F5EFFD] border-[#E2CCFF]",
        accentClass: "text-[#7C3AED]",
    },
    {
        name: "이분 탐색",
        solved: 4,
        goal: 20,
        colorClass: "bg-[#FFF4E6] border-[#FFD8A8]",
        accentClass: "text-[#F97316]",
    },
    {
        name: "자료구조",
        solved: 8,
        goal: 20,
        colorClass: "bg-[#FFECEF] border-[#FFC9D4]",
        accentClass: "text-[#EC4899]",
    },
    {
        name: "문자열",
        solved: 6,
        goal: 20,
        colorClass: "bg-[#E6F7FF] border-[#B3E5FF]",
        accentClass: "text-[#0EA5E9]",
    },
    {
        name: "수학",
        solved: 9,
        goal: 20,
        colorClass: "bg-[#FFF8E1] border-[#FFEAA7]",
        accentClass: "text-[#EAB308]",
    },
];

// 카드 하나
export function AlgorithmGoalCard({ stat }: { stat: AlgorithmGoalStat }) {
    const percent = Math.round((stat.solved / stat.goal) * 100);

    return (
        <div className={`h-full rounded-2xl border p-4 ${stat.colorClass}`}>
            <p className="text-sm font-semibold text-base-content/80">{stat.name}</p>

            <p className={`mt-3 text-lg font-semibold ${stat.accentClass}`}>
                {stat.solved}
                <span className="text-base text-base-content/70"> / {stat.goal}</span>
            </p>

            <p className="mt-1 text-xs text-base-content/60">{percent}% 달성</p>
        </div>
    );
}

export default function AlgorithmGoalStatsSection() {
    const stats = ALGO_STATS;
    const isOdd = stats.length % 2 === 1;

    return (
        <section className="rounded-2xl border border-base-200 bg-base-100/90 p-5 shadow-sm space-y-4">

            {/* 헤더 */}
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-base-200/80">
                    <BarChart3 className="w-4 h-4 text-violet-500" />
                </div>

                <div>
                    <p className="text-xl font-semibold text-base-content">
                        알고리즘별 통계 (이번 달)
                    </p>
                    <p className="text-lg text-base-content/60">
                        목표 대비 알고리즘별 풀이 현황이에요.
                    </p>
                </div>
            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, idx) => {
                    const isLastOdd = isOdd && idx === stats.length - 1;
                    return (
                        <div key={stat.name} className={isLastOdd ? "sm:col-span-2" : ""}>
                            <AlgorithmGoalCard stat={stat} />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
