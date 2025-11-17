package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AlgorithmResponseDto {

    private Integer algorithmId;
    private String algorithmName;
    private String definition;

    public static AlgorithmResponseDto from(Algorithm algorithm) {
        return AlgorithmResponseDto.builder()
                .algorithmId(algorithm.getAlgorithmId())
                .algorithmName(algorithm.getAlgorithmName())
                .definition(algorithm.getDefinition())
                .build();
    }

}
