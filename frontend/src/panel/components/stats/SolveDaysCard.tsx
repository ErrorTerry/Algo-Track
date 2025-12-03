import { Medal } from "lucide-react";
import StatCard from "./StatCard";

type SolveDaysCardProps = {
    loading: boolean;
    solvedDays?: number;
    totalDays?: number;
};

export default function SolveDaysCard({
                                          loading,
                                          solvedDays,
                                          totalDays,
                                      }: SolveDaysCardProps) {
    let valueText = "";
    let subText = "일";

    if (loading) {
        valueText = "불러오는 중...";
    } else if (
        typeof solvedDays === "number" &&
        typeof totalDays === "number" &&
        totalDays > 0
    ) {
        valueText = `${solvedDays} / ${totalDays}`;
    } else {
        valueText = "-";
        subText = "기록된 데이터가 없어요";
    }

    return (
        <StatCard
            icon={<Medal className="w-5 h-5 text-orange-500" />}
            title="문제 푼 일수"
            value={valueText}
            sub={subText}
        />
    );
}
