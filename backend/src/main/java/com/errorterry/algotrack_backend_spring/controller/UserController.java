package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.dto.UserRequestDto;
import com.errorterry.algotrack_backend_spring.dto.UserResponseDto;
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
    public ResponseEntity<?> createUser(@RequestBody UserRequestDto requestDto) {
        try {
            UserResponseDto saved = userService.create(requestDto);
            return ResponseEntity
                    .created(URI.create("/api/users/" + saved.getUserId()))
                    .body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body("이미 존재하는 사용자입니다.");
        }
    }

    // socialId 기준 조회
    @GetMapping("/by-social/{socialId}")
    public ResponseEntity<?> getBySocialId(@PathVariable String socialId) {
        Optional<UserResponseDto> found = userService.findBySocialId(socialId);
        return found.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
