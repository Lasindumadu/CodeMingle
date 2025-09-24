package com.example.codemingle_backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
import com.example.codemingle_backend.model.Enrollment;
import com.example.codemingle_backend.model.EnrollmentDTO;
import com.example.codemingle_backend.model.Lesson;
import com.example.codemingle_backend.model.User;
import com.example.codemingle_backend.repository.CourseRepository;
import com.example.codemingle_backend.repository.EnrollmentRepository;
import com.example.codemingle_backend.repository.LessonRepository;
import com.example.codemingle_backend.repository.UserRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @GetMapping
    public List<EnrollmentDTO> getAllEnrollments(){
        return enrollmentRepository.findAllWithDetails().stream()
                .map(enrollment -> new EnrollmentDTO(
                        enrollment.getEnrollmentId(),
                        enrollment.getUser().getUserId(),
                        enrollment.getUser().getUsername(),
                        enrollment.getCourse().getCourseId(),
                        enrollment.getCourse().getTitle(),
                        enrollment.getLesson() != null ? enrollment.getLesson().getLessonId() : null,
                        enrollment.getEnrollmentDate().toLocalDate().toString()
                ))
                .collect(Collectors.toList());
    }

    // build create enrollment REST API
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @PostMapping
    public Enrollment createEnrollment(@RequestBody EnrollmentDTO enrollmentDTO) {
        User user = userRepository.findById(enrollmentDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + enrollmentDTO.getUserId()));

        Course course = courseRepository.findById(enrollmentDTO.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + enrollmentDTO.getCourseId()));

        // Check if enrollment already exists for this user and course
        if (enrollmentRepository.existsByUserAndCourse(user, course)) {
            throw new IllegalArgumentException("User already enrolled in this course");
        }

        Lesson lesson = null;
        if (enrollmentDTO.getLessonId() != null) {
            lesson = lessonRepository.findById(enrollmentDTO.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + enrollmentDTO.getLessonId()));
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setLesson(lesson);

        if (enrollmentDTO.getEnrollmentDate() == null || enrollmentDTO.getEnrollmentDate().isEmpty()) {
            enrollment.setEnrollmentDate(LocalDateTime.now());
        } else {
            enrollment.setEnrollmentDate(LocalDate.parse(enrollmentDTO.getEnrollmentDate()).atStartOfDay());
        }

        return enrollmentRepository.save(enrollment);
    }

    // build get enrollment by id REST API
    @GetMapping("{id}")
    public ResponseEntity<EnrollmentDTO> getEnrollmentById(@PathVariable  long id){
        Enrollment enrollment = enrollmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not exist with id:" + id));
        EnrollmentDTO dto = new EnrollmentDTO(
                enrollment.getEnrollmentId(),
                enrollment.getUser().getUserId(),
                enrollment.getUser().getUsername(),
                enrollment.getCourse().getCourseId(),
                enrollment.getCourse().getTitle(),
                enrollment.getLesson() != null ? enrollment.getLesson().getLessonId() : null,
                enrollment.getEnrollmentDate().toLocalDate().toString()
        );
        return ResponseEntity.ok(dto);
    }

    // build update enrollment REST API
    @PutMapping("{id}")
    public ResponseEntity<Enrollment> updateEnrollment(@PathVariable long id,@RequestBody EnrollmentDTO enrollmentDTO) {
        Enrollment updateEnrollment = enrollmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not exist with id: " + id));

        User newUser = updateEnrollment.getUser();
        Course newCourse = updateEnrollment.getCourse();

        if (enrollmentDTO.getUserId() != null) {
            newUser = userRepository.findById(enrollmentDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + enrollmentDTO.getUserId()));
        }

        if (enrollmentDTO.getCourseId() != null) {
            newCourse = courseRepository.findById(enrollmentDTO.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + enrollmentDTO.getCourseId()));
        }

        // Check if the new user-course combination already exists (excluding this enrollment)
        if (enrollmentRepository.existsByUserAndCourseAndEnrollmentIdNot(newUser, newCourse, id)) {
            throw new IllegalArgumentException("User already enrolled in this course");
        }

        updateEnrollment.setUser(newUser);
        updateEnrollment.setCourse(newCourse);

        if (enrollmentDTO.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(enrollmentDTO.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + enrollmentDTO.getLessonId()));
            updateEnrollment.setLesson(lesson);
        } else {
            updateEnrollment.setLesson(null);
        }

        if (enrollmentDTO.getEnrollmentDate() != null && !enrollmentDTO.getEnrollmentDate().isEmpty()) {
            updateEnrollment.setEnrollmentDate(LocalDate.parse(enrollmentDTO.getEnrollmentDate()).atStartOfDay());
        }

        enrollmentRepository.save(updateEnrollment);

        return ResponseEntity.ok(updateEnrollment);
    }

    // build delete enrollment REST API
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteEnrollment(@PathVariable long id){

        Enrollment enrollment = enrollmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not exist with id: " + id));

        enrollmentRepository.delete(enrollment);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

    // Check if user is enrolled in a course
    @GetMapping("/check/{userId}/{courseId}")
    public ResponseEntity<Boolean> checkUserEnrollment(@PathVariable Long userId, @PathVariable Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + userId));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not exist with id: " + courseId));
        
        boolean isEnrolled = enrollmentRepository.existsByUserAndCourse(user, course);
        return ResponseEntity.ok(isEnrolled);
    }

    // Get enrollments for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EnrollmentDTO>> getUserEnrollments(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + userId));
        
        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
        List<EnrollmentDTO> enrollmentDTOs = enrollments.stream()
                .map(enrollment -> new EnrollmentDTO(
                        enrollment.getEnrollmentId(),
                        enrollment.getUser().getUserId(),
                        enrollment.getUser().getUsername(),
                        enrollment.getCourse().getCourseId(),
                        enrollment.getCourse().getTitle(),
                        enrollment.getLesson() != null ? enrollment.getLesson().getLessonId() : null,
                        enrollment.getEnrollmentDate().toLocalDate().toString()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(enrollmentDTOs);
    }
}
