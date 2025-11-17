package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.AlgorithmDictionaryResponseDto;
import com.errorterry.algotrack_backend_spring.service.AlgorithmDictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/algorithm--dictionary")
@RequiredArgsConstructor
public class AlgorithmDictionaryController {

    private final AlgorithmDictionaryService algorithmDictionaryService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<AlgorithmDictionaryResponseDto>> getAllAlgorithmDictionary() {
        return ResponseEntity.ok(algorithmDictionaryService.getAllAlgorithmDictionary());
    }

    // algorithm_id 기준 조회
    @GetMapping("/by-algorithm/{algorithmId}")
    public ResponseEntity<List<AlgorithmDictionaryResponseDto>> getByAlgorithmId(
            @PathVariable Integer algorithmId
    ) {
        return ResponseEntity.ok(algorithmDictionaryService.getByAlgorithmId(algorithmId));
    }

}
