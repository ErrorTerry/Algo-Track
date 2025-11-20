package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalAlgorithmCreateRequestDto {

    private Integer algorithmId;
    private Integer goalProblem;

}
