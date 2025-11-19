package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDate;

@Entity
@Table(name = "goal")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_id")
    private Integer goalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_goal_users")
    )
    private User user;

    @Convert(converter = GoalPeriodConverter.class)
    @Column(
            name = "goal_period",
            nullable = false,
            columnDefinition = "text default 'week' check (goal_period in ('week', 'day'))"
    )
    private GoalPeriod goalPeriod;

    @Column(
            name = "created_at",
            nullable = false,
            columnDefinition = "date default current_date"
    )
    private LocalDate createAt;

}
