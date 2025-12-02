package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.Algorithm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Integer> {

    // definition NOT NULL 조회
    List<Algorithm> findByDefinitionIsNotNull();

    // algorithm_name 기준 알고리즘 조회
    Optional<Algorithm> findByAlgorithmName(String algorithmName);

}
