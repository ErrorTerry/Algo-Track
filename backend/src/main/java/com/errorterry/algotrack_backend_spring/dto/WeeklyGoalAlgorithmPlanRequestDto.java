package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyGoalAlgorithmPlanRequestDto {

    private Integer algorithmId;
    private int[] dailyPlan;

}
