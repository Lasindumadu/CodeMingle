package com.example.codemingle_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {

    private Long enrollmentId;
    private Long userId;
    private String userName;
    private Long courseId;
    private String courseName;
    private Long lessonId;
    private String enrollmentDate;
}
