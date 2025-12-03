// src/components/stats/DayOfWeekAverageCard.tsx
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { CalendarDays } from "lucide-react";
import type { MonthlySummaryResponse } from "../../../types/statistics";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
    weekdayStats?: MonthlySummaryResponse["weekdayStats"];
};

export default function DayOfWeekAverageCard({ weekdayStats }: Props) {
    // 데이터 없을 때
    if (!weekdayStats || weekdayStats.length === 0) {
        return (
            <div className="rounded-2xl border border-base-200 bg-base-100/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                        <CalendarDays className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-semibold text-base-content">
                        요일별 평균 풀이 통계
                    </p>
                </div>
                <p className="py-10 text-center text-base-content/60 text-lg">
                    요일별 통계를 만들기엔 풀이 데이터가 아직 부족해요.
                </p>
            </div>
        );
    }

    const labels = weekdayStats.map((d) => d.label); // "월", "화"...
    const values = weekdayStats.map((d) => d.avgSolved);
    const maxVal = Math.max(...values, 1);

    const best = weekdayStats.reduce((a, b) => (a.avgSolved > b.avgSolved ? a : b));

    const data = {
        labels,
        datasets: [
            {
                label: "평균 풀이 수",
                data: values,
                backgroundColor: "rgba(59,130,246,0.9)", // blue-500
                borderRadius: 6,
                barThickness: 26, // 막대 두께
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => `${ctx.parsed.y} 문제`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#6b7280", font: { size: 12 } },
            },
            y: {
                min: 0,
                max: maxVal * 1.1,
                ticks: { display: false },
                grid: { display: false },
            },
        },
    } as const;

    return (
        <div className="rounded-2xl border border-base-200 bg-base-100/90 p-6 shadow-sm">
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                    <CalendarDays className="w-5 h-5 text-emerald-500" />
                </div>

                <p className="text-2xl font-semibold text-base-content">
                    요일별 평균 풀이 통계
                </p>
                <p className="text-xl text-base-content/60 ml-2">
                    한 달 기준 요일별 평균 풀이 수
                </p>
            </div>

            {/* 차트 */}
            <div className="h-64 w-full mb-6">
                <Bar data={data} options={options} />
            </div>

            {/* 하단 문구 */}
            <p
                className="text-center text-xl text-base-content/80"
                dangerouslySetInnerHTML={{
                    __html: `<strong class='font-semibold text-base-content'>${best.label}요일</strong>에 가장 활발하게 문제를 풀고 있어요! 🎉`,
                }}
            />
        </div>
    );
}
