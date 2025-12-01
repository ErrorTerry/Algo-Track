import { Zap } from "lucide-react";
import StatCard from "./StatCard";

export default function MostAlgorithmCard() {
    return (
        <StatCard
            icon={<Zap className="w-5 h-5 text-pink-500" />}
            title="가장 많이 푼 알고리즘"
            value="그리디"
            sub="10문제"
        />
    );
}
