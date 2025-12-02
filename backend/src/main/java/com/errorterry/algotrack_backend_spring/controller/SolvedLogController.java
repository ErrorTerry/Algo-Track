package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.SolvedLogRequestDto;
import com.errorterry.algotrack_backend_spring.security.AuthUser;
import com.errorterry.algotrack_backend_spring.service.SolvedLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solve-log")
@RequiredArgsConstructor
public class SolvedLogController {

    private final SolvedLogService solvedLogService;

    // 문제 해결 로그 기록 + 일간 목표 solve_count 증가 API
    // - 요청 : POST /api/solve-log
    // - body : { algorithmName, problemId, solvedDate, problemTier }
    // - 응답 : 200 OK
    @PostMapping
    public ResponseEntity<Void> recordSolved(@RequestBody SolvedLogRequestDto request) {

        Integer userId = AuthUser.getUserId();

        solvedLogService.recordSolvedAndIncreaseDailyGoal(userId, request);

        return ResponseEntity.ok().build();
    }

}
