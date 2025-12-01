import { TrendingUp } from "lucide-react";
import StatCard from "./StatCard";

export default function MonthlySolveCard() {
    return (
        <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            title="이번 달 총 풀이"
            value="54"
            sub="문제"
        />
    );
}
