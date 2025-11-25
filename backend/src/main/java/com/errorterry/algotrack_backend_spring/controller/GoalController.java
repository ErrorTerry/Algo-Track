package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import com.errorterry.algotrack_backend_spring.dto.GoalCreateRequestDto;
import com.errorterry.algotrack_backend_spring.dto.GoalResponseDto;
import com.errorterry.algotrack_backend_spring.security.AuthUser;
import com.errorterry.algotrack_backend_spring.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // 인증된 사용자 자신의 Goal 조회
    @GetMapping
    public ResponseEntity<List<GoalResponseDto>> getMyGoals() {

        Integer userId = AuthUser.getUserId();

        List<GoalResponseDto> results = goalService.getGoalsByUserId(userId);

        return ResponseEntity.ok(results);
    }

    // Goal + GoalAlgorithm 생성
    @PostMapping
    public ResponseEntity<GoalResponseDto> createGoal(@RequestBody GoalCreateRequestDto request) {

        Integer userId = AuthUser.getUserId();

        GoalResponseDto created = goalService.createGoalWithAlgorithms(userId, request);

        return ResponseEntity
                .created(URI.create("/api/goal/" + created.getGoalId()))
                .body(created);
    }

    // 기간 + 날짜 기준 Goal 조회
    // - 주간: GET /api/goal/search?goalPeriod=WEEK&startDate=2025-11-17&endDate=2025-11-23
    // - 일간: GET /api/goal/search?goalPeriod=DAY&startDate=2025-11-20
    @GetMapping("/search")
    public ResponseEntity<List<GoalResponseDto>> getMyGoalsByDate(
            @RequestParam("goalPeriod") GoalPeriod goalPeriod,
            @RequestParam("startDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {

        Integer userId = AuthUser.getUserId();

        List<GoalResponseDto> results = goalService.getGoalsByPeriodAndDate(userId, goalPeriod, startDate, endDate);

        return ResponseEntity.ok(results);
    }

}
