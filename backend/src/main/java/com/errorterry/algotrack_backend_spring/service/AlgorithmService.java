package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.dto.AlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.repository.AlgorithmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlgorithmService {

    private final AlgorithmRepository algorithmRepository;

    // 전체 조회
    public List<AlgorithmResponseDto> getAllAlgorithm() {
        return algorithmRepository.findAll()
                .stream()
                .map(AlgorithmResponseDto::from)
                .collect(Collectors.toList());
    }

    // definition NOT NULL 조회
    public List<AlgorithmResponseDto> getAlgorithmWithDefinition() {
        return algorithmRepository.findByDefinitionIsNotNull()
                .stream()
                .map(AlgorithmResponseDto::from)
                .collect(Collectors.toList());
    }

}
