package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.SolvedLog;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SolvedLogStatisticsRepository extends Repository<SolvedLog, Integer> {

    // 상단 요약 카드
    // 이번 달 총 풀이 수
    long countByUserUserIdAndSolvedDateBetween(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate
    );

    // 문제 푼 일수
    @Query("""
        SELECT COUNT(DISTINCT sl.solvedDate)
        FROM SolvedLog sl
        WHERE sl.user.userId = :userId AND sl.solvedDate BETWEEN :startDate AND :endDate
    """)
    long countSolvedDaysInMonth(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 가장 많이 푼 알고리즘
    interface AlgorithmCountProjection {
        Integer getAlgorithmId();
        Long getSolvedCount();
    }

    @Query("""
        SELECT sl.algorithm.algorithmId AS algorithmId, COUNT(sl) AS solvedCount
        FROM SolvedLog sl
        WHERE sl.user.userId = :userId AND sl.solvedDate BETWEEN :startDate AND :endDate
        GROUP BY sl.algorithm.algorithmId
        ORDER BY solvedCount DESC, algorithmId ASC
    """)
    List<AlgorithmCountProjection> findTopAlgorithmsBySolvedCount(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 가장 많이 푼 문제 티어
    interface TierCountProjection {
        String getProblemTier();
        Long getSolvedCount();
    }

    @Query("""
        SELECT sl.problemTier AS problemTier, COUNT(sl) AS solvedCount
        FROM SolvedLog sl
        WHERE sl.user.userId = :userId AND sl.solvedDate BETWEEN :startDate AND :endDate
        GROUP BY sl.problemTier
    """)
    List<TierCountProjection> findTierStatsBySolvedCount(
            @Param("userId") Integer userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
