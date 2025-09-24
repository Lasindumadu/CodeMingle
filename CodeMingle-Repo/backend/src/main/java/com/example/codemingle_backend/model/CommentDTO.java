package com.example.codemingle_backend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private Long commentId;
    private Long userId;
    private String userName;
    private Long lessonId;
    private String lessonTitle;
    private Long courseId;
    private String courseTitle;
    private String content;
    private String createdAt;
}
