package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.GoalAlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.service.GoalAlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 특정 알고리즘명이 있는 GoalAlgorithm의 solveProblem +1
    // 예시: PATCH /api/goal-algorithm/solve?goalId=1&algorithmName=DP
    @PatchMapping("/solve")
    public ResponseEntity<GoalAlgorithmResponseDto> increaseSolveProblem(
            @RequestParam Integer goalId,
            @RequestParam String algorithmName
    ) {
        GoalAlgorithmResponseDto updated = goalAlgorithmService.increaseSolveProblem(goalId, algorithmName);
        return ResponseEntity.ok(updated);
    }

}
