package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDate;

@Entity
@Table(
        name = "solved_log",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_solved_log",
                        columnNames = {"user_id", "problem_id"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class SolvedLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "solved_log_id")
    private Integer solvedLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_solved_log_users")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "algorithm_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_solved_log_algorithm")
    )
    private Algorithm algorithm;

    @Column(name = "problem_id", nullable = false)
    private Integer problemId;

    @Column(name = "solved_date", nullable = false)
    private LocalDate solvedDate;

    @Column(
            name = "problem_tier",
            nullable = false,
            columnDefinition = "text default 'X' check ( problem_tier in ('X', 'Unrated', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby') )"
    )
    private String problemTier;

}
