package com.errorterry.algotrack_backend_spring.dto;

import com.errorterry.algotrack_backend_spring.domain.SocialType;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserRequestDto {

    private String socialId;
    private SocialType socialType;
    private String nickname;

}
