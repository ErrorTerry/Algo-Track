package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyGoalSaveResponseDto {

    private Integer weeklyGoalId;
    private LocalDate weekStartDate;

}
