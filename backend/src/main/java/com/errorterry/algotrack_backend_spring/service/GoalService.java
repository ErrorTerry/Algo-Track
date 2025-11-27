package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.*;
import com.errorterry.algotrack_backend_spring.dto.*;
import com.errorterry.algotrack_backend_spring.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final AlgorithmRepository algorithmRepository;
    private final GoalAlgorithmRepository goalAlgorithmRepository;

    // 사용자별(user_id) Goal 조회 (목표 알고리즘 포함 X)
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

    // 공통 : Goal 리스트 + GoalAlgorithm 리스트 묶어서 DTO 변환
    @Transactional(readOnly = true)
    protected List<GoalWithAlgorithmsResponseDto> toGoalWithAlgorithmsDtos(List<Goal> goals) {
        if (goals.isEmpty()) {
            return List.of();
        }

        // goalId 목록 추출
        List<Integer> goalIds = goals.stream()
                .map(Goal::getGoalId)
                .collect(Collectors.toList());

        // 해당 goalId들에 대한 GoalAlgorithm 한 번에 조회
        List<GoalAlgorithm> allGoalAlgorithms =
                goalAlgorithmRepository.findByGoalGoalIdIn(goalIds);

        // goalId 기준으로 묶기
        Map<Integer, List<GoalAlgorithm>> algorithmsByGoalId =
                allGoalAlgorithms.stream()
                        .collect(Collectors.groupingBy(ga -> ga.getGoal().getGoalId()));

        // Goal + 매칭되는 GoalAlgorithm 목록으로 DTO 생성
        return goals.stream()
                .map(goal -> {
                    List<GoalAlgorithm> goalAlgorithms =
                            algorithmsByGoalId.getOrDefault(goal.getGoalId(), List.of());
                    return GoalWithAlgorithmsResponseDto.from(goal, goalAlgorithms);
                })
                .collect(Collectors.toList());
    }

    // 기간 + 날짜 기준 Goal 조회 (일간/주간) + GoalAlgorithm 포함
    @Transactional(readOnly = true)
    public List<GoalWithAlgorithmsResponseDto> getGoalsByPeriodAndDate(
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

        return toGoalWithAlgorithmsDtos(goals);
    }

    // 월별 목표 조회 + GoalAlgorithm 포함
    @Transactional(readOnly = true)
    public List<GoalWithAlgorithmsResponseDto> getGoalsByMonth(
            Integer userId,
            int year,
            int month
    ) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("month 기간 오류");
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Goal> goals = goalRepository.findByUserUserIdAndCreateAtBetween(
                userId,
                startDate,
                endDate
        );

        return toGoalWithAlgorithmsDtos(goals);
    }

}
