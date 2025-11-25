package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.*;
import com.errorterry.algotrack_backend_spring.dto.*;
import com.errorterry.algotrack_backend_spring.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final AlgorithmRepository algorithmRepository;
    private final GoalAlgorithmRepository goalAlgorithmRepository;

    // 사용자별(user_id) Goal 조회
    @Transactional(readOnly = true)
    public List<GoalResponseDto> getGoalsByUserId(Integer userId) {
        return goalRepository.findByUserUserId(userId)
                .stream()
                .map(GoalResponseDto::from)
                .collect(Collectors.toList());
    }

    // Goal + GoalAlgorithm 생성
    @Transactional
    public GoalResponseDto createGoalWithAlgorithms(Integer userId, GoalCreateRequestDto request) {
        // JWT에서 가져온 userId로 User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // Goal 저장
        Goal goal = Goal.builder()
                .user(user)
                .goalPeriod(request.getGoalPeriod())
                .build();

        Goal savedGoal = goalRepository.save(goal);

        // GoalAlgorithm 목록 저장
        if (request.getGoalAlgorithms() != null) {
            for (GoalAlgorithmCreateRequestDto algDto : request.getGoalAlgorithms()) {

                Algorithm algorithm = algorithmRepository.findById(algDto.getAlgorithmId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알고리즘입니다."));

                GoalAlgorithm goalAlgorithm = GoalAlgorithm.builder()
                        .goal(savedGoal)
                        .algorithm(algorithm)
                        .goalProblem(algDto.getGoalProblem())
                        .solveProblem(0)
                        .build();

                goalAlgorithmRepository.save(goalAlgorithm);

            }
        }

        // 생성된 Goal 반환
        return GoalResponseDto.from(savedGoal);

    }

}
