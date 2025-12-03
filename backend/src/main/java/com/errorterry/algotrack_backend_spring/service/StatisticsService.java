package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import com.errorterry.algotrack_backend_spring.domain.SolvedLog;
import com.errorterry.algotrack_backend_spring.dto.MonthlyStatisticsResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlyAdviceResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsMonthlySummaryResponseDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsWeekdayStatDto;
import com.errorterry.algotrack_backend_spring.dto.StatisticsHexagonAxisDto;
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

    // ===== 군집/축 정의 =====
    private enum HexagonAxis {
        IMPLEMENTATION("IMPLEMENTATION", "구현·시뮬레이션·문자열"),
        DATA_STRUCTURE("DATA_STRUCTURE", "자료구조·트리"),
        GRAPH("GRAPH", "그래프·탐색·최단경로"),
        GREEDY("GREEDY", "그리디·투 포인터"),
        DP("DP", "DP·조합론"),
        MATH("MATH", "수학·정수론·기하");

        private final String code;
        private final String label;

        HexagonAxis(String code, String label) {
            this.code = code;
            this.label = label;
        }

        public String getCode() {
            return code;
        }

        public String getLabel() {
            return label;
        }
    }

    // 1. 구현·시뮬레이션·문자열
    private static final Set<String> IMPLEMENTATION_TAGS = Set.of(
            "2-sat",
            "aliens 트릭",
            "bulldozer 트릭",
            "kmp",
            "utf-8 입력 처리",
            "z",
            "경사 하강법",
            "구현",
            "다이얼",
            "다중 대입값 계산",
            "담금질 기법",
            "도형에서의 불 연산",
            "라빈–카프",
            "런타임 전의 전처리",
            "로프",
            "많은 조건 분기",
            "매내처",
            "무작위화",
            "문자열",
            "배타적 논리합 기저 (gf(2))",
            "백트래킹",
            "보이어–무어 다수결 투표",
            "불변량 찾기",
            "브루트포스 알고리즘",
            "비트 집합을 이용한 최장 공통 부분 수열 최적화",
            "비트마스킹",
            "순열 사이클 분할",
            "시뮬레이션",
            "쌍대성",
            "아호-코라식",
            "애드 혹",
            "역추적",
            "재귀",
            "접미사 배열과 lcp 배열",
            "정규 표현식",
            "차분 공격",
            "차수열",
            "춤추는 링크",
            "크누스 x",
            "파싱",
            "플러드 필",
            "하켄부시 게임",
            "함수 개형을 이용한 최적화",
            "해 구성하기",
            "휴리스틱",
            "히르쉬버그"
    );

    // 2. 자료구조·트리
    private static final Set<String> DATA_STRUCTURE_TAGS = Set.of(
            "heavy-light 분할",
            "느리게 갱신되는 세그먼트 트리",
            "다차원 세그먼트 트리",
            "데카르트 트리",
            "덱",
            "덱을 이용한 구간 최댓값 트릭",
            "레드-블랙 트리",
            "리–차오 트리",
            "링크/컷 트리",
            "머지 소트 트리",
            "분리 집합",
            "비트 집합",
            "세그먼트 트리",
            "세그먼트 트리 비츠",
            "센트로이드",
            "센트로이드 분할",
            "스택",
            "스플레이 트리",
            "연결 리스트",
            "우선순위 큐",
            "자료 구조",
            "작은 집합에서 큰 집합으로 합치는 테크닉",
            "접미사 트리",
            "집합과 맵",
            "최소 공통 조상",
            "큐",
            "키네틱 세그먼트 트리",
            "탑 트리",
            "트라이",
            "트리",
            "트리 동형 사상",
            "트리 분할",
            "트리 압축",
            "트리를 사용한 집합과 맵",
            "트리의 지름",
            "퍼시스턴트 세그먼트 트리",
            "해시를 사용한 집합과 맵",
            "해싱",
            "회문 트리",
            "희소 배열"
    );

    // 3. 그래프·탐색·최단경로
    private static final Set<String> GRAPH_TAGS = Set.of(
            "0-1 너비 우선 탐색",
            "강한 연결 요소",
            "격자 그래프",
            "그래프 이론",
            "그래프 탐색",
            "깊이 우선 탐색",
            "너비 우선 탐색",
            "단절점과 단절선",
            "데이크스트라",
            "도미네이터 트리",
            "방향 비순환 그래프",
            "벨만–포드",
            "서큘레이션",
            "선분 교차 판정",
            "선인장",
            "스토어–바그너",
            "쌍대 그래프",
            "양방향 탐색",
            "오일러 경로",
            "오일러 경로 테크닉",
            "오프라인 동적 연결성 판정",
            "위상 정렬",
            "유향 최소 스패닝 트리",
            "이분 그래프",
            "이분 매칭",
            "이중 연결 요소",
            "최단 경로",
            "최대 유량",
            "최대 유량 최소 컷 정리",
            "최소 비용 최대 유량",
            "최소 스패닝 트리",
            "평면 그래프",
            "플로이드–워셜",
            "함수형 그래프",
            "헝가리안",
            "현 그래프"
    );

    // 4. 그리디·투 포인터
    private static final Set<String> GREEDY_TAGS = Set.of(
            "cdq 분할 정복",
            "mo's",
            "값 / 좌표 압축",
            "그리디 알고리즘",
            "단조 큐를 이용한 최적화",
            "두 포인터",
            "매개 변수 탐색",
            "병렬 이분 탐색",
            "분할 정복",
            "분할 정복을 사용한 최적화",
            "분할 정복을 이용한 거듭제곱",
            "삼분 탐색",
            "스위핑",
            "슬라이딩 윈도우",
            "이분 탐색",
            "정렬",
            "제곱근 분할법",
            "중간에서 만나기",
            "차분 배열 트릭",
            "오프라인 쿼리"
    );

    // 5. DP·조합론
    private static final Set<String> DP_TAGS = Set.of(
            "가장 긴 증가하는 부분 수열 문제",
            "게임 이론",
            "다이나믹 프로그래밍",
            "덱을 이용한 다이나믹 프로그래밍",
            "린드스트롬–게셀–비엔노 보조정리",
            "매트로이드",
            "배낭 문제",
            "번사이드 보조정리",
            "부분집합의 합 다이나믹 프로그래밍",
            "비트필드를 이용한 다이나믹 프로그래밍",
            "생성 함수",
            "스프라그–그런디 정리",
            "안정 결혼 문제",
            "외판원 순회 문제",
            "일반적인 매칭",
            "자릿수를 이용한 다이나믹 프로그래밍",
            "조합론",
            "최대 부분 배열 문제",
            "최장 공통 부분 수열 문제",
            "커넥션 프로파일을 이용한 다이나믹 프로그래밍",
            "크누스 최적화",
            "트리에서의 다이나믹 프로그래밍",
            "트리에서의 전방향 다이나믹 프로그래밍",
            "포함 배제의 원리",
            "홀의 결혼 정리"
    );

    // 6. 수학·정수론·기하
    private static final Set<String> MATH_TAGS = Set.of(
            "3차원 기하학",
            "4차원 이상의 기하학",
            "가우스 소거법",
            "각도 정렬",
            "고속 푸리에 변환",
            "그린 정리",
            "기댓값의 선형성",
            "기하학",
            "누적 합",
            "다각형의 넓이",
            "다항식 보간법",
            "다항식을 이용한 선형점화식 계산",
            "델로네 삼각분할",
            "뤼카 정리",
            "모듈로 곱셈 역원",
            "뫼비우스 반전 공식",
            "물리학",
            "미적분학",
            "밀러–라빈 소수 판별법",
            "반평면 교집합",
            "벌리캠프–매시",
            "베이즈 정리",
            "보로노이 다이어그램",
            "볼록 껍질",
            "볼록 껍질을 이용한 최적화",
            "볼록 다각형 내부의 점 판정",
            "비둘기집 원리",
            "사칙연산",
            "생일 문제",
            "선형 계획법",
            "선형대수학",
            "소수 판정",
            "소인수분해",
            "수치해석",
            "수학",
            "에라토스테네스의 체",
            "오목 다각형 내부의 점 판정",
            "오일러 지표 (χ=v-e+f)",
            "오일러 피 함수",
            "유리 등차수열의 내림 합",
            "유클리드 호제법",
            "이산 로그",
            "이산 제곱근",
            "임의 정밀도 / 큰 수 연산",
            "정수론",
            "조화수",
            "중국인의 나머지 정리",
            "지수승강 보조정리",
            "최소 외접원",
            "통계학",
            "페르마의 소정리",
            "폴라드 로",
            "피사노 주기",
            "피타고라스 정리",
            "픽의 정리",
            "홀짝성",
            "확률론",
            "확장 유클리드 호제법",
            "회전하는 캘리퍼스"
    );

    // 알고리즘 이름 → 군집 축 매핑 (없으면 1번 군집(IMPLEMENTATION)으로 처리)
    private HexagonAxis resolveAxisByAlgorithmName(String algorithmName) {
        if (algorithmName == null) {
            return HexagonAxis.IMPLEMENTATION;
        }
        if (IMPLEMENTATION_TAGS.contains(algorithmName)) return HexagonAxis.IMPLEMENTATION;
        if (DATA_STRUCTURE_TAGS.contains(algorithmName)) return HexagonAxis.DATA_STRUCTURE;
        if (GRAPH_TAGS.contains(algorithmName)) return HexagonAxis.GRAPH;
        if (GREEDY_TAGS.contains(algorithmName)) return HexagonAxis.GREEDY;
        if (DP_TAGS.contains(algorithmName)) return HexagonAxis.DP;
        if (MATH_TAGS.contains(algorithmName)) return HexagonAxis.MATH;

        // 6개 군집(226개)에 속하지 않으면 1번 군집으로 카운트
        return HexagonAxis.IMPLEMENTATION;
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

        // ===== 육각형 그래프용 통계 계산 =====
        List<StatisticsHexagonAxisDto> hexagon =
                buildHexagonStats(totalSolved, algorithmStats);

        // ===== summary + advice + weekdayStats + hexagon 묶어서 최종 DTO 반환 =====
        return MonthlyStatisticsResponseDto.builder()
                .summary(summary)
                .advice(advice)
                .weekdayStats(weekdayStats)
                .hexagon(hexagon)
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

    // 육각형 그래프용 통계 빌더
    private List<StatisticsHexagonAxisDto> buildHexagonStats(
            long totalSolved,
            List<SolvedLogStatisticsRepository.AlgorithmCountProjection> algorithmStats
    ) {
        // 축별 solved 카운트 초기화
        EnumMap<HexagonAxis, Long> axisSolvedMap = new EnumMap<>(HexagonAxis.class);
        for (HexagonAxis axis : HexagonAxis.values()) {
            axisSolvedMap.put(axis, 0L);
        }

        if (totalSolved > 0 && algorithmStats != null && !algorithmStats.isEmpty()) {
            // algorithmId -> algorithmName 매핑
            Set<Integer> algorithmIds = algorithmStats.stream()
                    .map(SolvedLogStatisticsRepository.AlgorithmCountProjection::getAlgorithmId)
                    .collect(Collectors.toSet());

            Map<Integer, String> algorithmNameMap = algorithmRepository.findAllById(algorithmIds)
                    .stream()
                    .collect(Collectors.toMap(
                            Algorithm::getAlgorithmId,
                            Algorithm::getAlgorithmName
                    ));

            // 알고리즘별 solvedCount를 군집 축으로 모으기
            for (SolvedLogStatisticsRepository.AlgorithmCountProjection stat : algorithmStats) {
                String algorithmName = algorithmNameMap.get(stat.getAlgorithmId());
                HexagonAxis axis = resolveAxisByAlgorithmName(algorithmName);
                long current = axisSolvedMap.getOrDefault(axis, 0L);
                axisSolvedMap.put(axis, current + stat.getSolvedCount());
            }
        }

        // 축별 비율 계산 및 DTO 생성
        List<StatisticsHexagonAxisDto> result = new ArrayList<>();

        for (HexagonAxis axis : HexagonAxis.values()) {
            long solved = axisSolvedMap.get(axis);
            double ratio = (totalSolved > 0)
                    ? (solved * 100.0 / (double) totalSolved)
                    : 0.0;

            StatisticsHexagonAxisDto dto = StatisticsHexagonAxisDto.builder()
                    .axis(axis.getCode())
                    .label(axis.getLabel())
                    .solved(solved)
                    .ratio(ratio)
                    .build();

            result.add(dto);
        }

        return result;
    }


}
