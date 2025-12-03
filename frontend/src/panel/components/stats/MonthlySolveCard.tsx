import { TrendingUp } from "lucide-react";
import StatCard from "./StatCard";

type MonthlySolveCardProps = {
    loading: boolean;
    totalSolved?: number;
};

export default function MonthlySolveCard({
                                             loading,
                                             totalSolved,
                                         }: MonthlySolveCardProps) {
    let valueText = "";
    let subText = "이번 달 푼 문제 수";

    if (loading) {
        valueText = "불러오는 중...";
    } else if (typeof totalSolved === "number") {
        valueText = totalSolved.toLocaleString(); // 1,234 형식
    } else {
        valueText = "-";
        subText = "이번 달 풀이 데이터가 없어요";
    }

    return (
        <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            title="이번 달 총 풀이"
            value={valueText}
            sub={subText}
        />
    );
}
