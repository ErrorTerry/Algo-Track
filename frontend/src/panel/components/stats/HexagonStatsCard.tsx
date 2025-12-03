// src/panel/components/stats/HexagonStatsCard.tsx
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Shapes } from "lucide-react"; // 아이콘 추가 ⭐
import type { MonthlySummaryResponse } from "../../../types/statistics";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
    hexagon?: MonthlySummaryResponse["hexagon"];
};

export default function HexagonStatsCard({ hexagon = [] }: Props) {
    if (!hexagon || hexagon.length === 0) {
        return (
            <div className="rounded-2xl border border-base-200 bg-base-100/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                        <Shapes className="w-5 h-5 text-sky-500" />
                    </div>
                    <p className="text-2xl font-semibold text-base-content">
                        알고리즘별 풀이 분포
                    </p>
                </div>

                <p className="py-10 text-center text-base-content/60 text-lg">
                    분석할 데이터가 아직 부족해요.
                </p>
            </div>
        );
    }

    const rawValues = hexagon.map((h) => h.ratio);
    const labels = hexagon.map((h) => h.label);
    const maxVal = Math.max(...rawValues, 1);
    const values = rawValues.map((v) => (v / maxVal) * 100);

    const data = {
        labels,
        datasets: [
            {
                label: "알고리즘 비중",
                data: values,
                backgroundColor: "rgba(59,130,246,0.25)",
                borderColor: "rgba(59,130,246,1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(59,130,246,1)",
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            r: {
                type: "radialLinear",
                min: 0,
                max: 100,
                angleLines: { color: "#e5e7eb" },
                grid: { color: "#e5e7eb" },
                pointLabels: {
                    color: "#374151",
                    padding: 12,
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                },
                ticks: { display: false },
            },
        },
    } as const;

    /** 🔥 가장 높은 비율 항목 */
    const best = hexagon.reduce((a, b) => (a.ratio > b.ratio ? a : b));

    return (
        <div className="rounded-2xl border border-base-200 bg-base-100/90 p-6 shadow-sm">
            {/* ⭐ 타이틀 + 아이콘 복구 */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                    <Shapes className="w-5 h-5 text-sky-500" />
                </div>
                <p className="text-2xl font-semibold text-base-content">
                    알고리즘별 풀이 분포
                </p>
            </div>

            {/* ⭐ 레이더 차트 */}
            <div className="relative w-full h-[350px] mb-6">
                <Radar data={data} options={options} />
            </div>

            {/* ⭐ 하단 문구 복구 */}
            <p className="text-center text-xl text-base-content/70 mt-6">
                이번 달엔 <span className="font-semibold text-base-content">{best.label}</span> 문제를 가장 많이 풀었어요! 🚀
            </p>
        </div>
    );
}
