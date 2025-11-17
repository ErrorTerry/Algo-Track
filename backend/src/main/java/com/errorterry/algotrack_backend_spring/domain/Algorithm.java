package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(
        name = "algorithm",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_algorithm_name",
                        columnNames = "algorithm_name"
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class Algorithm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "algorithm_id")
    private Integer algorithmId;

    @Column(name = "algorithm_name", nullable = true, columnDefinition = "text")
    private String algorithmName;

    @Column(name = "definition", nullable = false, columnDefinition = "text")
    private String definition;

}
