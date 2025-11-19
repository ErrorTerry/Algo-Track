package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.service.GoalAlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goal-algorithm")
@RequiredArgsConstructor
public class GoalAlgorithmController {

    private final GoalAlgorithmService goalAlgorithmService;

}
