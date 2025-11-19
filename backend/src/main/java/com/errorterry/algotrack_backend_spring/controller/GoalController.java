package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

}
