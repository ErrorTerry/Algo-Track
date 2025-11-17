package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.ErrorResponse;
import com.errorterry.algotrack_backend_spring.dto.RunRequest;
import com.errorterry.algotrack_backend_spring.piston.PistonClient;
import com.errorterry.algotrack_backend_spring.piston.PistonExecuteResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("/api")
public class CodeRunController {

    private final PistonClient pistonClient;

    public CodeRunController(PistonClient pistonClient) {
        this.pistonClient = pistonClient;
    }

    @PostMapping("/run")
    public PistonExecuteResponse runCode(@RequestBody RunRequest request) {
        return pistonClient.execute(
                request.getLanguage(),
                request.getCode(),
                request.getStdin()
        );
    }
}
