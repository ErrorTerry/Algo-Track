// src/components/goal/GoalCard.tsx
import {format, parseISO, startOfWeek, addDays, isSameDay} from "date-fns";
import {ko} from "date-fns/locale";
import type {WeeklyGoalResponse} from "../../../types/goal";

interface GoalCardProps {
    goal: WeeklyGoalResponse;
}

export default function GoalCard({goal}: GoalCardProps) {
    // weekStartDate 기준으로 그 주 월요일 계산
    const start = startOfWeek(parseISO(goal.weekStartDate), {weekStartsOn: 1});

    const DAY_LABELS = Array.from({length: 7}, (_, i) =>
        format(addDays(start, i), "EEE", {locale: ko})
    );

    // 오늘 날짜 (실제 날짜 기준)
    const today = new Date();

    return (
        <div className="card bg-base-100 shadow-md border border-base-300 rounded-2xl">
            <div className="card-body py-8 px-6 flex flex-col gap-10">
                {/* ======================================
                     🔥 알고리즘별 달성률 Progress Bar
                 ====================================== */}
                <div className="flex flex-col gap-6">
                    {goal.algorithms.map((a) => {
                        const solved = a.dailySolved.reduce((s, v) => s + v, 0);
                        const progress = a.weeklyCount
                            ? Math.min(100, Math.round((solved / a.weeklyCount) * 100))
                            : 0;

                        return (
                            <div
                                key={a.algorithmId}
                                className="flex flex-col gap-1"
                            >
                                {/* 텍스트 */}
                                <div className="flex justify-between text-xl font-semibold">
                                    <span>{a.algorithmName}</span>
                                    <span>
                                        {solved} / {a.weeklyCount}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-blue-400 h-full transition-all duration-200"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ======================================
                     🔥 주간 달력 (하단)
                 ====================================== */}
                <div className="grid grid-cols-7 gap-4">
                    {Array.from({length: 7}).map((_, idx) => {
                        const date = addDays(start, idx);
                        const dateLabel = format(date, "dd일");

                        let totalPlanned = 0;
                        let totalSolved = 0;

                        const algoDetails: {
                            name: string;
                            planned: number;
                            solved: number;
                        }[] = [];

                        goal.algorithms.forEach((a) => {
                            const planned = a.dailyPlan[idx] ?? 0;
                            const solved = a.dailySolved[idx] ?? 0;

                            if (planned > 0 || solved > 0) {
                                algoDetails.push({
                                    name: a.algorithmName,
                                    planned,
                                    solved,
                                });
                            }

                            totalPlanned += planned;
                            totalSolved += solved;
                        });

                        // ✅ 오늘 날짜만 하이라이트 (다른 주 같은 요일은 X)
                        const isToday = isSameDay(date, today);

                        return (
                            <div
                                key={idx}
                                className={`bg-base-200 border rounded-2xl p-4 flex flex-col gap-3
        ${
                                    isToday
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-base-300"
                                }`}
                            >
                                {/* 날짜 + 요일 */}
                                <div className="text-center">
                                    <span
                                        className={`font-bold text-lg ${
                                            isToday ? "text-blue-600" : ""
                                        }`}
                                    >
                                        {DAY_LABELS[idx]}
                                    </span>
                                    <span className="text-gray-600 font-semibold text-lg ml-1">
                                        {dateLabel}
                                    </span>
                                </div>

                                {/* 전체 합계 */}
                                <div className="text-center text-lg font-bold">
                                    {totalSolved}/{totalPlanned}
                                </div>

                                {/* 알고리즘 상세 */}
                                <div className="flex flex-col gap-2 text-sm">
                                    {algoDetails.map((d, i) => (
                                        <div
                                            key={i}
                                            className="bg-base-100 rounded-lg px-2 py-2 flex justify-between text-lg font-semibold"
                                        >
                                            <span>{d.name}</span>
                                            <span>
                    {d.solved}/{d.planned}
                </span>
                                        </div>
                                    ))}

                                    {algoDetails.length === 0 && (
                                        <div className="text-gray-400 text-center py-2 text-lg">
                                            - 계획 없음 -
                                        </div>
                                    )}
                                </div>
                            </div>

                        );
                    })}
                </div>
            </div>
        </div>
    );
}
