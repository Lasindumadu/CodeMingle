package com.example.codemingle_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.codemingle_backend.model.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    // all crud database methods
}
