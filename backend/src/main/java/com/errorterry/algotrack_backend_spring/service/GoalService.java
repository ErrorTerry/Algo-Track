package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.*;
import com.errorterry.algotrack_backend_spring.dto.*;
import com.errorterry.algotrack_backend_spring.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        GoalPeriod period = request.getGoalPeriod();
        if (period == null) {
            throw new IllegalArgumentException("목표 기간 오류");
        }

        LocalDate targetDate = request.getTargetDate();
        if (targetDate == null) {
            throw new IllegalArgumentException("목표 기준 날짜 오류");
        }

        // 기간별로 기존 Goal 있는지 조회 (없으면 새로 생성)
        Goal targetGoal;

        // WEEK Goal 처리 (주당 1개 유지)
        if (period == GoalPeriod.WEEK) {

            DayOfWeek dow = targetDate.getDayOfWeek();
            LocalDate startOfWeek = targetDate.minusDays(dow.getValue() - DayOfWeek.MONDAY.getValue());
            LocalDate endOfWeek = startOfWeek.plusDays(6);

            List<Goal> weekGoals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAtBetween(
                    userId,
                    GoalPeriod.WEEK,
                    startOfWeek,
                    endOfWeek
            );

            if (weekGoals.size() > 1) {
                throw new IllegalArgumentException("데이터 오류 : 동일 주에 WEEK Goal이 2개 이상 존재");
            }

            if (weekGoals.size() == 1) {
                targetGoal = weekGoals.get(0);
            } else {
                targetGoal = Goal.builder()
                        .user(user)
                        .goalPeriod(GoalPeriod.WEEK)
                        .createAt(targetDate)
                        .build();
                targetGoal = goalRepository.save(targetGoal);
            }

            // DAY Goal 처리 (날짜당 1개 유자)
        } else if (period == GoalPeriod.DAY) {

            List<Goal> dayGoals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAt(
                    userId,
                    GoalPeriod.DAY,
                    targetDate
            );

            if (dayGoals.size() > 1) {
                throw new IllegalArgumentException("데이터 오류 : 동일 날짜에 DAY Goal이 2개 이상 존재");
            }

            if (dayGoals.size() == 1) {
                targetGoal = dayGoals.get(0);
            } else {
                targetGoal = Goal.builder()
                        .user(user)
                        .goalPeriod(GoalPeriod.DAY)
                        .createAt(targetDate)
                        .build();
                targetGoal = goalRepository.save(targetGoal);
            }

        } else {
            throw new IllegalArgumentException("지원하지 않는 기간입니다.");
        }

        // GoalAlgorithm 처리 (중첩 추가)
        if (request.getGoalAlgorithms() != null) {
            for (GoalAlgorithmCreateRequestDto algDto : request.getGoalAlgorithms()) {

                Integer algorithmId = algDto.getAlgorithmId();
                if (algorithmId == null) {
                    throw new IllegalArgumentException("algorithmId가 비어있습니다.");
                }

                Algorithm algorithm = algorithmRepository.findById(algorithmId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알고리즘"));

                Optional<GoalAlgorithm> existingOpt =
                        goalAlgorithmRepository.findByGoalGoalIdAndAlgorithmAlgorithmId(
                                targetGoal.getGoalId(),
                                algorithmId
                        );

                Integer addGoalProblem = algDto.getGoalProblem() != null ? algDto.getGoalProblem() : 0;

                if (existingOpt.isPresent()) {
                    GoalAlgorithm existing = existingOpt.get();
                    existing.setGoalProblem(existing.getGoalProblem() + addGoalProblem);
                    goalAlgorithmRepository.save(existing);
                } else {
                    GoalAlgorithm goalAlgorithm = GoalAlgorithm.builder()
                            .goal(targetGoal)
                            .algorithm(algorithm)
                            .goalProblem(addGoalProblem)
                            .solveProblem(0)
                            .build();
                    goalAlgorithmRepository.save(goalAlgorithm);
                }
            }
        }
        // 최종 반환
        return GoalResponseDto.from(targetGoal);
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
