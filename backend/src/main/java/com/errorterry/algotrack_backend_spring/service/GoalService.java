package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

}
