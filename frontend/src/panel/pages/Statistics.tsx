// src/pages/StatsPage.tsx
import DayOfWeekAverageCard from "../components/stats/DayOfWeekAverageCard";
import WeeklySolveCard from "../components/stats/WeeklySolveCard";
import MonthlySolveCard from "../components/stats/MonthlySolveCard";
import DailyAverageCard from "../components/stats/DailyAverageCard";
import SolveDaysCard from "../components/stats/SolveDaysCard";
import MostAlgorithmCard from "../components/stats/MostAlgorithmCard";
import StreakCard from "../components/stats/StreakCard";
import AdviceList from "../components/stats/AdviceList";
import AlgorithmGoalStatsSection from "../components/stats/AlgorithmGoalStatsSection.tsx";

export default function StatsPage() {
    return (
        <div className="p-6 flex flex-col gap-6">

            {/* 상단 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <WeeklySolveCard />
                <MonthlySolveCard />
                <DailyAverageCard />
                <SolveDaysCard />
                <MostAlgorithmCard />
                <StreakCard />
            </div>

            {/* 알고리즘 조언 섹션 */}
            <section>
                <AdviceList />
            </section>

            {/* 요일별 평균 풀이 통계 */}
            <section>
                <DayOfWeekAverageCard />
            </section>

            {/* 알고리즘별 통계 섹션 */}
            <AlgorithmGoalStatsSection />
        </div>
    );
}
