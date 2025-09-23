package com.example.codemingle_backend.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import com.example.codemingle_backend.model.Comment;
import com.example.codemingle_backend.model.CommentCreateDTO;
import com.example.codemingle_backend.model.CommentDTO;
import com.example.codemingle_backend.model.Lesson;
import com.example.codemingle_backend.model.User;
import com.example.codemingle_backend.repository.CommentRepository;
import com.example.codemingle_backend.repository.LessonRepository;
import com.example.codemingle_backend.repository.UserRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping
    public List<CommentDTO> getAllComments(){
        List<Comment> comments = commentRepository.findAllWithDetails();
        return comments.stream().map(comment -> new CommentDTO(
            comment.getCommentId(),
            comment.getUser().getUserId(),
            comment.getUser().getUsername(),
            comment.getLesson().getLessonId(),
            comment.getLesson().getTitle(),
            comment.getLesson().getCourse().getCourseId(),
            comment.getLesson().getCourse().getTitle(),
            comment.getContent(),
            comment.getCreatedAt().format(formatter)
        )).collect(Collectors.toList());
    }

    // build create comment REST API
    @PostMapping
    public CommentDTO createComment(@RequestBody CommentCreateDTO commentCreateDTO) {
        Comment comment = new Comment();
        comment.setContent(commentCreateDTO.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());

        // Fetch user and lesson from database
        User user = userRepository.findById(commentCreateDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + commentCreateDTO.getUserId()));
        comment.setUser(user);

        Lesson lesson = lessonRepository.findById(commentCreateDTO.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + commentCreateDTO.getLessonId()));
        comment.setLesson(lesson);

        Comment savedComment = commentRepository.save(comment);

        // Return as DTO
        return new CommentDTO(
            savedComment.getCommentId(),
            savedComment.getUser().getUserId(),
            savedComment.getUser().getUsername(),
            savedComment.getLesson().getLessonId(),
            savedComment.getLesson().getTitle(),
            savedComment.getLesson().getCourse().getCourseId(),
            savedComment.getLesson().getCourse().getTitle(),
            savedComment.getContent(),
            savedComment.getCreatedAt().format(formatter)
        );
    }

    // build get comment by id REST API
    @GetMapping("{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable  long id){
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not exist with id:" + id));
        CommentDTO commentDTO = new CommentDTO(
                comment.getCommentId(),
                comment.getUser().getUserId(),
                comment.getUser().getUsername(),
                comment.getLesson().getLessonId(),
                comment.getLesson().getTitle(),
                comment.getLesson().getCourse().getCourseId(),
                comment.getLesson().getCourse().getTitle(),
                comment.getContent(),
                comment.getCreatedAt().format(formatter)
        );
        return ResponseEntity.ok(commentDTO);
    }

    // build update comment REST API
    @PutMapping("{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable long id,@RequestBody Comment commentDetails) {
        Comment updateComment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not exist with id: " + id));

        // Update content if provided and not empty
        if (commentDetails.getContent() != null && !commentDetails.getContent().trim().isEmpty()) {
            updateComment.setContent(commentDetails.getContent().trim());
        }

        // Update user if provided
        if (commentDetails.getUser() != null && commentDetails.getUser().getUserId() != null) {
            User user = userRepository.findById(commentDetails.getUser().getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not exist with id: " + commentDetails.getUser().getUserId()));
            updateComment.setUser(user);
        }

        // Update lesson if provided
        if (commentDetails.getLesson() != null && commentDetails.getLesson().getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(commentDetails.getLesson().getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + commentDetails.getLesson().getLessonId()));
            updateComment.setLesson(lesson);
        }

        // Don't update createdAt - it should remain as original creation time

        Comment savedComment = commentRepository.save(updateComment);

        // Return updated comment as DTO
        CommentDTO responseDTO = new CommentDTO(
            savedComment.getCommentId(),
            savedComment.getUser().getUserId(),
            savedComment.getUser().getUsername(),
            savedComment.getLesson().getLessonId(),
            savedComment.getLesson().getTitle(),
            savedComment.getLesson().getCourse().getCourseId(),
            savedComment.getLesson().getCourse().getTitle(),
            savedComment.getContent(),
            savedComment.getCreatedAt().format(formatter)
        );

        return ResponseEntity.ok(responseDTO);
    }

    // build delete comment REST API
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteComment(@PathVariable long id){

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not exist with id: " + id));

        commentRepository.delete(comment);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }
}
