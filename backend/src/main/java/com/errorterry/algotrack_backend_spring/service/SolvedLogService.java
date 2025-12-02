package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.*;
import com.errorterry.algotrack_backend_spring.dto.SolvedLogRequestDto;
import com.errorterry.algotrack_backend_spring.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SolvedLogService {

    private final SolvedLogRepository solvedLogRepository;
    private final UserRepository userRepository;
    private final AlgorithmRepository algorithmRepository;
    private final DailyGoalRepository dailyGoalRepository;

    // solved_log 기록 + daily_goal.solve_count 증가
    // - userId + problemId 기준으로 기존 해결 이력이 있으면 PASS
    // - 없으면
    //  1) solved_log insert
    //  2) 해당 날짜/알고리즘 daily_goal이 있으면 solve_count +1
    @Transactional
    public void recordSolvedAndIncreaseDailyGoal(
            Integer userId,
            SolvedLogRequestDto request
    ) {
        if (request == null) {
            throw new IllegalArgumentException("요청 값 NULL 오류");
        }

        String algorithmName = request.getAlgorithmName();
        Integer problemId = request.getProblemId();
        LocalDate solvedDate = request.getSolvedDate();

        if (algorithmName == null || algorithmName.isBlank()) {
            throw new IllegalArgumentException("algorithmName 값 NULL 오류");
        }
        if (problemId == null) {
            throw new IllegalArgumentException("problemId 값 NULL 오류");
        }
        if (solvedDate == null) {
            throw new IllegalArgumentException("solvedDate 값 NULL 오류");
        }

        // 1) 이미 기록된 해결 이력이 있는지 체크
        boolean exists = solvedLogRepository.existsByUserUserIdAndProblemId(userId, problemId);
        if (exists) {
            // 이미 기록된 문제 -> solved_log / daily_goal 둘 다 PASS
            return;
        }

        // 2) User / Algorithm 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        Algorithm algorithm = algorithmRepository.findByAlgorithmName(algorithmName)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 알고리즘"));

        Integer algorithmId = algorithm.getAlgorithmId();

        // 3) problemTier : 정수 -> 문자열 변환
        String problemTier = convertProblemTierToLabel(request.getProblemTier());

        // 4) solved_log 신규 저장
        SolvedLog solvedLog = SolvedLog.builder()
                .user(user)
                .algorithm(algorithm)
                .problemId(problemId)
                .solvedDate(solvedDate)
                .problemTier(problemTier)
                .build();

        solvedLogRepository.save(solvedLog);

        // 5) daily_goal 처리 (해당 날짜/알고리즘 목표가 있을 경우 solve_count +1)
        dailyGoalRepository
                .findByWeeklyGoalUserUserIdAndAlgorithmAlgorithmIdAndGoalDate(userId, algorithmId, solvedDate)
                .ifPresent(dailyGoal -> {
                    int current = dailyGoal.getSolveCount() != null ? dailyGoal.getSolveCount() : 0;
                    dailyGoal.setSolveCount(current + 1);
                });
    }

    // problemTier : 정수 -> 문자열 변환
    private String convertProblemTierToLabel(Integer problemTier) {
        if (problemTier == null) {
            return "X";
        }

        int score = problemTier;

        if (score <= 0) {
            return "Unrated";
        } else if (score <= 5) {
            return "Bronze";
        } else if (score <= 10) {
            return "Silver";
        } else if (score <= 15) {
            return "Gold";
        } else if (score <= 20) {
            return "Platinum";
        } else if (score <= 25) {
            return "Diamond";
        } else {
            return "Ruby";
        }
    }

}
