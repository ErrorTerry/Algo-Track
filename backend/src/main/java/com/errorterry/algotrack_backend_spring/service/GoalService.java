package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.*;
import com.errorterry.algotrack_backend_spring.dto.*;
import com.errorterry.algotrack_backend_spring.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    // 기간 + 날짜 기준 Goal 조회
    @Transactional(readOnly = true)
    public List<GoalResponseDto> getGoalsByPeriodAndDate(
            Integer userId,
            GoalPeriod goalPeriod,
            LocalDate startDate,
            LocalDate endDate       // goalPeriod가 DAY일 때는 null 가능
    ) {

        if (startDate == null) {
            throw new IllegalArgumentException("조회 시작 날짜가 비어있습니다.");
        }

        List<Goal> goals;

        // 주간 목표
        if (goalPeriod == GoalPeriod.WEEK) {
            if (endDate == null) {
                throw new IllegalArgumentException("조회 끝 날짜가 비어있습니다.");
            }

            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("끝 날짜가 시작 날짜보다 빠릅니다.");
            }

            goals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAtBetween(
                    userId,
                    GoalPeriod.WEEK,
                    startDate,
                    endDate
            );

        // 일간 목표
        } else if (goalPeriod == GoalPeriod.DAY) {
            goals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAt(
                    userId,
                    GoalPeriod.DAY,
                    startDate
            );
        } else {
            throw new IllegalArgumentException("목표 기간 오류");
        }

        return goals.stream()
                .map(GoalResponseDto::from)
                .collect(Collectors.toList());
    }

}
