package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(
        name = "algorithm_dictionary",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_algorithm_dictionary",
                        columnNames = {"algorithm_id", "algorithm_name"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class AlgorithmDictionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "algorithm_dictionary_id")
    private Integer algorithmDictionaryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "algorithm_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_algorithm_dictionary_algorithm")
    )
    private Algorithm algorithm;

    @Column(name = "algorithm_name", nullable = false, columnDefinition = "text")
    private String algorithmName;

    @Column(name = "definition", nullable = false, columnDefinition = "text")
    private String definition;

    @Column(name = "example", nullable = false, columnDefinition = "text")
    private String example;

}
