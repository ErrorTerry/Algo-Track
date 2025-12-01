package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyGoalSummaryResponseDto {

    private LocalDate weekStartDate;
    private List<WeeklyGoalAlgorithmSummaryDto> algorithms;

}
