package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_social_id", columnNames = "social_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@DynamicInsert
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "social_id", nullable = false, length = 100)
    private String socialId;

    @Convert(converter = SocialTypeConverter.class)
    @Column(
            name = "social_type",
            nullable = false,
            columnDefinition = "text default 'kakao' check (social_type in ('kakao'))"
    )
    private SocialType socialType;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

}
