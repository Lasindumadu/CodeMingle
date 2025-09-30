import React, {useState, useEffect} from 'react'
import {Link, useNavigate, useParams } from 'react-router-dom';
import QuizService from '../services/QuizService'

const AddQuizComponent = () => {

    const [lessonId, setLessonId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [shuffleQuestions, setShuffleQuestions] = useState(false)
    const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
    const [questions, setQuestions] = useState([
        {
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 'A',
            questionOrder: 1
        }
    ])
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();
    const {id} = useParams();

    const validateForm = () => {
        const newErrors = {}

        if (!lessonId || lessonId <= 0) {
            newErrors.lessonId = 'Please enter a valid Lesson ID'
        }

        if (!title.trim()) {
            newErrors.title = 'Please enter a quiz title'
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters long'
        }

        if (!description.trim()) {
            newErrors.description = 'Please enter a quiz description'
        } else if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters long'
        }

        if (!timeLimitMinutes || timeLimitMinutes <= 0) {
            newErrors.timeLimitMinutes = 'Please enter a valid time limit (minimum 1 minute)'
        } else if (timeLimitMinutes > 300) {
            newErrors.timeLimitMinutes = 'Time limit cannot exceed 300 minutes (5 hours)'
        }

        // Validate questions
        questions.forEach((question, index) => {
            if (!question.questionText.trim()) {
                newErrors[`question_${index}_text`] = 'Question text is required'
            }
            if (!question.optionA.trim() || !question.optionB.trim() ||
                !question.optionC.trim() || !question.optionD.trim()) {
                newErrors[`question_${index}_options`] = 'All options are required'
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const addQuestion = () => {
        const newQuestion = {
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 'A',
            questionOrder: questions.length + 1
        }
        setQuestions([...questions, newQuestion])
    }

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const updatedQuestions = questions.filter((_, i) => i !== index)
            // Update question orders
            updatedQuestions.forEach((q, i) => q.questionOrder = i + 1)
            setQuestions(updatedQuestions)
        }
    }

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...questions]
        updatedQuestions[index][field] = value
        setQuestions(updatedQuestions)
    }

    const saveOrUpdateQuiz = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        const quiz = {
            lessonId: parseInt(lessonId),
            title: title.trim(),
            description: description.trim(),
            shuffleQuestions: shuffleQuestions,
            timeLimitMinutes: parseInt(timeLimitMinutes),
            questions: questions.map(q => ({
                questionText: q.questionText.trim(),
                optionA: q.optionA.trim(),
                optionB: q.optionB.trim(),
                optionC: q.optionC.trim(),
                optionD: q.optionD.trim(),
                correctAnswer: q.correctAnswer,
                questionOrder: q.questionOrder
            }))
        }

        const operation = id
            ? QuizService.updateQuiz(id, quiz)
            : QuizService.createQuiz(quiz)

        operation.then((response) => {
            console.log(response.data)
            navigate('/quizzes');
        }).catch(error => {
            console.log(error)
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || 'An error occurred.';
                if (status === 404) {
                    setErrors({ submit: `Lesson not found: ${message}` });
                } else if (status === 500) {
                    setErrors({ submit: 'Server error. Please try again later.' });
                } else {
                    setErrors({ submit: `Failed to save quiz: ${message}` });
                }
            } else {
                setErrors({ submit: 'Network error. Please check your connection.' });
            }
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    useEffect(() => {
        if (id) {
            QuizService.getQuizById(id).then((response) =>{
                setLessonId(response.data.lessonId || '')
                setTitle(response.data.title || '')
                setDescription(response.data.description || '')
                setShuffleQuestions(response.data.shuffleQuestions || false)
                setTimeLimitMinutes(response.data.timeLimitMinutes || 30)
                setQuestions(response.data.questions && response.data.questions.length > 0 ? response.data.questions.map((q, index) => ({
                    questionText: q.questionText || '',
                    optionA: q.optionA || '',
                    optionB: q.optionB || '',
                    optionC: q.optionC || '',
                    optionD: q.optionD || '',
                    correctAnswer: q.correctAnswer || 'A',
                    questionOrder: q.questionOrder || index + 1
                })) : [
                    {
                        questionText: '',
                        optionA: '',
                        optionB: '',
                        optionC: '',
                        optionD: '',
                        correctAnswer: 'A',
                        questionOrder: 1
                    }
                ])
            }).catch(error => {
                console.log(error)
            })
        }
    }, [id])

    const titleText = () => {
        if (id) {
            return <><i className="fas fa-question-circle me-2"></i>Update Quiz</>
        } else {
            return <span style={{color: 'white'}}><i className="fas fa-question-circle me-2"></i>Add New Quiz</span>
        }
    }

    return (
        <div className="user-form-container">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="user-form-card">
                            <div className="user-form-header">
                                <div className="user-form-avatar">
                                    <i className="fas fa-question-circle"></i>
                                </div>
                                <h1 className="user-form-title">
                                    {titleText()}
                                </h1>
                            </div>

                            <div className="user-form-body">
                                {errors.submit && (
                                    <div className="alert alert-danger user-form-alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errors.submit}
                                    </div>
                                )}

                                <form onSubmit={saveOrUpdateQuiz} className="user-form">
                                    <div className="form-section">
                                        <div className="form-field-group">
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label htmlFor="lessonId" className="form-label fw-bold">
                                                        <i className="fas fa-book-open me-2"></i>Lesson ID
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="lessonId"
                                                        placeholder="Enter lesson ID"
                                                        name="lessonId"
                                                        className={`form-control ${errors.lessonId ? 'is-invalid' : ''}`}
                                                        value={lessonId}
                                                        onChange={(e) => setLessonId(e.target.value)}
                                                        min="1"
                                                    />
                                                    {errors.lessonId && (
                                                        <div className="invalid-feedback">{errors.lessonId}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor="title" className="form-label fw-bold">
                                                    <i className="fas fa-heading me-2"></i>Quiz Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    placeholder="Enter an engaging quiz title"
                                                    name="title"
                                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    maxLength="100"
                                                />
                                                {errors.title && (
                                                    <div className="invalid-feedback">{errors.title}</div>
                                                )}
                                                <div className="form-text">
                                                    {title.length}/100 characters
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor="description" className="form-label fw-bold">
                                                    <i className="fas fa-align-left me-2"></i>Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    placeholder="Describe what this quiz covers..."
                                                    name="description"
                                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows="3"
                                                    style={{ resize: 'vertical' }}
                                                    maxLength="500"
                                                />
                                                {errors.description && (
                                                    <div className="invalid-feedback">{errors.description}</div>
                                                )}
                                                <div className="form-text">
                                                    {description.length}/500 characters. Minimum 10 characters required.
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="form-check">
                                                    <input
                                                        key={shuffleQuestions ? 'checked' : 'unchecked'}
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="shuffleQuestions"
                                                        checked={shuffleQuestions}
                                                        onChange={(e) => {
                                                            console.log('Shuffle checkbox changed to:', e.target.checked)
                                                            setShuffleQuestions(e.target.checked)
                                                        }}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="shuffleQuestions">
                                                        <i className="fas fa-random me-2"></i>Shuffle Questions
                                                    </label>
                                                </div>
                                                <div className="form-text">
                                                    When enabled, the order of questions will be randomized for each quiz attempt.
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="timeLimitMinutes" className="form-label fw-bold">
                                                    <i className="fas fa-clock me-2"></i>Time Limit (Minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="timeLimitMinutes"
                                                    placeholder="Enter time limit in minutes"
                                                    name="timeLimitMinutes"
                                                    className={`form-control ${errors.timeLimitMinutes ? 'is-invalid' : ''}`}
                                                    value={timeLimitMinutes}
                                                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                                                    min="1"
                                                    max="300"
                                                />
                                                {errors.timeLimitMinutes && (
                                                    <div className="invalid-feedback">{errors.timeLimitMinutes}</div>
                                                )}
                                                <div className="form-text">
                                                    Set the time limit for completing this quiz (1-300 minutes). Default is 30 minutes.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                {/* Questions Section */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="mb-0">
                                            <i className="fas fa-question-circle me-2"></i>Questions
                                        </h4>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={addQuestion}
                                        >
                                            <i className="fas fa-plus me-1"></i>Add Question
                                        </button>
                                    </div>

                                    {questions.map((question, index) => (
                                        <div key={index} className="card mb-3 border-primary">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0">Question {index + 1}</h6>
                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeQuestion(index)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Question Text</label>
                                                    <textarea
                                                        className={`form-control ${errors[`question_${index}_text`] ? 'is-invalid' : ''}`}
                                                        rows="2"
                                                        value={question.questionText}
                                                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                                                        placeholder="Enter your question here..."
                                                    />
                                                    {errors[`question_${index}_text`] && (
                                                        <div className="invalid-feedback">{errors[`question_${index}_text`]}</div>
                                                    )}
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label fw-bold">Option A</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={question.optionA}
                                                            onChange={(e) => updateQuestion(index, 'optionA', e.target.value)}
                                                            placeholder="Option A"
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label fw-bold">Option B</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={question.optionB}
                                                            onChange={(e) => updateQuestion(index, 'optionB', e.target.value)}
                                                            placeholder="Option B"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label fw-bold">Option C</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={question.optionC}
                                                            onChange={(e) => updateQuestion(index, 'optionC', e.target.value)}
                                                            placeholder="Option C"
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label fw-bold">Option D</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={question.optionD}
                                                            onChange={(e) => updateQuestion(index, 'optionD', e.target.value)}
                                                            placeholder="Option D"
                                                        />
                                                    </div>
                                                </div>

                                                {errors[`question_${index}_options`] && (
                                                    <div className="alert alert-danger user-form-alert py-2">
                                                        <small>{errors[`question_${index}_options`]}</small>
                                                    </div>
                                                )}

                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Correct Answer</label>
                                                    <select
                                                        className="form-select"
                                                        value={question.correctAnswer}
                                                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                                    >
                                                        <option value="A">A - {question.optionA || 'Option A'}</option>
                                                        <option value="B">B - {question.optionB || 'Option B'}</option>
                                                        <option value="C">C - {question.optionC || 'Option C'}</option>
                                                        <option value="D">D - {question.optionD || 'Option D'}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions">
                                    <Link to="/quizzes" className="btn btn-cancel">
                                        <i className="fas fa-times me-2"></i>
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                Saving...
                                            </>
                                        ) : id ? (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Update Quiz
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-plus me-2"></i>
                                                Create Quiz
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddQuizComponent;
