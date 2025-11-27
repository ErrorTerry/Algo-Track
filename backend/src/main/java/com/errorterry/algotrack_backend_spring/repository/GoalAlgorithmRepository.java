package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.GoalAlgorithm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalAlgorithmRepository extends JpaRepository<GoalAlgorithm, Integer> {

    // goal_id 기준 GoalAlgorithm 목록 조회
    List<GoalAlgorithm> findByGoalGoalId(Integer goalId);

    // 여러 goal_id에 대한 GoalAlgorithm 한 번에 조회
    List<GoalAlgorithm> findByGoalGoalIdIn(List<Integer> goalIds);

    // goal_id + algorithm_name 기준 단일 조회
    Optional<GoalAlgorithm> findByGoalGoalIdAndAlgorithmAlgorithmName(Integer goalId, String algorithmName);

    // goal_id + algorithm_id 기준 단일 조회
    Optional<GoalAlgorithm> findByGoalGoalIdAndAlgorithmAlgorithmId(Integer goalId, Integer algorithmId);

}
