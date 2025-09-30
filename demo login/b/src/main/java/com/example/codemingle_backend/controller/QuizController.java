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
import com.example.codemingle_backend.model.Lesson;
import com.example.codemingle_backend.model.Question;
import com.example.codemingle_backend.model.QuestionCreateDTO;
import com.example.codemingle_backend.model.QuestionDTO;
import com.example.codemingle_backend.model.Quiz;
import com.example.codemingle_backend.model.QuizCreateDTO;
import com.example.codemingle_backend.model.QuizDTO;
import com.example.codemingle_backend.repository.LessonRepository;
import com.example.codemingle_backend.repository.QuestionRepository;
import com.example.codemingle_backend.repository.QuizRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public List<QuizDTO> getAllQuizzes(){
        List<Quiz> quizzes = quizRepository.findAllWithQuestions();
        return quizzes.stream().map(quiz -> {
            List<QuestionDTO> questionDTOs = quiz.getQuestions() != null ?
                quiz.getQuestions().stream().map(q -> new QuestionDTO(
                    q.getQuestionId(),
                    q.getQuizId(),
                    q.getQuestionText(),
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD(),
                    q.getCorrectAnswer(),
                    q.getQuestionOrder()
                )).toList() : new java.util.ArrayList<>();

            return new QuizDTO(
                quiz.getQuizId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getLessonId(),
                quiz.getShuffleQuestions(),
                quiz.getTimeLimitMinutes(),
                questionDTOs
            );
        }).toList();
    }

    // build create quiz REST API
    @PostMapping
    public QuizDTO createQuiz(@RequestBody QuizCreateDTO quizCreateDTO) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizCreateDTO.getTitle());
        quiz.setDescription(quizCreateDTO.getDescription());
        quiz.setShuffleQuestions(quizCreateDTO.getShuffleQuestions() != null ? quizCreateDTO.getShuffleQuestions() : false);
        quiz.setTimeLimitMinutes(quizCreateDTO.getTimeLimitMinutes() != null ? quizCreateDTO.getTimeLimitMinutes() : 30);
        quiz.setCreatedAt(LocalDateTime.now());

        // Fetch the lesson to ensure it exists
        Lesson lesson = lessonRepository.findById(quizCreateDTO.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + quizCreateDTO.getLessonId()));
        quiz.setLesson(lesson);

        Quiz savedQuiz = quizRepository.save(quiz);

        // Save questions if any
        if (quizCreateDTO.getQuestions() != null) {
            for (QuestionCreateDTO qdto : quizCreateDTO.getQuestions()) {
                Question question = new Question();
                question.setQuiz(savedQuiz);
                question.setQuestionText(qdto.getQuestionText());
                question.setOptionA(qdto.getOptionA());
                question.setOptionB(qdto.getOptionB());
                question.setOptionC(qdto.getOptionC());
                question.setOptionD(qdto.getOptionD());
                question.setCorrectAnswer(qdto.getCorrectAnswer());
                question.setQuestionOrder(qdto.getQuestionOrder());
                questionRepository.save(question);
            }
        }

        // Fetch the quiz with questions to return complete data
        Quiz quizWithQuestions = quizRepository.findByIdWithQuestions(savedQuiz.getQuizId())
                .orElse(savedQuiz);

        List<QuestionDTO> questionDTOs = quizWithQuestions.getQuestions() != null ?
            quizWithQuestions.getQuestions().stream().map(q -> new QuestionDTO(
                q.getQuestionId(),
                q.getQuizId(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getCorrectAnswer(),
                q.getQuestionOrder()
            )).toList() : new java.util.ArrayList<>();

        return new QuizDTO(
            quizWithQuestions.getQuizId(),
            quizWithQuestions.getTitle(),
            quizWithQuestions.getDescription(),
            quizWithQuestions.getLessonId(),
            quizWithQuestions.getShuffleQuestions(),
            quizWithQuestions.getTimeLimitMinutes(),
            questionDTOs
        );
    }

    // build get quiz by id REST API
    @GetMapping("{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable  long id){
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not exist with id:" + id));

        List<QuestionDTO> questionDTOs = quiz.getQuestions() != null ?
            quiz.getQuestions().stream().map(q -> new QuestionDTO(
                q.getQuestionId(),
                q.getQuizId(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getCorrectAnswer(),
                q.getQuestionOrder()
            )).toList() : new java.util.ArrayList<>();

        QuizDTO quizDTO = new QuizDTO(
            quiz.getQuizId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getLessonId(),
            quiz.getShuffleQuestions(),
            quiz.getTimeLimitMinutes(),
            questionDTOs
        );
        return ResponseEntity.ok(quizDTO);
    }

    // build update quiz REST API
    @PutMapping("{id}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable long id,@RequestBody QuizCreateDTO quizDetails) {
        Quiz updateQuiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not exist with id: " + id));

        if (quizDetails.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(quizDetails.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + quizDetails.getLessonId()));
            updateQuiz.setLesson(lesson);
        }
        if (quizDetails.getTitle() != null) {
            updateQuiz.setTitle(quizDetails.getTitle());
        }
        if (quizDetails.getDescription() != null) {
            updateQuiz.setDescription(quizDetails.getDescription());
        }
        if (quizDetails.getShuffleQuestions() != null) {
            updateQuiz.setShuffleQuestions(quizDetails.getShuffleQuestions());
        }
        if (quizDetails.getTimeLimitMinutes() != null) {
            updateQuiz.setTimeLimitMinutes(quizDetails.getTimeLimitMinutes());
        }

        // Update questions if provided
        if (quizDetails.getQuestions() != null) {
            // Remove existing questions
            List<Question> existingQuestions = updateQuiz.getQuestions();
            if (existingQuestions != null) {
                questionRepository.deleteAll(existingQuestions);
                updateQuiz.getQuestions().clear();
            }
            // Add new questions
            for (QuestionCreateDTO qdto : quizDetails.getQuestions()) {
                Question question = new Question();
                question.setQuiz(updateQuiz);
                question.setQuestionText(qdto.getQuestionText());
                question.setOptionA(qdto.getOptionA());
                question.setOptionB(qdto.getOptionB());
                question.setOptionC(qdto.getOptionC());
                question.setOptionD(qdto.getOptionD());
                question.setCorrectAnswer(qdto.getCorrectAnswer());
                question.setQuestionOrder(qdto.getQuestionOrder());
                questionRepository.save(question);
            }
        }

        Quiz savedQuiz = quizRepository.save(updateQuiz);

        // Fetch the updated quiz with questions
        Quiz quizWithQuestions = quizRepository.findByIdWithQuestions(savedQuiz.getQuizId())
                .orElse(savedQuiz);

        List<QuestionDTO> questionDTOs = quizWithQuestions.getQuestions() != null ?
            quizWithQuestions.getQuestions().stream().map(q -> new QuestionDTO(
                q.getQuestionId(),
                q.getQuizId(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getCorrectAnswer(),
                q.getQuestionOrder()
            )).toList() : new java.util.ArrayList<>();

        QuizDTO responseDTO = new QuizDTO(
            quizWithQuestions.getQuizId(),
            quizWithQuestions.getTitle(),
            quizWithQuestions.getDescription(),
            quizWithQuestions.getLessonId(),
            quizWithQuestions.getShuffleQuestions(),
            quizWithQuestions.getTimeLimitMinutes(),
            questionDTOs
        );

        return ResponseEntity.ok(responseDTO);
    }

    // build delete quiz REST API
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteQuiz(@PathVariable long id){

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not exist with id: " + id));

        quizRepository.delete(quiz);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

    // build get quizzes by lesson id REST API
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<QuizDTO>> getQuizzesByLessonId(@PathVariable long lessonId){
        // Verify lesson exists
        lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not exist with id: " + lessonId));

        List<Quiz> quizzes = quizRepository.findByLessonId(lessonId);

        List<QuizDTO> quizDTOs = quizzes.stream().map(quiz -> {
            List<QuestionDTO> questionDTOs = quiz.getQuestions() != null ?
                quiz.getQuestions().stream().map(q -> new QuestionDTO(
                    q.getQuestionId(),
                    q.getQuizId(),
                    q.getQuestionText(),
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD(),
                    q.getCorrectAnswer(),
                    q.getQuestionOrder()
                )).toList() : new java.util.ArrayList<>();

            return new QuizDTO(
                quiz.getQuizId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getLessonId(),
                quiz.getShuffleQuestions(),
                quiz.getTimeLimitMinutes(),
                questionDTOs
            );
        }).toList();

        return ResponseEntity.ok(quizDTOs);
    }
}
