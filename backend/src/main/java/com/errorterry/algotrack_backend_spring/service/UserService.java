package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.User;
import com.errorterry.algotrack_backend_spring.dto.UserRequestDto;
import com.errorterry.algotrack_backend_spring.dto.UserResponseDto;
import com.errorterry.algotrack_backend_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 사용자 생성
    public UserResponseDto create(UserRequestDto requestDto) {
        User user = User.builder()
                .socialId(requestDto.getSocialId())
                .socialType(requestDto.getSocialType())
                .nickname(requestDto.getNickname())
                .build();

        User saved = userRepository.save(user);
        return UserResponseDto.from(saved);
    }

    // socialId 기준 조회
    public Optional<UserResponseDto> findBySocialId(String socialId) {
        return userRepository.findBySocialId(socialId)
                .map(UserResponseDto::from);
    }

}
