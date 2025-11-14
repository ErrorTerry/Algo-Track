package com.errorterry.algotrack_backend_spring.piston;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class PistonClient {

    private final RestClient restClient;

    public PistonClient(
            @Value("${piston.base-url:http://localhost:2000/api/v2}") String baseUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public PistonExecuteResponse execute(String language, String code, String stdin) {
        String version = "3.10.0"; // 일단 파이썬 버전 고정

        PistonExecuteRequest requestBody = new PistonExecuteRequest();
        requestBody.setLanguage(language);
        requestBody.setVersion(version);
        requestBody.setStdin(stdin);
        requestBody.setFiles(
                List.of(new PistonExecuteRequest.FilePart("main.py", code))
        );

        return restClient.post()
                .uri("/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(PistonExecuteResponse.class);
    }
}
