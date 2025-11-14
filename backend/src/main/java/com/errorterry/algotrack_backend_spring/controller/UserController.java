package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.domain.User;
import com.errorterry.algotrack_backend_spring.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 사용자 생성
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User saved = userService.create(user);
            return ResponseEntity
                    .created(URI.create("/api/users/" + saved.getUserId()))
                    .body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body("이미 존재하는 social_id 입니다.");
        }
    }

    // 소셜 ID로 조회
    @GetMapping("/by-social/{socialId}")
    public ResponseEntity<?> getBySocialId(@PathVariable String socialId) {
        Optional<User> found = userService.findBySocialId(socialId);
        return found.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
