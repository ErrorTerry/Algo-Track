// src/pages/GoalPage.tsx
import { useState, useEffect } from "react";
import { addWeeks, format, startOfWeek } from "date-fns";

import GoalHeader from "../components/goal/GoalHeader";
import GoalAddPopup from "../components/goal/GoalAddPopup";
import GoalCard from "../components/goal/GoalCard";
import api from "../../shared/api";
import type { WeeklyGoalResponse } from "../../types/goal";

export default function GoalPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // ⭐ 백엔드에서 받아온 주간 요약 데이터
    const [weekData, setWeekData] = useState<WeeklyGoalResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ 주간 요약 API 호출 함수 (currentDate 기준)
    const fetchWeekSummary = async (baseDate: Date) => {
        try {
            setLoading(true);
            setError(null);

            // API 요구 형식: 주 시작 날짜 (월요일 기준) yyyy-MM-dd
            const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
            const formatted = format(weekStart, "yyyy-MM-dd");

            const res = await api.get<WeeklyGoalResponse>(
                "/api/goal/weekly-summary",
                {
                    params: { weekStartDate: formatted },
                }
            );

            // 데이터 없으면 null 처리
            setWeekData(res.data ?? null);
        } catch (err) {
            console.error("목표 데이터 불러오기 실패:", err);
            setError("목표 데이터를 불러오는 데 실패했어요 ㅠㅠ");
            setWeekData(null);
        } finally {
            setLoading(false);
        }
    };

    // currentDate가 바뀔 때마다 주간 요약 API 호출
    useEffect(() => {
        fetchWeekSummary(currentDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    return (
        <div className="p-2">
            <GoalHeader
                currentDate={currentDate}
                onPrev={() => setCurrentDate(prev => addWeeks(prev, -1))}
                onNext={() => setCurrentDate(prev => addWeeks(prev, 1))}
                onToday={() => setCurrentDate(new Date())}
                onOpenAdd={() => setIsAddOpen(true)}
            />

            <GoalAddPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                // ✅ 팝업에서 저장 성공하면 다시 요약 불러오기
                onSaved={() => fetchWeekSummary(currentDate)}
                currentDate={currentDate}
            />

            <section className="mt-6">
                {loading && (
                    <div className="text-center text-lg py-10 opacity-60">
                        주간 요약 로딩 중...
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center text-red-500 py-10 text-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && weekData && (
                    <GoalCard goal={weekData} />
                )}

                {!loading && !error && !weekData && (
                    <div className="text-center text-lg py-10 opacity-60">
                        불러올 주간 데이터가 없어요.
                    </div>
                )}
            </section>
        </div>
    );
}
