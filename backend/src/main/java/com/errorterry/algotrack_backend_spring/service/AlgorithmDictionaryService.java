package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.dto.AlgorithmDictionaryResponseDto;
import com.errorterry.algotrack_backend_spring.repository.AlgorithmDictionaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlgorithmDictionaryService {

    private final AlgorithmDictionaryRepository algorithmDictionaryRepository;

    // 전체 조회
    public List<AlgorithmDictionaryResponseDto> getAllAlgorithmDictionary() {
        return algorithmDictionaryRepository.findAll()
                .stream()
                .map(AlgorithmDictionaryResponseDto::from)
                .collect(Collectors.toList());
    }

    // algorithm_id 기준 조회
    public List<AlgorithmDictionaryResponseDto> getByAlgorithmId(Integer algorithmId) {
        return algorithmDictionaryRepository.findByAlgorithmAlgorithmId(algorithmId)
                .stream()
                .map(AlgorithmDictionaryResponseDto::from)
                .collect(Collectors.toList());
    }

}
