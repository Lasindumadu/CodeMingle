package com.example.codemingle_backend.model;

import java.time.LocalDateTime;

public class CourseDTO {
    private Long courseId;
    private String title;
    private String description;
    private String category;
    private LocalDateTime createdAt;

    public CourseDTO() {}

    public CourseDTO(Long courseId, String title, String description, String category, LocalDateTime createdAt) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.createdAt = createdAt;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
