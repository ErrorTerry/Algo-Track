package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalCreateRequestDto {

    private Integer userId;
    private GoalPeriod goalPeriod;
    private List<GoalAlgorithmCreateRequestDto> goalAlgorithms;

}
