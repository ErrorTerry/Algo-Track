package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDate;

@Entity
@Table(
        name = "weekly_goal",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_weekly_goal",
                        columnNames = {"user_id", "week_start_date"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class WeeklyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weekly_goal_id")
    private Integer weeklyGoalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_weekly_goal_users")
    )
    private User user;

    @Column(
            name = "week_start_date",
            nullable = false,
            columnDefinition = "date"
    )
    private LocalDate weekStartDate;

}
