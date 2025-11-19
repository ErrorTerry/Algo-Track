package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.Goal;
import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GoalResponseDto {

    private Integer goalId;
    private Integer userId;
    private GoalPeriod goalPeriod;
    private LocalDate createAt;

    public static GoalResponseDto from(Goal goal) {
        return GoalResponseDto.builder()
                .goalId(goal.getGoalId())
                .userId(goal.getUser().getUserId())
                .goalPeriod(goal.getGoalPeriod())
                .createAt(goal.getCreateAt())
                .build();
    }

}
