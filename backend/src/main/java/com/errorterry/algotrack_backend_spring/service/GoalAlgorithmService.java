package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Goal;
import com.errorterry.algotrack_backend_spring.domain.GoalAlgorithm;
import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import com.errorterry.algotrack_backend_spring.dto.GoalAlgorithmResponseDto;
import com.errorterry.algotrack_backend_spring.repository.GoalAlgorithmRepository;
import com.errorterry.algotrack_backend_spring.repository.GoalRepository;
import com.errorterry.algotrack_backend_spring.security.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalAlgorithmService {

    private final GoalAlgorithmRepository goalAlgorithmRepository;
    private final GoalRepository goalRepository;

    // 특정 Goal에 포함된 GoalAlgorithm 목록 조회 (본인 Goal)
    @Transactional(readOnly = true)
    public List<GoalAlgorithmResponseDto> getByGoalId(Integer goalId) {

        Integer currentUserId = AuthUser.getUserId();

        List<GoalAlgorithm> list = goalAlgorithmRepository.findByGoalGoalId(goalId);

        if (!list.isEmpty()) {
            Integer ownerId = list.get(0).getGoal().getUser().getUserId();
            if (!ownerId.equals(currentUserId)) {
                throw new AccessDeniedException("본인의 Goal에만 접근할 수 있습니다.");
            }
        }

        return list.stream()
                .map(GoalAlgorithmResponseDto::from)
                .collect(Collectors.toList());
    }

    // 알고리즘명 + 날짜 기준 solveProblem +1 (여러 GoalAlgorithm 대상, 0개면 NO-OP)
    @Transactional
    public List<GoalAlgorithmResponseDto> increaseSolveProblem(String algorithmName, LocalDate date) {

        Integer currentUserId = AuthUser.getUserId();
        if (currentUserId == null) {
            throw new AccessDeniedException("인증되지 않는 사용자입니다.");
        }

        // 주간 범위 계산 (월요일 시작 기준)
        DayOfWeek dow = date.getDayOfWeek();
        LocalDate startOfWeek = date.minusDays(dow.getValue() - DayOfWeek.MONDAY.getValue());
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        // 로그인된 사용자의 목표 중 해당 날짜에 유효한 Goal 선별
        List<Goal> weekGoals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAtBetween(
                currentUserId,
                GoalPeriod.WEEK,
                startOfWeek,
                endOfWeek
        );

        List<Goal> dayGoals = goalRepository.findByUserUserIdAndGoalPeriodAndCreateAt(
                currentUserId,
                GoalPeriod.DAY,
                date
        );

        List<Goal> targetGoals = new ArrayList<>();
        targetGoals.addAll(weekGoals);
        targetGoals.addAll(dayGoals);

        // 유효한 Goal이 없으면 NO-OP
        if (targetGoals.isEmpty()) {
            return List.of();
        }

        // 선별된 Goal들에 대한 GoalAlgorithm 조회
        List<Integer> goalIds = targetGoals.stream()
                .map(Goal::getGoalId)
                .collect(Collectors.toList());

        List<GoalAlgorithm> candidates = goalAlgorithmRepository.findByGoalGoalIdIn(goalIds)
                .stream()
                .filter(ga -> algorithmName.equals(ga.getAlgorithm().getAlgorithmName()))
                .collect(Collectors.toList());

        // 해당 알고리즘명이 하나도 없으면 NO-OP
        if (candidates.isEmpty()) {
            return List.of();
        }

        // solveProblem +1 (solveProblem < goalProblem 인 경우만)
        boolean anyUpdated = false;
        for (GoalAlgorithm ga : candidates) {
            Integer currentSolve = ga.getSolveProblem();
            Integer goalProblem = ga.getGoalProblem();

            if (currentSolve < goalProblem) {
                ga.setSolveProblem(currentSolve + 1);
                anyUpdated = true;
            }
        }

        // 업데이트할 게 없으면(이미 전부 달성) 그대로 NO-OP 반환
        if (!anyUpdated) {
            return List.of();
        }

        List<GoalAlgorithm> saved = goalAlgorithmRepository.saveAll(candidates);

        return saved.stream()
                .map(GoalAlgorithmResponseDto::from)
                .collect(Collectors.toList());
    }
}
