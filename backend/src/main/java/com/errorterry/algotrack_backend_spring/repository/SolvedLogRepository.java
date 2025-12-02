package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.SolvedLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolvedLogRepository extends JpaRepository<SolvedLog, Integer> {

    // user_id + problem_id 기준으로 문제 해결 이력 존재 여부 조회
    boolean existsByUserUserIdAndProblemId(Integer userId, Integer problemId);

}
