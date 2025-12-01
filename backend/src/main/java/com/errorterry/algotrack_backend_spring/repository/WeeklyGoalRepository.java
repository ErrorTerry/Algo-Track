package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.WeeklyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WeeklyGoalRepository extends JpaRepository<WeeklyGoal, Integer> {

    // user_id + week_start_date 기준으로 주간 목표 1개 조회
    Optional<WeeklyGoal> findByUserUserIdAndWeekStartDate(Integer userId, LocalDate weekStartDate);

}
