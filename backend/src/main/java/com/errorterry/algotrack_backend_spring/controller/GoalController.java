package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.GoalCreateRequestDto;
import com.errorterry.algotrack_backend_spring.dto.GoalResponseDto;
import com.errorterry.algotrack_backend_spring.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // 사용자별(user_id) Goal 조회
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<GoalResponseDto>> getGoalsByUserId(@PathVariable Integer userId) {
        List<GoalResponseDto> result = goalService.getGoalsByUserId(userId);
        return ResponseEntity.ok(result);
    }

    // Goal + GoalAlgorithm 생성
    @PostMapping
    public ResponseEntity<GoalResponseDto> createGoalWithAlgorithms(@RequestBody GoalCreateRequestDto request) {
        GoalResponseDto created = goalService.createGoalWithAlgorithms(request);
        return ResponseEntity
                .created(URI.create("/api/goal/" + created.getGoalId()))
                .body(created);
    }

}
