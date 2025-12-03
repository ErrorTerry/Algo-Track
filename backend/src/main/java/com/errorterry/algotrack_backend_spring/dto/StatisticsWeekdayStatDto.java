package com.errorterry.algotrack_backend_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatisticsWeekdayStatDto {

    private int dayOfWeek;      // 0=일, 1=월, ..., 6=토
    private String label;       // 표시용 한글 라벨 ("일", "월", ..., "토")
    private Double avgSolved;   // 해당 요일의 월간 평균 풀이 수

}
