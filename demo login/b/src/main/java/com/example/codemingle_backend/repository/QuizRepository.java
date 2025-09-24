package com.example.codemingle_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.codemingle_backend.model.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.quizId = :quizId")
    Optional<Quiz> findByIdWithQuestions(@Param("quizId") Long quizId);

    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions")
    java.util.List<Quiz> findAllWithQuestions();
}
