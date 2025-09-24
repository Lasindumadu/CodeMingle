package com.example.codemingle_backend.model;

import java.time.LocalDateTime;

public class LessonDTO {
    private Long lessonId;
    private String title;
    private String topic;
    private String content;
    private LocalDateTime createdAt;
    private Long courseId;
    private String courseTitle;

    public LessonDTO() {}

    public LessonDTO(Long lessonId, String title, String topic, String content, LocalDateTime createdAt, Long courseId, String courseTitle) {
        this.lessonId = lessonId;
        this.title = title;
        this.topic = topic;
        this.content = content;
        this.createdAt = createdAt;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
    }

    // Getters and setters
    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }
}
