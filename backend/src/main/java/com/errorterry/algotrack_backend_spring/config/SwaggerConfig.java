package com.errorterry.algotrack_backend_spring.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        String schemeName = "BearerAuth";

        return new OpenAPI()
                // SWAGGER 인증 버튼 생성 부분
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName,
                                new SecurityScheme()
                                        .name(schemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                )
                // 현재 도메인(https://algotrack.store)을 기준으로 /api 같은 식으로 날림
                // 완전 고정하고 싶으면: new Server().url("https://algotrack.store")
                .servers(List.of(new Server().url("/")));
    }
}
