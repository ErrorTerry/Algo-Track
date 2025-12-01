package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDate;

@Entity
@Table(
        name = "daily_goal",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_daily_goal",
                        columnNames = {"weekly_goal_id", "algorithm_id", "goal_date"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class DailyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_goal_id")
    private Integer dailyGoalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "weekly_goal_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_daily_goal_weekly_goal")
    )
    private WeeklyGoal weeklyGoal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "algorithm_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_daily_goal_algorithm")
    )
    private Algorithm algorithm;

    @Column(
            name = "goal_date",
            nullable = false,
            columnDefinition = "date"
    )
    private LocalDate goalDate;

    @Column(
            name = "goal_count",
            nullable = false,
            columnDefinition = "INT CHECK (goal_count) >= 0"
    )
    private Integer goalCount;

    @Column(
            name = "solve_count",
            nullable = false,
            columnDefinition = "INT DEFAULT 0 CHECK (solve_count >= 0 and solve_count <= goal_count)"
    )
    private Integer solveCount;

}
