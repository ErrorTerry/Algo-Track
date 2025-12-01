package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import com.errorterry.algotrack_backend_spring.domain.DailyGoal;
import com.errorterry.algotrack_backend_spring.domain.User;
import com.errorterry.algotrack_backend_spring.domain.WeeklyGoal;
import com.errorterry.algotrack_backend_spring.dto.*;
import com.errorterry.algotrack_backend_spring.repository.AlgorithmRepository;
import com.errorterry.algotrack_backend_spring.repository.DailyGoalRepository;
import com.errorterry.algotrack_backend_spring.repository.UserRepository;
import com.errorterry.algotrack_backend_spring.repository.WeeklyGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeeklyGoalService {

    private final WeeklyGoalRepository weeklyGoalRepository;
    private final DailyGoalRepository dailyGoalRepository;
    private final UserRepository userRepository;
    private final AlgorithmRepository algorithmRepository;

    // 주간 목표 요약 조회
    // userId + weekStartDate 기준으로 WeeklyGoal 찾기
    @Transactional(readOnly = true)
    public WeeklyGoalSummaryResponseDto getWeeklySummary(Integer userId, LocalDate weekStartDate) {

        // 주간 목표 X -> 빈 algorithms 반환
        Optional<WeeklyGoal> weeklyGoalOpt = weeklyGoalRepository.findByUserUserIdAndWeekStartDate(userId, weekStartDate);

        if (weeklyGoalOpt.isEmpty()) {
            return WeeklyGoalSummaryResponseDto.builder()
                    .weekStartDate(weekStartDate)
                    .algorithms(List.of())
                    .build();
        }

        WeeklyGoal weeklyGoal = weeklyGoalOpt.get();

        List<DailyGoal> dailyGoals = dailyGoalRepository.findByWeeklyGoalWeeklyGoalId(weeklyGoal.getWeeklyGoalId());

        if (dailyGoals.isEmpty()) {
            return WeeklyGoalSummaryResponseDto.builder()
                    .weekStartDate(weekStartDate)
                    .algorithms(List.of())
                    .build();
        }

        // 알고리즘 기준으로 그룹화
        Map<Algorithm, List<DailyGoal>> byAlgorithm =
                dailyGoals.stream()
                        .collect(Collectors.groupingBy(DailyGoal::getAlgorithm));

        List<WeeklyGoalAlgorithmSummaryDto> algorithmDtos = new ArrayList<>();

        for (Map.Entry<Algorithm, List<DailyGoal>> entry : byAlgorithm.entrySet()) {

            Algorithm algorithm = entry.getKey();
            List<DailyGoal> goalsForAlg = entry.getValue();

            int[] dailyPlan = new int[7];
            int[] dailySolved = new int[7];
            int weeklyCount = 0;

            for (DailyGoal dailyGoal : goalsForAlg) {
                LocalDate goalDate = dailyGoal.getGoalDate();

                long diff = ChronoUnit.DAYS.between(weekStartDate, goalDate);
                int index = (int) diff;

                // 주차 범위 (0~6) 안에 있는 날짜만 반영
                if (index >= 0 && index < 7) {
                    int goalCount = dailyGoal.getGoalCount() != null ? dailyGoal.getGoalCount() : 0;
                    int solveCount = dailyGoal.getSolveCount() != null ? dailyGoal.getSolveCount() : 0;

                    dailyPlan[index] = goalCount;
                    dailySolved[index] = solveCount;

                    weeklyCount += goalCount;
                }
            }

            WeeklyGoalAlgorithmSummaryDto dto = WeeklyGoalAlgorithmSummaryDto.builder()
                    .algorithmId(algorithm.getAlgorithmId())
                    .algorithmName(algorithm.getAlgorithmName())
                    .weeklyCount(weeklyCount)
                    .dailyPlan(dailyPlan)
                    .dailySolved(dailySolved)
                    .build();

            algorithmDtos.add(dto);
        }

        return WeeklyGoalSummaryResponseDto.builder()
                .weekStartDate(weekStartDate)
                .algorithms(algorithmDtos)
                .build();
    }

    // 주간 목표 생성/갱신
    // - (userId, weekStartDate) 기준 WeeklyGoal 조회 후, 없으면 생성
    // - algorithms[algorithmId + dailyPlan[7]] 기준으로 DailyGoal 생성/갱신
    @Transactional
    public WeeklyGoalSaveResponseDto createOrUpdateWeeklyGoal(
            Integer userId,
            WeeklyGoalCreateRequestDto request
    ) {

        if (request == null) {
            throw new IllegalArgumentException("요청이 비어있습니다.");
        }

        LocalDate weekStartDate = request.getWeekStartDate();
        if (weekStartDate == null) {
            throw new IllegalArgumentException("weekStartDate가 비어있습니다.");
        }

        if (request.getAlgorithms() == null || request.getAlgorithms().isEmpty()) {
            throw new IllegalArgumentException("algorithms가 비어있습니다.");
        }

        // 1. User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. weekly_goal 조회 또는 생성
        WeeklyGoal weeklyGoal = weeklyGoalRepository
                .findByUserUserIdAndWeekStartDate(userId, weekStartDate)
                .orElseGet(() -> {
                    WeeklyGoal newWeeklyGoal = WeeklyGoal.builder()
                            .user(user)
                            .weekStartDate(weekStartDate)
                            .build();
                    return weeklyGoalRepository.save(newWeeklyGoal);
                });

        Integer weeklyGoalId = weeklyGoal.getWeeklyGoalId();

        // 3. 알고리즘별 dailyPlan 처리
        for (WeeklyGoalAlgorithmPlanRequestDto algDto : request.getAlgorithms()) {

            Integer algorithmId = algDto.getAlgorithmId();
            if (algorithmId == null) {
                throw new IllegalArgumentException("algorithmId : null");
            }

            Algorithm algorithm = algorithmRepository.findById(algorithmId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 algorithmId"));
            int[] dailyPlan = algDto.getDailyPlan();
            if (dailyPlan == null || dailyPlan.length != 7) {
                throw new IllegalArgumentException("dailyPlan 길이 오류 (7이 아님)");
            }

            for (int i = 0; i < 7; i++) {
                int plan = dailyPlan[i];

                if (plan < 0) {
                    throw new IllegalArgumentException("dailyPlan 값 오류");
                }

                // dailyPlan 값 0 : pass
                if (plan == 0) {
                    continue;
                }

                LocalDate goalDate = weekStartDate.plusDays(i);

                // 기존 daily_goal 존재 여부 확인
                Optional<DailyGoal> existingOpt =
                        dailyGoalRepository.findByWeeklyGoalWeeklyGoalIdAndAlgorithmAlgorithmIdAndGoalDate(
                                weeklyGoalId,
                                algorithmId,
                                goalDate
                        );

                if (existingOpt.isPresent()) {
                    // 기존 daily_goal -> goal_count 누적
                    DailyGoal existing = existingOpt.get();
                    int currentGoalCount = existing.getGoalCount() != null ? existing.getGoalCount() : 0;
                    existing.setGoalCount(currentGoalCount + plan);
                } else {
                    // 새 daily_goal 생성
                    DailyGoal newDailyGoal = DailyGoal.builder()
                            .weeklyGoal(weeklyGoal)
                            .algorithm(algorithm)
                            .goalDate(goalDate)
                            .goalCount(plan)
                            .solveCount(0)
                            .build();
                    dailyGoalRepository.save(newDailyGoal);
                }
            }
        }

        return WeeklyGoalSaveResponseDto.builder()
                .weeklyGoalId(weeklyGoalId)
                .weekStartDate(weekStartDate)
                .build();
    }

}
