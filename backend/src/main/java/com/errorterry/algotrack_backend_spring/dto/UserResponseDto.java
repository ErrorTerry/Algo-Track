package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.SocialType;
import com.errorterry.algotrack_backend_spring.domain.User;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponseDto {

    private Integer userId;
    private String socialId;
    private SocialType socialType;
    private String nickname;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .socialId(user.getSocialId())
                .socialType(user.getSocialType())
                .nickname(user.getNickname())
                .build();
    }

}
