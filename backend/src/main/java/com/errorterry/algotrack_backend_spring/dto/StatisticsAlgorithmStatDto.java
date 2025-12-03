package com.errorterry.algotrack_backend_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatisticsAlgorithmStatDto {

    private String algorithmName;   // 알고리즘명
    private long goal;              // 해당 알고리즘에 대한 월간 목표 문제 수 합계
    private long solved;            // 해당 알고리즘에 대한 월간 해결 문제 수 합계
    private double ratio;           // 목표 대비 합계 비율 (%)

}
