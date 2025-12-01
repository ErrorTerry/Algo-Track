import { Flame } from "lucide-react";
import StatCard from "./StatCard";

export default function StreakCard() {
    return (
        <StatCard
            icon={<Flame className="w-5 h-5 text-red-500" />}
            title="연속 풀이 기록"
            value="4일"
            sub="연속 중!"
        />
    );
}
