package com.errorterry.algotrack_backend_spring.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MonthlyStatisticsResponseDto {

    // 상단 요약 카드(6개) 정보
    private StatisticsMonthlySummaryResponseDto summary;

    // 월 통계를 기반으로 한 알고리즘/난이도 조언
    private StatisticsMonthlyAdviceResponseDto advice;

}
