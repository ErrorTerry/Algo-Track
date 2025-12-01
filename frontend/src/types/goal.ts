// src/types/goal.ts

export type GoalItem = {
    goalId: number;
    goalPeriod: "WEEK" | "DAY";
    targetDate?: string;
    goalAlgorithms: {
        algorithmId: number;
        algorithmName: string;
        goalProblem: number;
    }[];
};

export type WeeklyGoalAlgorithmFromApi = {
    algorithmId: number;
    algorithmName: string;
    weeklyCount: number;
    dailyPlan: number[];
    dailySolved: number[];
};

export type WeeklyGoalResponse = {
    weekStartDate: string;
    algorithms: WeeklyGoalAlgorithmFromApi[];
};
