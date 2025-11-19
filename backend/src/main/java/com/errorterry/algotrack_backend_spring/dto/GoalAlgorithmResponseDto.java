package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.GoalAlgorithm;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalAlgorithmResponseDto {

    private Integer goalAlgorithmId;
    private Integer goalId;
    private Integer algorithmId;
    private Integer goalProblem;
    private Integer solveProblem;

    public static GoalAlgorithmResponseDto from(GoalAlgorithm goalAlgorithm) {
        return GoalAlgorithmResponseDto.builder()
                .goalAlgorithmId(goalAlgorithm.getGoalAlgorithmId())
                .goalId(goalAlgorithm.getGoal().getGoalId())
                .algorithmId(goalAlgorithm.getAlgorithm().getAlgorithmId())
                .goalProblem(goalAlgorithm.getGoalProblem())
                .solveProblem(goalAlgorithm.getSolveProblem())
                .build();
    }

}
