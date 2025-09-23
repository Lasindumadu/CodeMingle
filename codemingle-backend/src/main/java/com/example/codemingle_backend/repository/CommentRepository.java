package com.example.codemingle_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.codemingle_backend.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // all crud database methods

    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.lesson l LEFT JOIN FETCH l.course")
    List<Comment> findAllWithDetails();
}
