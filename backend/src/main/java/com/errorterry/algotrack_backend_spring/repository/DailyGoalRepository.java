package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.DailyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DailyGoalRepository extends JpaRepository<DailyGoal, Integer> {

    // 특정 weekly_goal에 속한 일간 목표 전체 조회
    List<DailyGoal> findByWeeklyGoalWeeklyGoalId(Integer weeklyGoalId);

}
