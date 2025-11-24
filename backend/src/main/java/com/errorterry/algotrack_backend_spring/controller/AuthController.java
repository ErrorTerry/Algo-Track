package com.errorterry.algotrack_backend_spring.controller;

import com.errorterry.algotrack_backend_spring.domain.User;
import com.errorterry.algotrack_backend_spring.dto.LoginResponseDto;
import com.errorterry.algotrack_backend_spring.dto.UserRequestDto;
import com.errorterry.algotrack_backend_spring.service.UserService;
import com.errorterry.algotrack_backend_spring.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // 카카오 로그인 이후 FE에서 socialId, nickname, socialType 보내주면 여기서 처리
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody UserRequestDto requestDto) {

        // 1) 유저 찾거나 없으면 생성
        User user = userService.findOrCreate(requestDto);

        // 2) JWT 발급
        String token = jwtUtil.generateToken(user.getUserId(), user.getSocialId());

        // 3) 유저 정보 + 토큰 리턴
        LoginResponseDto response = LoginResponseDto.of(user, token);

        return ResponseEntity.ok(response);
    }
}
