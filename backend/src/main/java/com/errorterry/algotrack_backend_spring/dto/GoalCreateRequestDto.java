package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalCreateRequestDto {

    private GoalPeriod goalPeriod;
    private LocalDate targetDate;
    private List<GoalAlgorithmCreateRequestDto> goalAlgorithms;

}
