export type SummaryStats = {
    baseDate: string;
    monthStartDate: string;
    monthEndDate: string;
    totalSolved: number;
    weeklyAverage: number;
    dailyAverage: number;
    solvedDays: number;
    totalDays: number;

    // 이 4개는 null 가능
    topAlgorithmName: string | null;
    topAlgorithmSolvedCount: number | null;
    topProblemTier: string | null;
    topProblemTierSolvedCount: number | null;
};

export type AdviceStats = {
    lowestRatioAlgorithmName: string;
    lowestRatioPercent: number;
    biasedAlgorithmName: string;
    biasedAlgorithmPercent: number;
    difficultyWeeklyTrend: string;
    difficultyWeeklyTrendStreakWeeks: number;
    difficultyMonthlyTrend: string;
};

export type WeekdayStat = {
    dayOfWeek: number;
    label: string;
    avgSolved: number;
};

export type HexagonStat = {
    axis: string;
    label: string;
    solved: number;
    ratio: number;
};

export type AlgorithmStat = {
    algorithmName: string;
    goal: number;
    solved: number;
    ratio: number;
};

export type MonthlySummaryResponse = {
    summary: SummaryStats;
    advice: AdviceStats;
    weekdayStats: WeekdayStat[];
    hexagon: HexagonStat[];
    algorithmStats: AlgorithmStat[];
};

// 주간 요약 타입
export type WeeklyGoalAlgorithmSummary = {
    algorithmId: number;
    algorithmName: string;
    weeklyCount: number;
    dailyPlan: number[];
    dailySolved: number[];
};

export type WeeklyGoalSummaryResponse = {
    weekStartDate: string;
    algorithms: WeeklyGoalAlgorithmSummary[];
};
