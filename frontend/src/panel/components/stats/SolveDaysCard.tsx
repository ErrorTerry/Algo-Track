import { Medal } from "lucide-react";
import StatCard from "./StatCard";

export default function SolveDaysCard() {
    return (
        <StatCard
            icon={<Medal className="w-5 h-5 text-orange-500" />}
            title="문제 푼 일수"
            value="18 / 30"
            sub="일"
        />
    );
}
