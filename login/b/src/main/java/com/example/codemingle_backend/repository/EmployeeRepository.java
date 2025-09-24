package com.example.codemingle_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.codemingle_backend.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // all crud database methods
}