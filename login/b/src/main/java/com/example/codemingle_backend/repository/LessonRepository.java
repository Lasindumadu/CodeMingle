package com.example.codemingle_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.codemingle_backend.model.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    // all crud database methods

    List<Lesson> findByCourse_CourseId(Long courseId);
}
