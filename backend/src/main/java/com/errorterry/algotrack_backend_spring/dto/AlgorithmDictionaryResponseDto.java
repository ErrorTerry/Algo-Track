package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.AlgorithmDictionary;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AlgorithmDictionaryResponseDto {

    private Integer algorithmDictionaryId;
    private Integer algorithmId;
    private String algorithmName;
    private String definition;
    private String example;

    public static AlgorithmDictionaryResponseDto from(AlgorithmDictionary algorithmDictionary) {
        return AlgorithmDictionaryResponseDto.builder()
                .algorithmDictionaryId(algorithmDictionary.getAlgorithmDictionaryId())
                .algorithmId(algorithmDictionary.getAlgorithm().getAlgorithmId())
                .algorithmName(algorithmDictionary.getAlgorithmName())
                .definition(algorithmDictionary.getDefinition())
                .example(algorithmDictionary.getExample())
                .build();
    }

}
