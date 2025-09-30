package com.errorterry.algotrack_backend_spring;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/")
    public String home() { return "server is up"; }

    @GetMapping("/health")
    public String health() { return "ok"; }
}
