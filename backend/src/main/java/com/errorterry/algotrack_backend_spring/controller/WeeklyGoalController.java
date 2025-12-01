package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.WeeklyGoalSummaryResponseDto;
import com.errorterry.algotrack_backend_spring.security.AuthUser;
import com.errorterry.algotrack_backend_spring.service.WeeklyGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class WeeklyGoalController {

    private final WeeklyGoalService weeklyGoalService;

    // 주간 목표 요약 조회 API
    // - 예시: GET /api/goal/weekly-summary?weekStartDate=2025-12-01
    // - 응답: weekStartDate, algorithms[ { algorithmId, algorithmName, weeklyCount, dailyPlan[7], dailySolved[7] } ]
    @GetMapping("/weekly-summary")
    public ResponseEntity<WeeklyGoalSummaryResponseDto> getMyWeeklyGoalSummary(
            @RequestParam("weekStartDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate
    ) {

        Integer userId = AuthUser.getUserId();

        WeeklyGoalSummaryResponseDto response =
                weeklyGoalService.getWeeklySummary(userId, weekStartDate);

        return ResponseEntity.ok(response);
    }

}
