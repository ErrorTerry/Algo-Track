package com.errorterry.algotrack_backend_spring.repository;

import com.errorterry.algotrack_backend_spring.domain.AlgorithmDictionary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlgorithmDictionaryRepository extends JpaRepository<AlgorithmDictionary, Integer> {

    // algorithm_id 기준 조회
    List<AlgorithmDictionary> findByAlgorithmAlgorithmId(Integer algorithmId);

}
