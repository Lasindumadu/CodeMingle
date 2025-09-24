package com.example.codemingle_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.codemingle_backend.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    // all crud database methods
}
