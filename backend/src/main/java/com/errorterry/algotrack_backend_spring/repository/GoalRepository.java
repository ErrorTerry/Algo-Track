package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.Goal;
import com.errorterry.algotrack_backend_spring.domain.GoalPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Integer> {

    // user_id 기준 Goal 목록 조회
    List<Goal> findByUserUserId(Integer userId);

    // 주간 목표 : created_at이 시작일 ~ 종료일 사이인 Goal 목록 조회
    List<Goal> findByUserUserIdAndGoalPeriodAndCreateAtBetween(
            Integer userId,
            GoalPeriod goalPeriod,
            LocalDate startDate,
            LocalDate endDate
    );

    // 일간 목표 : created_at이 특정 날짜와 같은 Goal 목록 조회
    List<Goal> findByUserUserIdAndGoalPeriodAndCreateAt(
      Integer userId,
      GoalPeriod goalPeriod,
      LocalDate targetDate
    );

}
