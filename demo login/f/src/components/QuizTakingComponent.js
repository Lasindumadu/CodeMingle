import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import QuizService from '../services/QuizService'
import PdfService from '../services/PdfService'
import './QuizTakingComponent.css'

const QuizTakingComponent = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [quiz, setQuiz] = useState(null)
    const [answers, setAnswers] = useState({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [shuffledQuestions, setShuffledQuestions] = useState([])
    const [showAnswers, setShowAnswers] = useState(false)
    const [quizStarted, setQuizStarted] = useState(false)

    useEffect(() => {
        if (id) {
            fetchQuiz()
        }
    }, [id])

    useEffect(() => {
        if (quiz && quiz.questions) {
            // Shuffle questions if enabled
            const questions = [...quiz.questions]
            if (quiz.shuffleQuestions) {
                questions.sort(() => Math.random() - 0.5)
            }
            setShuffledQuestions(questions.sort((a, b) => a.questionOrder - b.questionOrder))
            setTotalQuestions(questions.length)
            
            // Set timer based on quiz time limit (convert minutes to seconds)
            const timeLimitSeconds = (quiz.timeLimitMinutes || 30) * 60
            setTimeLeft(timeLimitSeconds)
            
            // CRITICAL: Ensure showAnswers is false when quiz loads
            setShowAnswers(false)
            setIsSubmitted(false)
        }
    }, [quiz])

    // CRITICAL: Ensure showAnswers is false when quiz starts
    useEffect(() => {
        if (quizStarted && !isSubmitted) {
            setShowAnswers(false)
        }
    }, [quizStarted, isSubmitted])

    useEffect(() => {
        let timer
        if (timeLeft > 0 && !isSubmitted) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit()
        }
        return () => clearInterval(timer)
    }, [timeLeft, isSubmitted])

    const fetchQuiz = async () => {
        try {
            setIsLoading(true)
            const response = await QuizService.getQuizById(id)
            setQuiz(response.data)
            setQuizStarted(false) // Ensure quiz doesn't start automatically
        } catch (error) {
            console.error('Error fetching quiz:', error)
            setError('Failed to load quiz. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    const calculateScore = () => {
        let correctAnswers = 0
        shuffledQuestions.forEach(question => {
            if (answers[question.questionId] === question.correctAnswer) {
                correctAnswers++
            }
        })
        return correctAnswers
    }

    const handleSubmit = () => {
        if (isSubmitted || !quiz) return
        
        const calculatedScore = calculateScore()
        setScore(calculatedScore)
        setIsSubmitted(true)
        setShowAnswers(true)
        
        // Save quiz completion data to localStorage
        const completionData = {
            quizId: quiz.quizId,
            title: quiz.title,
            score: calculatedScore,
            totalQuestions: totalQuestions,
            percentage: Math.round((calculatedScore / totalQuestions) * 100),
            grade: getGrade(),
            completedAt: new Date().toISOString(),
            answers: answers
        }
        
        // Get existing completions or create new array
        const existingCompletions = JSON.parse(localStorage.getItem('quizCompletions') || '[]')
        
        // Remove any existing completion for this quiz
        const filteredCompletions = existingCompletions.filter(comp => comp.quizId !== quiz.quizId)
        
        // Add new completion
        filteredCompletions.push(completionData)
        
        // Save back to localStorage
        localStorage.setItem('quizCompletions', JSON.stringify(filteredCompletions))
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const getScoreColor = () => {
        if (totalQuestions === 0) return 'text-danger'
        const percentage = (score / totalQuestions) * 100
        if (percentage >= 80) return 'text-success'
        if (percentage >= 60) return 'text-warning'
        return 'text-danger'
    }

    const getScoreMessage = () => {
        if (totalQuestions === 0) return 'Keep studying! Practice makes perfect!'
        const percentage = (score / totalQuestions) * 100
        if (percentage >= 90) return 'Excellent! Outstanding performance!'
        if (percentage >= 80) return 'Great job! Well done!'
        if (percentage >= 70) return 'Good work! Keep it up!'
        if (percentage >= 60) return 'Not bad! You can do better!'
        return 'Keep studying! Practice makes perfect!'
    }

    const getGrade = () => {
        if (totalQuestions === 0) return 'F'
        const percentage = (score / totalQuestions) * 100
        if (percentage >= 90) return 'A+'
        if (percentage >= 85) return 'A'
        if (percentage >= 80) return 'A-'
        if (percentage >= 75) return 'B+'
        if (percentage >= 70) return 'B'
        if (percentage >= 65) return 'B-'
        if (percentage >= 60) return 'C+'
        if (percentage >= 55) return 'C'
        if (percentage >= 50) return 'C-'
        if (percentage >= 45) return 'D+'
        if (percentage >= 40) return 'D'
        return 'F'
    }

    const handleDownloadPDF = () => {
        if (quiz && shuffledQuestions.length > 0) {
            PdfService.downloadQuizResults(quiz, shuffledQuestions, answers, score, totalQuestions)
        }
    }

    if (isLoading) {
        return (
            <div className="quiz-container">
                <div className="container">
                    <div className="quiz-loading text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4>Loading Quiz...</h4>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="quiz-container">
                <div className="container">
                    <div className="quiz-error text-center py-5">
                        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h4>Error Loading Quiz</h4>
                        <p className="text-muted">{error}</p>
                        <Link to="/quizzes" className="btn btn-primary">
                            <i className="fas fa-arrow-left me-2"></i>Back to Quizzes
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="quiz-container">
                <div className="container">
                    <div className="quiz-not-found text-center py-5">
                        <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                        <h4>Quiz Not Found</h4>
                        <p className="text-muted">The quiz you're looking for doesn't exist.</p>
                        <Link to="/quizzes" className="btn btn-primary">
                            <i className="fas fa-arrow-left me-2"></i>Back to Quizzes
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Show quiz start screen
    if (quiz && !quizStarted) {
        return (
            <div className="quiz-container">
                <div className="container">
                    <div className="quiz-start-screen text-center py-5">
                        <div className="quiz-start-card">
                            <div className="quiz-start-header">
                                <i className="fas fa-brain fa-4x text-primary mb-4"></i>
                                <h1 className="quiz-start-title">{quiz.title}</h1>
                                <p className="quiz-start-description">{quiz.description}</p>
                            </div>
                            
                            <div className="quiz-start-info">
                                <div className="info-item">
                                    <i className="fas fa-question-circle me-2"></i>
                                    <span><strong>Questions:</strong> {totalQuestions}</span>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-clock me-2"></i>
                                    <span><strong>Time Limit:</strong> {quiz.timeLimitMinutes || 30} minutes</span>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-random me-2"></i>
                                    <span><strong>Question Order:</strong> {quiz.shuffleQuestions ? 'Randomized' : 'Sequential'}</span>
                                </div>
                            </div>

                            <div className="quiz-start-rules">
                                <h5>Quiz Rules:</h5>
                                <ul className="rules-list">
                                    <li>You have {quiz.timeLimitMinutes || 30} minutes to complete the quiz</li>
                                    <li>Answer all questions before submitting</li>
                                    <li>You can change your answers before submitting</li>
                                    <li>Once submitted, you cannot change your answers</li>
                                    <li>Your score will be shown after submission</li>
                                </ul>
                            </div>

                            <div className="quiz-start-actions">
                                <Link to="/quizzes" className="btn btn-outline-secondary me-3">
                                    <i className="fas fa-arrow-left me-2"></i>Back to Quizzes
                                </Link>
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setQuizStarted(true)}
                                >
                                    <i className="fas fa-play me-2"></i>Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Only show quiz interface if quiz is loaded AND started
    if (!quiz || !quizStarted) {
        return null
    }

    return (
        <div className="quiz-container">
            <div className="container">
                {/* Quiz Header */}
                <div className="quiz-header">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="quiz-title">
                                <i className="fas fa-brain me-2"></i>
                                {quiz.title}
                            </h1>
                            <p className="quiz-description">{quiz.description}</p>
                        </div>
                        <div className="col-md-4 text-end">
                            {!isSubmitted && (
                                <div className="quiz-timer">
                                    <i className="fas fa-clock me-2"></i>
                                    <span className={`timer-display ${timeLeft < 300 ? 'text-danger' : ''}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quiz Progress */}
                {!isSubmitted && (
                    <div className="quiz-progress mb-4">
                        <div className="progress">
                            <div 
                                className="progress-bar" 
                                style={{ 
                                    width: `${(Object.keys(answers).length / totalQuestions) * 100}%` 
                                }}
                            ></div>
                        </div>
                        <small className="text-muted">
                            {Object.keys(answers).length} of {totalQuestions} questions answered
                        </small>
                    </div>
                )}

                {/* Quiz Results */}
                {isSubmitted && showAnswers && (
                    <div className="quiz-results mb-4">
                        <div className="result-card">
                            <div className="result-header">
                                <i className="fas fa-trophy fa-2x text-warning mb-3"></i>
                                <h2 className="result-title">Quiz Completed!</h2>
                            </div>
                            <div className="result-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Score:</span>
                                    <span className={`stat-value ${getScoreColor()}`}>
                                        {score}/{totalQuestions}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Percentage:</span>
                                    <span className={`stat-value ${getScoreColor()}`}>
                                        {Math.round((score / totalQuestions) * 100)}%
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Grade:</span>
                                    <span className={`stat-value ${getScoreColor()}`}>
                                        {getGrade()}
                                    </span>
                                </div>
                            </div>
                            <div className="result-message">
                                <p className={getScoreColor()}>{getScoreMessage()}</p>
                            </div>
                            <div className="result-actions mt-4">
                                <button 
                                    className="btn btn-success me-3"
                                    onClick={handleDownloadPDF}
                                >
                                    <i className="fas fa-download me-2"></i>
                                    Download Results PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quiz Questions */}
                <div className="quiz-questions">
                    {shuffledQuestions.map((question, index) => (
                        <div key={question.questionId} className="question-card">
                            <div className="question-header">
                                <h3 className="question-number">
                                    Question {index + 1} of {totalQuestions}
                                </h3>
                                {isSubmitted && showAnswers && (
                                    <div className={`question-status ${answers[question.questionId] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                                        {answers[question.questionId] === question.correctAnswer ? (
                                            <i className="fas fa-check-circle text-success"></i>
                                        ) : (
                                            <i className="fas fa-times-circle text-danger"></i>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="question-content">
                                <p className="question-text">{question.questionText}</p>
                                
                                <div className="options-container">
                                    {['A', 'B', 'C', 'D'].map(option => {
                                        const optionText = question[`option${option}`]
                                        const isSelected = answers[question.questionId] === option
                                        const isCorrect = question.correctAnswer === option
                                        
                                        const isWrong = isSubmitted && showAnswers && isSelected && !isCorrect
                                        const showCorrectAnswer = isSubmitted && showAnswers && isCorrect
                                        const showWrongAnswer = isSubmitted && showAnswers && isSelected && !isCorrect
                                        
                                        // Determine CSS classes based on state
                                        let optionClasses = 'option-item'
                                        if (isSelected) {
                                            optionClasses += ' selected'
                                        }
                                        if (isSubmitted && showAnswers) {
                                            if (isCorrect) {
                                                optionClasses += ' correct'
                                            } else if (isWrong) {
                                                optionClasses += ' incorrect'
                                            }
                                        }
                                        
                                        return (
                                            <div 
                                                key={option} 
                                                className={optionClasses}
                                                data-correct={isCorrect}
                                                data-submitted={isSubmitted}
                                                data-show-answers={showAnswers}
                                            >
                                                <label className="option-label">
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.questionId}`}
                                                        value={option}
                                                        checked={isSelected}
                                                        onChange={() => handleAnswerChange(question.questionId, option)}
                                                        disabled={isSubmitted}
                                                        className="option-input"
                                                    />
                                                    <span className="option-letter">{option}.</span>
                                                    <span className="option-text">{optionText}</span>
                                                    {showCorrectAnswer && (
                                                        <i className="fas fa-check option-check"></i>
                                                    )}
                                                    {showWrongAnswer && (
                                                        <i className="fas fa-times option-cross"></i>
                                                    )}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>

                                {isSubmitted && showAnswers && answers[question.questionId] !== question.correctAnswer && (
                                    <div className="correct-answer-reveal">
                                        <p className="correct-answer-text">
                                            <strong>Correct Answer:</strong> {question.correctAnswer} - {question[`option${question.correctAnswer}`]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quiz Actions */}
                <div className="quiz-actions">
                    {!isSubmitted ? (
                        <div className="d-flex justify-content-between">
                            <Link to="/quizzes" className="btn btn-outline-secondary">
                                <i className="fas fa-arrow-left me-2"></i>Back to Quizzes
                            </Link>
                            <button 
                                className="btn btn-primary btn-lg"
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length === 0}
                            >
                                <i className="fas fa-paper-plane me-2"></i>
                                Submit Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/quizzes" className="btn btn-outline-primary">
                                <i className="fas fa-list me-2"></i>View All Quizzes
                            </Link>
                            <button 
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-redo me-2"></i>Retake Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuizTakingComponent
