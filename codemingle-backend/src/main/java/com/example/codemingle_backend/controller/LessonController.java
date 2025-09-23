
package com.example.codemingle_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.codemingle_backend.exception.ResourceNotFoundException;
import com.example.codemingle_backend.model.Course;
import com.example.codemingle_backend.model.Lesson;
import com.example.codemingle_backend.model.LessonDTO;
import com.example.codemingle_backend.repository.CourseRepository;
import com.example.codemingle_backend.repository.LessonRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/lessons")
public class LessonController {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<LessonDTO> getAllLessons(){
        List<Lesson> lessons = lessonRepository.findAll();
        return lessons.stream().map(lesson -> new LessonDTO(
            lesson.getLessonId(),
            lesson.getTitle(),
            lesson.getTopic(),
            lesson.getContent(),
            lesson.getCreatedAt(),
            lesson.getCourse() != null ? lesson.getCourse().getCourseId() : null,
            lesson.getCourse() != null ? lesson.getCourse().getTitle() : null
        )).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public Lesson createLesson(@RequestBody Lesson lesson) {
        if (lesson.getCreatedAt() == null) {
            lesson.setCreatedAt(java.time.LocalDateTime.now());
        }
        if (lesson.getCourse() != null && lesson.getCourse().getCourseId() != null) {
            Course course = courseRepository.findById(lesson.getCourse().getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + lesson.getCourse().getCourseId()));
            lesson.setCourse(course);
        }
        return lessonRepository.save(lesson);
    }

    @GetMapping("{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable  long id){
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id:" + id));
        LessonDTO lessonDTO = new LessonDTO(
            lesson.getLessonId(),
            lesson.getTitle(),
            lesson.getTopic(),
            lesson.getContent(),
            lesson.getCreatedAt(),
            lesson.getCourse() != null ? lesson.getCourse().getCourseId() : null,
            lesson.getCourse() != null ? lesson.getCourse().getTitle() : null
        );
        return ResponseEntity.ok(lessonDTO);
    }

    @PutMapping("{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable long id,@RequestBody LessonDTO lessonDetails) {
        Lesson updateLesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + id));

        // Update course if provided
        if (lessonDetails.getCourseId() != null) {
            Course course = courseRepository.findById(lessonDetails.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + lessonDetails.getCourseId()));
            updateLesson.setCourse(course);
        }

        // Update title if provided and not empty
        if (lessonDetails.getTitle() != null && !lessonDetails.getTitle().trim().isEmpty()) {
            updateLesson.setTitle(lessonDetails.getTitle().trim());
        }

        // Update topic if provided and not empty
        if (lessonDetails.getTopic() != null && !lessonDetails.getTopic().trim().isEmpty()) {
            updateLesson.setTopic(lessonDetails.getTopic().trim());
        }

        // Update content if provided
        if (lessonDetails.getContent() != null) {
            updateLesson.setContent(lessonDetails.getContent());
        }

        // Don't update createdAt - it should remain as original creation time

        Lesson savedLesson = lessonRepository.save(updateLesson);

        // Return updated lesson as DTO
        LessonDTO responseDTO = new LessonDTO(
            savedLesson.getLessonId(),
            savedLesson.getTitle(),
            savedLesson.getTopic(),
            savedLesson.getContent(),
            savedLesson.getCreatedAt(),
            savedLesson.getCourse() != null ? savedLesson.getCourse().getCourseId() : null,
            savedLesson.getCourse() != null ? savedLesson.getCourse().getTitle() : null
        );

        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/course/{courseId}")
    public List<LessonDTO> getLessonsByCourseId(@PathVariable long courseId){
        List<Lesson> lessons = lessonRepository.findByCourse_CourseId(courseId);
        return lessons.stream().map(lesson -> new LessonDTO(
            lesson.getLessonId(),
            lesson.getTitle(),
            lesson.getTopic(),
            lesson.getContent(),
            lesson.getCreatedAt(),
            lesson.getCourse() != null ? lesson.getCourse().getCourseId() : null,
            lesson.getCourse() != null ? lesson.getCourse().getTitle() : null
        )).collect(java.util.stream.Collectors.toList());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteLesson(@PathVariable long id){

        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + id));

        lessonRepository.delete(lesson);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }
}
