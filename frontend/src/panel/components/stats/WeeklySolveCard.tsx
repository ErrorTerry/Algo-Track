import StatCard from "./StatCard";
import { Target } from "lucide-react";

export default function WeeklySolveCard() {
    return (
        <StatCard
            icon={<Target className="w-5 h-5 text-blue-500" />}
            title="이번 주 풀이"
            value="12 / 20"
            sub="목표까지 8문제"
        />
    );
}
