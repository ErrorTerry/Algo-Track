package com.errorterry.algotrack_backend_spring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 개발 중: Vite dev 서버
                .allowedOrigins("http://localhost:5173",
                        "https://www.acmicpc.net")
                // 확장앱: chrome-extension:// 확장앱 주소
                .allowedOriginPatterns("chrome-extension://*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
