package com.example.codemingle_backend.controller;

import java.time.LocalDateTime;
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
import com.example.codemingle_backend.repository.CourseRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Course> getAllCourses(){
        return courseRepository.findAll();
    }

    // build create course REST API
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        if (course.getCreatedAt() == null) {
            course.setCreatedAt(LocalDateTime.now());
        }
        return courseRepository.save(course);
    }

    // build get course by id REST API
    @GetMapping("{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable  long id){
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id:" + id));
        return ResponseEntity.ok(course);
    }

    // build update course REST API
    @PutMapping("{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable long id,@RequestBody Course courseDetails) {
        Course updateCourse = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + id));

        if (courseDetails.getTitle() != null) {
            updateCourse.setTitle(courseDetails.getTitle());
        }
        if (courseDetails.getDescription() != null) {
            updateCourse.setDescription(courseDetails.getDescription());
        }
        if (courseDetails.getCreatedAt() != null) {
            updateCourse.setCreatedAt(courseDetails.getCreatedAt());
        }

        courseRepository.save(updateCourse);

        return ResponseEntity.ok(updateCourse);
    }

    // build delete course REST API
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteCourse(@PathVariable long id){

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + id));

        courseRepository.delete(course);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }
}
