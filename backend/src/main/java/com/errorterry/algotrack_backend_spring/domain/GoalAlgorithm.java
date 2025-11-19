package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(
        name = "goal_algorithm",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_goal_algorithm",
                        columnNames = {"goal_id", "algorithm_id"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class GoalAlgorithm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_algorithm_id")
    private Integer goalAlgorithmId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "goal_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_goal_algorithm_goal")
    )
    private Goal goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "algorithm_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_goal_algorithm_algorithm")
    )
    private Algorithm algorithm;

    @Column(
            name = "goal_problem",
            nullable = false,
            columnDefinition = "int check (goal_problem >= 0)"
    )
    private Integer goalProblem;

    @Column(
            name = "solve_problem",
            nullable = false,
            columnDefinition = "int default 0 check (solve_problem >= 0 and solve_problem <= goal_problem)"
    )
    private Integer solveProblem;

}
