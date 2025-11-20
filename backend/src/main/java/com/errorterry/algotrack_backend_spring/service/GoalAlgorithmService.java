package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.GoalAlgorithm;
import com.errorterry.algotrack_backend_spring.dto.GoalAlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.repository.GoalAlgorithmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalAlgorithmService {

    private final GoalAlgorithmRepository goalAlgorithmRepository;

    // 특정 Goal에 포함된 GoalAlgorithm 목록 조회
    @Transactional(readOnly = true)
    public List<GoalAlgorithmResponseDto> getByGoalId(Integer goalId) {
        return goalAlgorithmRepository.findByGoalGoalId(goalId)
                .stream()
                .map(GoalAlgorithmResponseDto::from)
                .collect(Collectors.toList());
    }

    // 특정 알고리즘명이 있는 GoalAlgorithm의 solveProblem +1 (goal 범위 내)
    @Transactional
    public GoalAlgorithmResponseDto increaseSolveProblem(Integer goalId, String algorithmName) {
        GoalAlgorithm goalAlgorithm = goalAlgorithmRepository
                .findByGoalGoalIdAndAlgorithmAlgorithmName(goalId, algorithmName)
                .orElseThrow(() -> new IllegalArgumentException("해당 Goal에 해당 알고리즘명이 존재하지 않습니다."));

        Integer currentSolve = goalAlgorithm.getSolveProblem();
        Integer goalProblem = goalAlgorithm.getGoalProblem();

        if (currentSolve >= goalProblem) {
            throw new IllegalStateException("이미 goalProblem을 모두 달성했습니다.");
        }

        goalAlgorithm.setSolveProblem(currentSolve + 1);

        GoalAlgorithm saved = goalAlgorithmRepository.save(goalAlgorithm);
        return GoalAlgorithmResponseDto.from(saved);
    }
}
