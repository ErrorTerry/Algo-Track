package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Integer> {

}
