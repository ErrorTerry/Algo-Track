package com.errorterry.algotrack_backend_spring.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SolvedLogRequestDto {

    private String algorithmName;
    private Integer problemId;
    private LocalDate solvedDate;
    private Integer problemTier;

}
