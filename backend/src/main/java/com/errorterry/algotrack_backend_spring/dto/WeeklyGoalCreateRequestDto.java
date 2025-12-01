package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyGoalCreateRequestDto {

    private LocalDate weekStartDate;
    private List<WeeklyGoalAlgorithmPlanRequestDto> algorithms;

}
