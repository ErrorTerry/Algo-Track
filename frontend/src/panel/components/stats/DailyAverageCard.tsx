import { Calendar } from "lucide-react";
import StatCard from "./StatCard";

export default function DailyAverageCard() {
    return (
        <StatCard
            icon={<Calendar className="w-5 h-5 text-purple-500" />}
            title="일 평균 풀이"
            value="1.8"
            sub="문제/일"
        />
    );
}
