package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import com.errorterry.algotrack_backend_spring.domain.DailyGoal;
import com.errorterry.algotrack_backend_spring.domain.WeeklyGoal;
import com.errorterry.algotrack_backend_spring.dto.WeeklyGoalAlgorithmSummaryDto;
import com.errorterry.algotrack_backend_spring.dto.WeeklyGoalSummaryResponseDto;
import com.errorterry.algotrack_backend_spring.repository.DailyGoalRepository;
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

}
