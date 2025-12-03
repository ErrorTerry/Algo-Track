package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import com.errorterry.algotrack_backend_spring.domain.SolvedLog;
import com.errorterry.algotrack_backend_spring.dto.MonthlyStatisticsResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlyAdviceResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlySummaryResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsWeekdayStatDto;
import com.errorterry.algotrack_backend_spring.repository.AlgorithmRepository;
import com.errorterry.algotrack_backend_spring.repository.SolvedLogStatisticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private final SolvedLogStatisticsRepository solvedLogStatisticsRepository;
    private final AlgorithmRepository algorithmRepository;

    // 티어 문자열 우선순위 / 점수 매핑
    private static final List<String> TIER_ORDER = List.of(
            "X", "Unrated", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"
    );

    private static final Map<String, Double> TIER_SCORE_MAP = Map.ofEntries(
            Map.entry("X", 0.0),
            Map.entry("Unrated", 0.0),
            Map.entry("Bronze", 1.0),
            Map.entry("Silver", 2.0),
            Map.entry("Gold", 3.0),
            Map.entry("Platinum", 4.0),
            Map.entry("Diamond", 5.0),
            Map.entry("Ruby", 6.0)
    );

    private static final double EPS = 0.1;                // 난이도 변화 판단 허용 오차
    private static final double BIASED_THRESHOLD = 40.0;  // 편향 판단 비율(%)

    // 티어 문자열을 내부 우선순위 값으로 반환
    private int tierPriority(String tier) {
        int idx = TIER_ORDER.indexOf(tier);
        return Math.max(idx, 0); // 모르는 값이면 가장 낮은 우선순위
    }

    // 티어 문자열을 난이도 점수로 변환
    private double tierScore(String tier) {
        return TIER_SCORE_MAP.getOrDefault(tier, 0.0);
    }

    // 평균 티어 계산 공통 함수
    private Double calcAverageTierScore(List<SolvedLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return null;
        }
        return logs.stream()
                .mapToDouble(log -> tierScore(log.getProblemTier()))
                .average()
                .orElse(0.0);
    }

    // 요일 라벨
    private static final String[] WEEKDAY_LABELS = {
            "일", "월", "화", "수", "목", "금", "토"
    };

    // LocalDate -> 0=일, 1=월, ..., 6=토 인덱스 변환
    private int toWeekdayIndex(LocalDate date) {
        int v = date.getDayOfWeek().getValue();
        return v % 7;   // 1~6 -> 그대로, 7(SUN) -> 0
    }


    // MonthlyStatisticsResponseDto
    public MonthlyStatisticsResponseDto getMonthlySummary(Integer userId, LocalDate baseDate) {
        YearMonth yearMonth = YearMonth.from(baseDate);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();
        int totalDays = yearMonth.lengthOfMonth();

        // ===== 상단 요약 카드 통계 =====

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
        double weeklyAverage = weekCount > 0 ? (double) totalSolved / weekCount : 0.0;

        // 일간 평균 풀이 수
        double dailyAverage = totalDays > 0 ? (double) totalSolved / totalDays : 0.0;

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

        StatisticsMonthlySummaryResponseDto summary = StatisticsMonthlySummaryResponseDto.builder()
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

        // ===== 해당 월 solved_log 전체 조회 =====
        List<SolvedLog> currentMonthLogs =
                solvedLogStatisticsRepository.findByUserUserIdAndSolvedDateBetween(
                        userId, monthStart, monthEnd
                );

        // ===== 조언(Advice) 계산 =====
        StatisticsMonthlyAdviceResponseDto advice =
                buildAdvice(userId, yearMonth, monthStart, monthEnd, totalSolved, currentMonthLogs);

        // ===== 요일별 평균 풀이 수 통계 계산 =====
        List<StatisticsWeekdayStatDto> weekdayStats =
                buildWeekdayStats(yearMonth, currentMonthLogs);

        // ===== summary + advice 묶어서 최종 DTO 반환 =====
        return MonthlyStatisticsResponseDto.builder()
                .summary(summary)
                .advice(advice)
                .weekdayStats(weekdayStats)
                .build();
    }

    // 조언 전용 빌더
    private StatisticsMonthlyAdviceResponseDto buildAdvice(
            Integer userId,
            YearMonth yearMonth,
            LocalDate monthStart,
            LocalDate monthEnd,
            long totalSolved,
            List<SolvedLog> currentMonthLogs
    ) {
        // 1) 알고리즘 풀이 비중 기반 조언 + 편향 감지
        String lowestRatioAlgorithmName = null;
        Double lowestRatioPercent = null;
        String biasedAlgorithmName = null;
        Double biasedAlgorithmPercent = null;

        List<SolvedLogStatisticsRepository.AlgorithmCountProjection> algorithmStats =
                solvedLogStatisticsRepository.findTopAlgorithmsBySolvedCount(userId, monthStart, monthEnd);

        if (totalSolved > 0 && !algorithmStats.isEmpty()) {

            // algorithmId -> name 매핑
            Map<Integer, String> algorithmNameMap = algorithmRepository.findAllById(
                            algorithmStats.stream()
                                    .map(SolvedLogStatisticsRepository.AlgorithmCountProjection::getAlgorithmId)
                                    .collect(Collectors.toSet())
                    ).stream()
                    .collect(Collectors.toMap(
                            Algorithm::getAlgorithmId,
                            Algorithm::getAlgorithmName
                    ));

            double minRatio = Double.MAX_VALUE;
            String minAlgoName = null;

            double biasedMaxRatio = Double.MIN_VALUE;
            String biasedAlgoNameTemp = null;

            for (var stat : algorithmStats) {

                long count = stat.getSolvedCount();
                double ratio = (double) count * 100.0 / (double) totalSolved;

                String name = algorithmNameMap.get(stat.getAlgorithmId());

                // 가장 낮은 비중 알고리즘만 계산
                if (ratio < minRatio) {
                    minRatio = ratio;
                    minAlgoName = name;
                }

                // 편향 감지 (특정 비율 이상)
                if (ratio >= BIASED_THRESHOLD && ratio > biasedMaxRatio) {
                    biasedMaxRatio = ratio;
                    biasedAlgoNameTemp = name;
                }
            }

            lowestRatioAlgorithmName = minAlgoName;
            lowestRatioPercent = (minRatio == Double.MAX_VALUE) ? null : minRatio;

            if (biasedAlgoNameTemp != null) {
                biasedAlgorithmName = biasedAlgoNameTemp;
                biasedAlgorithmPercent = biasedMaxRatio;
            }
        }

        // 2) 난이도 상승 패턴 조언 (주 단위 + 월 단위)
        String weeklyTrend = "NONE";
        Integer weeklyTrendStreak = 0;
        Double previousAvgTier = null;
        Double currentAvgTier = null;
        String monthlyTrend = "NONE";

        // (a) 주 단위 평균 티어 계산
        if (!currentMonthLogs.isEmpty()) {
            Map<Integer, List<Double>> weekScoreMap = new HashMap<>();

            for (SolvedLog log : currentMonthLogs) {
                int dayOfMonth = log.getSolvedDate().getDayOfMonth();
                int weekIndex = (dayOfMonth - 1) / 7; // 0-based

                double score = tierScore(log.getProblemTier());

                weekScoreMap
                        .computeIfAbsent(weekIndex, k -> new ArrayList<>())
                        .add(score);
            }

            List<Integer> sortedWeeks = weekScoreMap.keySet().stream().sorted().toList();
            List<Double> weeklyAverages = new ArrayList<>();

            for (Integer w : sortedWeeks) {
                List<Double> scores = weekScoreMap.get(w);
                double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                weeklyAverages.add(avg);
            }

            if (weeklyAverages.size() >= 2) {
                List<String> weekTrends = new ArrayList<>();

                for (int i = 1; i < weeklyAverages.size(); i++) {
                    double prev = weeklyAverages.get(i - 1);
                    double curr = weeklyAverages.get(i);
                    double diff = curr - prev;

                    if (diff > EPS) {
                        weekTrends.add("UP");
                    } else if (diff < -EPS) {
                        weekTrends.add("DOWN");
                    } else {
                        weekTrends.add("SAME");
                    }
                }

                String lastTrend = weekTrends.get(weekTrends.size() - 1);
                weeklyTrend = lastTrend;

                int streak = 1;
                for (int i = weekTrends.size() - 2; i >= 0; i--) {
                    if (weekTrends.get(i).equals(lastTrend)) {
                        streak++;
                    } else {
                        break;
                    }
                }
                weeklyTrendStreak = streak;
            } else {
                weeklyTrend = "NONE";
                weeklyTrendStreak = 0;
            }
        } else {
            weeklyTrend = "NONE";
            weeklyTrendStreak = 0;
        }

        // (b) 월 단위 평균 티어 (지난달 vs 이번달)
        currentAvgTier = calcAverageTierScore(currentMonthLogs);

        YearMonth prevYearMonth = yearMonth.minusMonths(1);
        LocalDate prevMonthStart = prevYearMonth.atDay(1);
        LocalDate prevMonthEnd = prevYearMonth.atEndOfMonth();

        List<SolvedLog> prevMonthLogs =
                solvedLogStatisticsRepository.findByUserUserIdAndSolvedDateBetween(userId, prevMonthStart, prevMonthEnd);

        previousAvgTier = calcAverageTierScore(prevMonthLogs);

        if (previousAvgTier != null && currentAvgTier != null) {
            double diff = currentAvgTier - previousAvgTier;
            if (diff > EPS) {
                monthlyTrend = "UP";
            } else if (diff < -EPS) {
                monthlyTrend = "DOWN";
            } else {
                monthlyTrend = "SAME";
            }
        } else {
            monthlyTrend = "NONE";
        }

        return StatisticsMonthlyAdviceResponseDto.builder()
                .lowestRatioAlgorithmName(lowestRatioAlgorithmName)
                .lowestRatioPercent(lowestRatioPercent)
                .biasedAlgorithmName(biasedAlgorithmName)
                .biasedAlgorithmPercent(biasedAlgorithmPercent)
                .difficultyWeeklyTrend(weeklyTrend)
                .difficultyWeeklyTrendStreakWeeks(weeklyTrendStreak)
                .difficultyMonthlyTrend(monthlyTrend)
                .build();
    }

    // 요일별 평균 풀이 수 통계 빌더
    private List<StatisticsWeekdayStatDto> buildWeekdayStats(YearMonth yearMonth, List<SolvedLog> currentMonthLogs) {

        int[] dayCount = new int[7];        // 해당 월에서 요일별 등장 횟수 (캘린더 기준)
        long[] solvedCount = new long[7];   // 해당 월에서 요일별 풀이 수 합계

        int lengthOfMonth = yearMonth.lengthOfMonth();

        // 1) 캘린더 기준 dayCount 계산 (사용자가 풀었는지와 무관)
        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate date = yearMonth.atDay(day);
            int idx = toWeekdayIndex(date); // 0=일, 1=월, ... 6=토
            dayCount[idx]++;
        }

        // 2) solved_log 기준 solvedCount 계산
        if (currentMonthLogs != null) {
            for (SolvedLog log : currentMonthLogs) {
                int idx = toWeekdayIndex(log.getSolvedDate());
                solvedCount[idx]++;
            }
        }

        // 3) avgSolved 계산 + DTO 생성
        List<StatisticsWeekdayStatDto> stats = new ArrayList<>();

        // 프론트 예시와 맞추기 위해: 월(1)~토(6), 마지막에 일(0)
        int[] order = {1, 2, 3, 4, 5, 6, 0};

        for (int idx : order) {
            int days = dayCount[idx];
            long solves = solvedCount[idx];

            double avg = 0.0;
            if (days > 0) {
                avg = (double) solves / (double) days;
            }

            StatisticsWeekdayStatDto dto = StatisticsWeekdayStatDto.builder()
                    .dayOfWeek(idx)
                    .label(WEEKDAY_LABELS[idx])
                    .avgSolved(avg)
                    .build();

            stats.add(dto);
        }

        return stats;
    }


}
