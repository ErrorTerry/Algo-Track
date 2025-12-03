import { Flame } from "lucide-react";
import StatCard from "./StatCard";

type TierCardProps = {
    loading: boolean;
    tier?: string | null;
    count?: number | null;
};

export default function TierCard({
                                     loading,
                                     tier,
                                     count,
                                 }: TierCardProps) {
    let valueText = "";
    let subText = "";

    if (loading) {
        valueText = "불러오는 중...";
        subText = "";
    } else if (tier && typeof count === "number") {
        valueText = tier;
        subText = `${count}문제`;
    } else {
        valueText = "-";
        subText = "데이터 없음";
    }

    return (
        <StatCard
            icon={<Flame className="w-5 h-5 text-red-500" />}
            title="가장 많이 푼 티어"
            value={valueText}
            sub={subText}
        />
    );
}
