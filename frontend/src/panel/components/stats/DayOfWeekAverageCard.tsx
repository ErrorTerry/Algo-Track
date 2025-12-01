// src/components/stats/DayOfWeekAverageCard.tsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { CalendarDays } from "lucide-react";

type DayStat = {
    day: "월" | "화" | "수" | "목" | "금" | "토" | "일";
    label: string;
    avg: number;
    color: string;
};

const dummyData: DayStat[] = [
    { day: "월", label: "월요일", avg: 1.2, color: "#7CC4FA" }, // stronger sky pastel
    { day: "화", label: "화요일", avg: 2.4, color: "#7ED9A5" }, // stronger mint pastel
    { day: "수", label: "수요일", avg: 0.9, color: "#C3A2FF" }, // stronger lavender pastel
    { day: "목", label: "목요일", avg: 1.9, color: "#FFD48A" }, // stronger cream pastel
    { day: "금", label: "금요일", avg: 0.4, color: "#FFA9C0" }, // stronger pink pastel
    { day: "토", label: "토요일", avg: 0.3, color: "#7FE4DE" }, // stronger aqua pastel
    { day: "일", label: "일요일", avg: 1.5, color: "#FFA5A5" }, // stronger red pastel
];


function getHighlightText(data: DayStat[]) {
    if (!data.length) return "";
    const best = data.reduce((max, cur) => (cur.avg > max.avg ? cur : max), data[0]);
    return `${best.label}에 가장 활발하게 문제를 풀고 있어요! 🎉`;
}

export default function DayOfWeekAverageCard() {
    const highlight = getHighlightText(dummyData);

    return (
        <div className="rounded-2xl border border-base-200 bg-base-100/90 p-5 shadow-sm">
            {/* 헤더 */}
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                    <CalendarDays className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-semibold text-base-content flex items-center gap-1">
                    요일별 평균 풀이 통계
                </p>
            </div>

            {/* 차트 */}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dummyData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: "#e5e7eb" }}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                            }}
                            formatter={(value) => [`${value} 문제`, "평균 풀이 수"]}
                            labelFormatter={(label) => `${label}요일`}
                        />

                        <Bar dataKey="avg" radius={[8, 8, 0, 0]} isAnimationActive={true}>
                            {dummyData.map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 하단 문구 */}
            <p className="mt-4 text-center text-xl text-base-content/80">
                {highlight}
            </p>
        </div>
    );
}
