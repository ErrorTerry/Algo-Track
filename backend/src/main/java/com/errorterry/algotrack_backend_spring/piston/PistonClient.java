package com.errorterry.algotrack_backend_spring.piston;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class PistonClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PistonClient(
            @Value("${piston.base-url:https://emkc.org/api/v2/piston}") String baseUrl,
            ObjectMapper objectMapper
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)   // 결과적으로 https://emkc.org/api/v2/piston 이 들어감
                .build();
        this.objectMapper = objectMapper;

        log.info("🔧 Piston baseUrl = {}", baseUrl);
    }

    public PistonExecuteResponse execute(String language, String code, String stdin) {
        String version = "3.10.0";

        // emkc 문서 스펙에 맞게 JSON 구성
        Map<String, Object> body = Map.of(
                "language", language,
                "version", version,
                "files", List.of(
                        Map.of(
                                "name", "main.py",
                                "content", code
                        )
                ),
                "stdin", stdin == null ? "" : stdin
        );

        // 요청 JSON 로그로 확인
        try {
            String json = objectMapper.writeValueAsString(body);
            log.info("🚀 Piston request JSON = {}", json);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize piston body", e);
        }

        try {
            // baseUrl(…/piston) + "/execute"  => https://emkc.org/api/v2/piston/execute
            return restClient.post()
                    .uri("/execute")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(PistonExecuteResponse.class);
        } catch (HttpClientErrorException e) {
            // 여기서 emkc가 주는 에러 내용 그대로 확인 가능
            log.error("🔥 Piston 4xx status={} headers={} body={}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString());
            throw e;
        }
    }
}
