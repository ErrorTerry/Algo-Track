package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.DailyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyGoalRepository extends JpaRepository<DailyGoal, Integer> {

    // 특정 weekly_goal에 속한 일간 목표 전체 조회
    List<DailyGoal> findByWeeklyGoalWeeklyGoalId(Integer weeklyGoalId);

    // weekly_goal_id + algorithm_id + goal_date 기준 단일 일간 목표 조회
    Optional<DailyGoal> findByWeeklyGoalWeeklyGoalIdAndAlgorithmAlgorithmIdAndGoalDate(
            Integer weeklyGoalId,
            Integer algorithmId,
            LocalDate goalDate
    );

}
