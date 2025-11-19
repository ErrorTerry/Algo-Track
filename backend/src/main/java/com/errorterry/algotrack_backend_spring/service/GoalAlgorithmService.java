package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.repository.GoalAlgorithmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoalAlgorithmService {

    private final GoalAlgorithmRepository goalAlgorithmRepository;

}
