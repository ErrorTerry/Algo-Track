import { Calendar } from "lucide-react";
import StatCard from "./StatCard";

type DailyAverageCardProps = {
    loading: boolean;
    dailyAverage?: number;
};

export default function DailyAverageCard({
                                             loading,
                                             dailyAverage,
                                         }: DailyAverageCardProps) {
    let valueText = "";
    let subText = "문제/일";

    if (loading) {
        valueText = "불러오는 중...";
    } else if (typeof dailyAverage === "number") {
        valueText = dailyAverage.toFixed(1);
    } else {
        valueText = "-";
        subText = "일 평균 통계가 없어요";
    }

    return (
        <StatCard
            icon={<Calendar className="w-5 h-5 text-purple-500" />}
            title="일 평균 풀이"
            value={valueText}
            sub={subText}
        />
    );
}
