package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.AlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.service.AlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/algorithm")
@RequiredArgsConstructor
public class AlgorithmController {

    private final AlgorithmService algorithmService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<AlgorithmResponseDto>> getAllAlgorithm() {
        return ResponseEntity.ok(algorithmService.getAllAlgorithm());
    }

    // definition NOT NULL 조회
    @GetMapping("/with-definition")
    public ResponseEntity<List<AlgorithmResponseDto>> getAlgorithmsWithDefinition() {
        return ResponseEntity.ok(algorithmService.getAlgorithmWithDefinition());
    }

}
