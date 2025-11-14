package com.errorterry.algotrack_backend_spring.controller;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/_debug")
@RequiredArgsConstructor
public class DebugController {

    private final EntityManager em;

    @GetMapping("/dbinfo")
    public ResponseEntity<Map<String, Object>> dbinfo() {
        Object[] row = (Object[]) em.createNativeQuery(
                "select current_database(), current_user, current_schema()"
        ).getSingleResult();

        return ResponseEntity.ok(Map.of(
                "database", row[0],
                "user", row[1],
                "schema", row[2]
        ));
    }

    @GetMapping("/users-count")
    public ResponseEntity<Map<String, Object>> usersCount() {
        try {
            Number n = (Number) em.createNativeQuery(
                    "select count(*) from public.users"   // ✅ 스키마 명시
            ).getSingleResult();

            return ResponseEntity.ok(Map.of("users_count", n.longValue())); // ✅ Number로 받아 안전 변환
        } catch (Exception e) {
            // 에러 메시지 같이 반환해서 원인 파악 쉽게
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getClass().getSimpleName(),
                    "message", e.getMessage()
            ));
        }
    }

}
