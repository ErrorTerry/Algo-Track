// src/pages/StatsPage.tsx
import WeeklySolveCard from "../components/stats/WeeklySolveCard";
import MonthlySolveCard from "../components/stats/MonthlySolveCard";
import DailyAverageCard from "../components/stats/DailyAverageCard";
import SolveDaysCard from "../components/stats/SolveDaysCard";
import MostAlgorithmCard from "../components/stats/MostAlgorithmCard";
import StreakCard from "../components/stats/StreakCard";
import AdviceList from "../components/stats/AdviceList";

export default function StatsPage() {
    return (
        <div className="p-6 flex flex-col gap-6">

            {/* 카드 6개 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <WeeklySolveCard />
                <MonthlySolveCard />
                <DailyAverageCard />
                <SolveDaysCard />
                <MostAlgorithmCard />
                <StreakCard />
            </div>

            {/* 알고리즘 조언 */}
            <h2>💡 알고리즘 조언</h2>
            <AdviceList />
        </div>
    );
}
