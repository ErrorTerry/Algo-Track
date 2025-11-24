package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.SocialType;
import com.errorterry.algotrack_backend_spring.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {

    private Integer userId;
    private String socialId;
    private SocialType socialType;
    private String nickname;
    private String accessToken; // JWT

    public static LoginResponseDto of(User user, String token) {
        return LoginResponseDto.builder()
                .userId(user.getUserId())
                .socialId(user.getSocialId())
                .socialType(user.getSocialType())
                .nickname(user.getNickname())
                .accessToken(token)
                .build();
    }
}
