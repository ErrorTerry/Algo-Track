package com.errorterry.algotrack_backend_spring.service;

import com.errorterry.algotrack_backend_spring.domain.User;
import com.errorterry.algotrack_backend_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User create(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findBySocialId(String socialId) {
        return userRepository.findBySocialId(socialId);
    }

}
