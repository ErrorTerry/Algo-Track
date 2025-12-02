package com.errorterry.algotrack_backend_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatisticsMonthlyAdviceResponseDto {

    // 알고리즘 풀이 비중 기반 조언
    private String lowestRatioAlgorithmName;
    private Double lowestRatioPercent;

    // 알고리즘 편향 감지 조언
    private String biasedAlgorithmName;
    private Double biasedAlgorithmPercent;

    // 난이도 상승 패턴 조언
    private String difficultyWeeklyTrend;               // "UP", "DOWN", "SAME", "NONE"
    private Integer difficultyWeeklyTrendStreakWeeks;   // 동일 트렌드가 몇 주 연속 유지되는지
    private String difficultyMonthlyTrend;              // "UP", "DOWN", "SAME", "NONE"

}
