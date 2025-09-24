package com.example.codemingle_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.codemingle_backend.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // all crud database methods
    Optional<User> findByUsername(String username);
}
