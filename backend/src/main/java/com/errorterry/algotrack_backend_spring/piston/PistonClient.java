package com.errorterry.algotrack_backend_spring.piston;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class PistonClient {

    private final RestClient restClient;

    // base-url 은 호스트까지만 (포트만)
    public PistonClient(
            @Value("${piston.base-url:http://localhost:2000}") String baseUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public PistonExecuteResponse execute(String language, String code, String stdin) {

        // 🔹 Piston이 요구하는 JSON 구조 그대로 만들기
        // {
        //   "language": "python",
        //   "version": "3.10.0",
        //   "files": [ { "content": "print('hello')" } ],
        //   "stdin": "..."
        // }
        Map<String, Object> body = new HashMap<>();
        body.put("language", language);       // "python"
        body.put("version", "3.10.0");        // runtimes에서 본 그대로

        Map<String, Object> file = new HashMap<>();
        file.put("content", code);            // name 은 필수 아님, 일단 빼자
        body.put("files", List.of(file));

        if (stdin != null && !stdin.isBlank()) {
            body.put("stdin", stdin);
        }

        try {
            log.info("Calling Piston /api/v2/execute with body: {}", body);

            return restClient.post()
                    .uri("/api/v2/execute")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(PistonExecuteResponse.class);

        } catch (HttpClientErrorException e) {
            // 400 같은 거 나면, Piston이 돌려준 에러 바디를 로그로 남겨보자
            log.error("Piston 4xx error status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }
}
