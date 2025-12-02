package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
public class StatisticsMonthlySummaryResponseDto {

    // 기준일 정보 (디버깅/프론트 표시용)
    private LocalDate baseDate;
    private LocalDate monthStartDate;
    private LocalDate monthEndDate;

    // 1) 이번 달 총 풀이 수
    private long totalSolved;

    // 2) 주간 평균 풀이 수
    private double weeklyAverage;

    // 3) 일간 평균 풀이 수
    private double dailyAverage;

    // 4) 문제 푼 일수 / 해당 월 총 일수
    private int solvedDays;
    private int totalDays;

    // 5) 가장 많이 푼 알고리즘
    private String topAlgorithmName;       // 없으면 null
    private Long topAlgorithmSolvedCount;  // 없으면 null

    // 6) 가장 많이 푼 문제 티어
    private String topProblemTier;         // 없으면 null
    private Long topProblemTierSolvedCount;// 없으면 null

}
