package com.errorterry.algotrack_backend_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatisticsHexagonAxisDto {

    private String axis;    // 축 코드 (IMPLEMENTATION, DATA_STRUCTURE, GRAPH, GREEDY, DP, MATH)
    private String label;   // 프론트 표시용 라벨
    private long solved;    // 해당 축에 속하는 풀이 수
    private double ratio;   // 전체 풀이 수 대비 비율(%)

}
