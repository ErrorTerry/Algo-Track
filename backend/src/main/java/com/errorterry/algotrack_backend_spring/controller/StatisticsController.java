package com.errorterry.algotrack_backend_spring.controller;


import com.errorterry.algotrack_backend_spring.dto.MonthlyStatisticsResponseDto;
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

    // 월간 통계 + 조언 통합 응답 API
    @GetMapping("/monthly-summary")
    public ResponseEntity<MonthlyStatisticsResponseDto> getMonthlySummary(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate baseDate
    ) {

        Integer userId = AuthUser.getUserId();

        MonthlyStatisticsResponseDto response =
                statisticsService.getMonthlySummary(userId, baseDate);

        return ResponseEntity.ok(response);

    }

}
