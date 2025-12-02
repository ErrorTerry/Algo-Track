package com.errorterry.algotrack_backend_spring.controller;


import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlySummaryResponseDto;
import com.errorterry.algotrack_backend_spring.security.AuthUser;
import com.errorterry.algotrack_backend_spring.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // 월간 요약 통계 API
    @GetMapping("/monthly-summary")
    public ResponseEntity<StatisticsMonthlySummaryResponseDto> getMonthlySummary(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate baseDate
    ) {

        Integer userId = AuthUser.getUserId();

        StatisticsMonthlySummaryResponseDto response =
                statisticsService.getMonthlySummary(userId, baseDate);

        return ResponseEntity.ok(response);
    }

}
