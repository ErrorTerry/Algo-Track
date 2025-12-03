// 통계 페이지 전체 (월간 요약 카드, 조언, 요일별 통계, 알고리즘 통계 포함)
import { useEffect, useState } from "react";
import { addMonths, format } from "date-fns";

import DayOfWeekAverageCard from "../components/stats/DayOfWeekAverageCard";
import WeeklySolveCard from "../components/stats/WeeklySolveCard";
import MonthlySolveCard from "../components/stats/MonthlySolveCard";
import DailyAverageCard from "../components/stats/DailyAverageCard";
import SolveDaysCard from "../components/stats/SolveDaysCard";
import MostAlgorithmCard from "../components/stats/MostAlgorithmCard";
import TierCard from "../components/stats/TierCard";
import AdviceList from "../components/stats/AdviceList";
import AlgorithmGoalStatsSection from "../components/stats/AlgorithmGoalStatsSection";

import api from "../../shared/api";
import type { MonthlySummaryResponse } from "../../types/statistics";
import StatsHeader from "../components/stats/StatsHeader";
import HexagonStatsCard from "../components/stats/HexagonStatsCard.tsx";

export default function StatisticsPage() {
    // 헤더 날짜 상태
    const [currentDate, setCurrentDate] = useState(new Date());

    // 월간 통계 데이터
    const [monthlyStats, setMonthlyStats] = useState<MonthlySummaryResponse | null>(null);

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 헤더 상단 월 이동 핸들러
    const handlePrev = () => setCurrentDate(prev => addMonths(prev, -1));
    const handleNext = () => setCurrentDate(prev => addMonths(prev, 1));
    const handleToday = () => setCurrentDate(new Date());

    // 월간 통계 API 호출
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const baseDate = format(currentDate, "yyyy-MM-dd");

                const res = await api.get<MonthlySummaryResponse>(
                    "/api/statistics/monthly-summary",
                    { params: { date: baseDate } }
                );

                setMonthlyStats(res.data);
                setError(null);
            } catch (e) {
                console.error("[StatisticsPage] fetch error:", e);
                setError("통계 데이터를 불러오지 못했어요.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [currentDate]);

    return (
        <div className="p-6 flex flex-col gap-6">

            {/* 상단 날짜 변경 헤더 */}
            <StatsHeader
                currentDate={currentDate}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
            />

            {/* 에러 표시 */}
            {error && (
                <div className="alert alert-error text-xl">{error}</div>
            )}

            {/* 월간 요약 카드 6개 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <MonthlySolveCard
                    loading={loading}
                    totalSolved={monthlyStats?.summary.totalSolved}
                />

                <WeeklySolveCard
                    loading={loading}
                    weeklyAverage={monthlyStats?.summary.weeklyAverage}
                />

                <DailyAverageCard
                    loading={loading}
                    dailyAverage={monthlyStats?.summary.dailyAverage}
                />

                <SolveDaysCard
                    loading={loading}
                    solvedDays={monthlyStats?.summary.solvedDays}
                    totalDays={monthlyStats?.summary.totalDays}
                />

                <MostAlgorithmCard
                    loading={loading}
                    name={monthlyStats?.summary.topAlgorithmName}
                    count={monthlyStats?.summary.topAlgorithmSolvedCount}
                />

                <TierCard
                    loading={loading}
                    tier={monthlyStats?.summary.topProblemTier}
                    count={monthlyStats?.summary.topProblemTierSolvedCount}
                />
            </div>

            {/* 조언 섹션 */}
            <section>
                <AdviceList advice={monthlyStats?.advice} />
            </section>

            {/* 요일별 평균 통계 */}
            <section>
                <DayOfWeekAverageCard weekdayStats={monthlyStats?.weekdayStats} />
            </section>

            {/* 알고리즘별 통계 섹션 (육각 그래프) */}
            <section>
                <HexagonStatsCard hexagon={monthlyStats?.hexagon} />
            </section>

            {/* 알고리즘별 통계 섹션 목표기반 */}
            <section>
                <AlgorithmGoalStatsSection algorithmStats={monthlyStats?.algorithmStats} />
            </section>
        </div>
    );
}
