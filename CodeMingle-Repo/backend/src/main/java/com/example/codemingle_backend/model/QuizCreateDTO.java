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
public class QuizCreateDTO {
    private Long lessonId;
    private String title;
    private String description;
    private Boolean shuffleQuestions;
    private Integer timeLimitMinutes;
    private List<QuestionCreateDTO> questions;
}
