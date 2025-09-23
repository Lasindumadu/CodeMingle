package com.example.codemingle_backend.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private Long quizId;
    private String title;
    private String description;
    private Long lessonId;
    private Boolean shuffleQuestions;
    private Integer timeLimitMinutes;
    private List<QuestionDTO> questions;
}
