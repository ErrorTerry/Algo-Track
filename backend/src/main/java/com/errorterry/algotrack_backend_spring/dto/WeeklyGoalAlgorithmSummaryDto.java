package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyGoalAlgorithmSummaryDto {

    private Integer algorithmId;
    private String algorithmName;

    private Integer weeklyCount;    // 주간 총 목표 문제 수

    private int[] dailyPlan;    // 길이 7, 일별 계획 문제 수
    private int[] dailySolved;  // 길이 7, 일별 해결 문제 수

}
