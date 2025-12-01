// src/pages/GoalPage.tsx
import { useState } from "react";
import { addWeeks } from "date-fns";

import GoalHeader from "../components/goal/GoalHeader";
import GoalAddPopup from "../components/goal/GoalAddPopup";
import GoalCard from "../components/goal/GoalCard";

export default function GoalPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // 사진 UI 테스트용 mock 데이터 (주간 요약 API 형식)
    const mockWeekGoal = {
        weekStartDate: "2025-11-24",
        algorithms: [
            {
                algorithmId: 1,
                algorithmName: "다이나믹 프로그래밍",
                weeklyCount: 7,
                dailyPlan: [1, 1, 1, 1, 1, 1, 0],
                dailySolved: [1, 1, 0, 0, 0, 0, 0]
            },
            {
                algorithmId: 2,
                algorithmName: "그래프 탐색",
                weeklyCount: 6,
                dailyPlan: [2, 4, 0, 0, 0, 0, 0],
                dailySolved: [1, 2, 0, 0, 0, 0, 0]
            },
            {
                algorithmId: 3,
                algorithmName: "그리디",
                weeklyCount: 5,
                dailyPlan: [1, 1, 1, 1, 1, 0, 0],
                dailySolved: [1, 0, 1, 0, 0, 0, 0]
            },
            {
                algorithmId: 4,
                algorithmName: "이분 탐색",
                weeklyCount: 3,
                dailyPlan: [0, 1, 1, 1, 0, 0, 0],
                dailySolved: [0, 1, 0, 0, 0, 0, 0]
            }
        ]
    };


    return (
        <div className="p-2">
            <GoalHeader
                currentDate={currentDate}
                onPrev={() => setCurrentDate(prev => addWeeks(prev, -1))}
                onNext={() => setCurrentDate(prev => addWeeks(prev, 1))}
                onToday={() => setCurrentDate(new Date())}
                onOpenAdd={() => setIsAddOpen(true)}
            />

            <GoalAddPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSubmit={() => {}}
                currentDate={currentDate}
            />

            <section className="mt-6">
                <GoalCard goal={{
                    targetDate: mockWeekGoal.weekStartDate,
                    algorithms: mockWeekGoal.algorithms
                }} />
            </section>
        </div>
    );
}
