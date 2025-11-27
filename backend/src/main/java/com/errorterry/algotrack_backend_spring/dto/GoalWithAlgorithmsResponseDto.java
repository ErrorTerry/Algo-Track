package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.Goal;
import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import com.errorterry.algotrack_backend_spring.domain.GoalAlgorithm;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalWithAlgorithmsResponseDto {

    private Integer goalId;
    private Integer userId;
    private GoalPeriod goalPeriod;
    private LocalDate createAt;

    private List<GoalAlgorithmResponseDto> goalAlgorithms;

    public static GoalWithAlgorithmsResponseDto from(Goal goal, List<GoalAlgorithm> goalAlgorithms) {
        return GoalWithAlgorithmsResponseDto.builder()
                .goalId(goal.getGoalId())
                .userId(goal.getUser().getUserId())
                .goalPeriod(goal.getGoalPeriod())
                .createAt(goal.getCreateAt())
                .goalAlgorithms(
                        goalAlgorithms.stream()
                                .map(GoalAlgorithmResponseDto::from)
                                .collect(Collectors.toList())
                )
                .build();
    }

}
