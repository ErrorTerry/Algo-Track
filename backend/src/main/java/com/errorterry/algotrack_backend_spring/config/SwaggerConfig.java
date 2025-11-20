package com.errorterry.algotrack_backend_spring.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                // 현재 도메인(https://algotrack.store)을 기준으로 /api 같은 식으로 날림
                // 완전 고정하고 싶으면: new Server().url("https://algotrack.store")
                .servers(List.of(new Server().url("/")));
    }
}
