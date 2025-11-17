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
    public ResponseEntity<?> runCode(@RequestBody RunRequest request) {
        try {
            String stdin = request.getStdin() == null ? "" : request.getStdin();

            PistonExecuteResponse result =
                    pistonClient.execute(request.getLanguage(), request.getCode(), stdin);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("runCode error", e);
            ErrorResponse error = new ErrorResponse(
                    "PISTON_ERROR",
                    "코드 실행 중 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
