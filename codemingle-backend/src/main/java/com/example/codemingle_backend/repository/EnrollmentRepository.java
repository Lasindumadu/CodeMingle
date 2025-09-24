package com.example.codemingle_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.codemingle_backend.model.Enrollment;
import com.example.codemingle_backend.model.User;
import com.example.codemingle_backend.model.Course;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // all crud database methods

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.course LEFT JOIN FETCH e.lesson")
    List<Enrollment> findAllWithDetails();

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.course LEFT JOIN FETCH e.lesson WHERE e.enrollmentId = :id")
    Optional<Enrollment> findByIdWithDetails(Long id);

    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.user = :user AND e.course = :course")
    boolean existsByUserAndCourse(@Param("user") User user, @Param("course") Course course);

    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.user = :user AND e.course = :course AND e.enrollmentId != :enrollmentId")
    boolean existsByUserAndCourseAndEnrollmentIdNot(@Param("user") User user, @Param("course") Course course, @Param("enrollmentId") Long enrollmentId);

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.user LEFT JOIN FETCH e.course LEFT JOIN FETCH e.lesson WHERE e.user = :user")
    List<Enrollment> findByUser(@Param("user") User user);
}
