// 주 평균 풀이
import StatCard from "./StatCard";
import { Target } from "lucide-react";

type WeeklySolveCardProps = {
    loading: boolean;
    weeklyAverage?: number;
};

export default function WeeklySolveCard({
                                            loading,
                                            weeklyAverage,
                                        }: WeeklySolveCardProps) {
    let valueText = "";
    let subText = "이번 달 기준 주간 평균 풀이";

    if (loading) {
        valueText = "불러오는 중...";
    } else if (typeof weeklyAverage === "number") {
        valueText = weeklyAverage.toFixed(1);
        subText = "문제/주";
    } else {
        valueText = "-";
        subText = "주 평균 풀이 데이터가 없어요";
    }

    return (
        <StatCard
            icon={<Target className="w-5 h-5 text-blue-500" />}
            title="주간 평균 풀이"
            value={valueText}
            sub={subText}
        />
    );
}
