package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.GoalAlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.service.GoalAlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/goal-algorithm")
@RequiredArgsConstructor
public class GoalAlgorithmController {

    private final GoalAlgorithmService goalAlgorithmService;

    // 특정 Goal에 포함된 GoalAlgorithm 목록 조회
    @GetMapping("/by-goal/{goalId}")
    public ResponseEntity<List<GoalAlgorithmResponseDto>> getByGoalId(@PathVariable Integer goalId) {
        List<GoalAlgorithmResponseDto> result = goalAlgorithmService.getByGoalId(goalId);
        return ResponseEntity.ok(result);
    }

    // 알고리즘명 + 날짜 기준 solveProblem +1 (0개면 NO-OP)
    // 예시: PATCH /api/goal-algorithm/solve?algorithmName=DP&date=2025-11-20
    @PatchMapping("/solve")
    public ResponseEntity<List<GoalAlgorithmResponseDto>> increaseSolveProblem(
            @RequestParam String algorithmName,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<GoalAlgorithmResponseDto> updated =
                goalAlgorithmService.increaseSolveProblem(algorithmName, date);
        return ResponseEntity.ok(updated);
    }

}
