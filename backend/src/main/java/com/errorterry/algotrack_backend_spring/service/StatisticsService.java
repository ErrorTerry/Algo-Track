package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlySummaryResponseDto;
import com.errorterry.algotrack_backend_spring.repository.AlgorithmRepository;
import com.errorterry.algotrack_backend_spring.repository.SolvedLogStatisticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private final SolvedLogStatisticsRepository solvedLogStatisticsRepository;
    private final AlgorithmRepository algorithmRepository;

    // problem_tier 우선순위
    private static final List<String> TIER_ORDER = List.of(
            "X", "Unrated", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"
    );

    // 월간 통계 요약 조회
    public StatisticsMonthlySummaryResponseDto getMonthlySummary(Integer userId, LocalDate baseDate) {
        YearMonth yearMonth = YearMonth.from(baseDate);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();
        int totalDays = yearMonth.lengthOfMonth();

        // 이번 달 총 풀이 수
        long totalSolved = solvedLogStatisticsRepository.countByUserUserIdAndSolvedDateBetween(
                userId, monthStart, monthEnd
        );

        // 문제 푼 일수
        long solvedDays = solvedLogStatisticsRepository.countSolvedDaysInMonth(
                userId, monthStart, monthEnd
        );

        // 주간 평균 풀이 수
        int weekCount = (int) Math.ceil(totalDays / 7.0);
        double weeklyAverage = weekCount > 0
                ? (double) totalSolved / weekCount
                : 0.0;

        // 일간 평균 풀이 수
        double dailyAverage = totalDays > 0
                ? (double) totalSolved / totalDays
                : 0.0;

        // 가장 많이 푼 알고리즘
        String topAlgorithmName = null;
        Long topAlgorithmSolvedCount = null;

        List<SolvedLogStatisticsRepository.AlgorithmCountProjection> algorithmStats =
                solvedLogStatisticsRepository.findTopAlgorithmsBySolvedCount(userId, monthStart, monthEnd);

        if (!algorithmStats.isEmpty()) {
            // 쿼리에서 solvedCount desc, algorithmId asc 정렬되어 있음
            SolvedLogStatisticsRepository.AlgorithmCountProjection top = algorithmStats.get(0);
            Integer topAlgorithmId = top.getAlgorithmId();
            topAlgorithmSolvedCount = top.getSolvedCount();

            Optional<Algorithm> algorithmOpt = algorithmRepository.findById(topAlgorithmId);
            topAlgorithmName = algorithmOpt.map(Algorithm::getAlgorithmName).orElse(null);
        }

        // 가장 많이 푼 문제 티어
        String topProblemTier = null;
        Long topProblemTierSolvedCount = null;

        List<SolvedLogStatisticsRepository.TierCountProjection> tierStats =
                solvedLogStatisticsRepository.findTierStatsBySolvedCount(userId, monthStart, monthEnd);

        if (!tierStats.isEmpty()) {
            Optional<SolvedLogStatisticsRepository.TierCountProjection> topTierOpt =
                    tierStats.stream()
                            .max(
                                    Comparator
                                            .comparingLong(SolvedLogStatisticsRepository.TierCountProjection::getSolvedCount)
                                            .thenComparingInt(t -> tierPriority(t.getProblemTier()))
                            );

            SolvedLogStatisticsRepository.TierCountProjection topTier = topTierOpt.get();
            topProblemTier = topTier.getProblemTier();
            topProblemTierSolvedCount = topTier.getSolvedCount();
        }

        return StatisticsMonthlySummaryResponseDto.builder()
                .baseDate(baseDate)
                .monthStartDate(monthStart)
                .monthEndDate(monthEnd)
                .totalSolved(totalSolved)
                .weeklyAverage(weeklyAverage)
                .dailyAverage(dailyAverage)
                .solvedDays((int) solvedDays)
                .totalDays(totalDays)
                .topAlgorithmName(topAlgorithmName)
                .topAlgorithmSolvedCount(topAlgorithmSolvedCount)
                .topProblemTier(topProblemTier)
                .topProblemTierSolvedCount(topProblemTierSolvedCount)
                .build();

    }

    // 티어 문자열을 내부 우선순위 값으로 반환
    private int tierPriority(String tier) {
        int idx = TIER_ORDER.indexOf(tier);
        return Math.max(idx, 0); // 모르는 값이면 가장 낮은 우선순위
    }

}
