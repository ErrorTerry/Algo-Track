import { Zap } from "lucide-react";
import StatCard from "./StatCard";

type MostAlgorithmCardProps = {
    loading: boolean;
    name?: string | null;
    count?: number | null;
};

export default function MostAlgorithmCard({
                                              loading,
                                              name,
                                              count,
                                          }: MostAlgorithmCardProps) {
    let valueText = "";
    let subText = "";

    if (loading) {
        valueText = "불러오는 중...";
        subText = "";
    } else if (name && typeof count === "number") {
        valueText = name;
        subText = `${count}문제`;
    } else {
        valueText = "-";
        subText = "데이터 없음";
    }

    return (
        <StatCard
            icon={<Zap className="w-5 h-5 text-pink-500" />}
            title="가장 많이 푼 알고리즘"
            value={valueText}
            sub={subText}
        />
    );
}
