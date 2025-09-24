import React, {useState, useEffect} from 'react'
import {Link, useNavigate, useParams } from 'react-router-dom';
import CommentService from '../services/CommentService'
import UserService from '../services/UserService'
import CourseService from '../services/CourseService'
import LessonService from '../services/LessonService'
import './ListComponents.css'

const AddCommentComponent = () => {

    const [userId, setUserId] = useState('')
    const [courseId, setCourseId] = useState('')
    const [lessonId, setLessonId] = useState('')
    const [content, setContent] = useState('')
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [lessons, setLessons] = useState([])
    const navigate = useNavigate();
    const {id} = useParams();

    const validateForm = () => {
        const newErrors = {}

        if (!userId) {
            newErrors.userId = 'Please select a user'
        }

        if (!lessonId) {
            newErrors.lessonId = 'Please select a lesson'
        }

        if (!content.trim()) {
            newErrors.content = 'Please enter comment content'
        } else if (content.trim().length < 5) {
            newErrors.content = 'Comment must be at least 5 characters long'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveOrUpdateComment = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        const comment = {
            userId: parseInt(userId),
            lessonId: parseInt(lessonId),
            content: content.trim()
        }

        const operation = id
            ? CommentService.updateComment(id, comment)
            : CommentService.createComment(comment)

        operation.then((response) => {
            console.log(response.data)
            navigate('/comments');
        }).catch(error => {
            console.log(error)
            if (error.response && error.response.data) {
                setErrors({ submit: 'Failed to save comment. Please try again.' })
            }
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    useEffect(() => {
        getAllUsers()
        getAllCourses()
        getAllLessons()
    }, [])

    useEffect(() => {
        if (id) {
            CommentService.getCommentById(id).then((response) =>{
                setUserId(response.data.userId || '')
                setLessonId(response.data.lessonId || '')
                setContent(response.data.content || '')
                // Set courseId from lesson's course
                const lesson = lessons.find(l => l.lessonId == response.data.lessonId)
                if (lesson) {
                    setCourseId(lesson.courseId || '')
                }
            }).catch(error => {
                console.log(error)
            })
        }
    }, [id, lessons])

    const getAllUsers = () => {
        UserService.getAllUsers()
            .then((response) => {
                setUsers(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getAllCourses = () => {
        CourseService.getAllCourses()
            .then((response) => {
                setCourses(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getAllLessons = () => {
        LessonService.getAllLessons()
            .then((response) => {
                setLessons(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const titleText = () => {
        if(id){
            return 'Update Comment'
        }else{
            return 'Add New Comment'
        }
    }

    const subtitleText = () => {
        if(id){
            return ''
        }else{
            return 'Share your thoughts and feedback about lessons'
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
                            <i className="fas fa-comment"></i>
                        </div>
                        <h1 className="user-form-title">
                            <i className="fas fa-comment me-2"></i>
                            {titleText()}
                        </h1>
                        {subtitleText() && (
                            <p className="user-form-subtitle">
                                {subtitleText()}
                            </p>
                        )}
                    </div>
                    <div className="user-form-body">
                        {errors.submit && (
                            <div className="user-form-alert alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {errors.submit}
                            </div>
                        )}

                        <form onSubmit={saveOrUpdateComment}>
                            <div className="form-section">
                                <h3 className="form-section-header">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Comment Information
                                </h3>
                                <div className="form-field-group">
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-user"></i>
                                            User
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <select
                                                className={`form-field-input ${errors.userId ? 'is-invalid' : ''}`}
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a user</option>
                                                {users.map(user => (
                                                    <option key={user.userId} value={user.userId}>
                                                        {user.username}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.userId && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.userId}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Select the user who is posting this comment
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-graduation-cap"></i>
                                            Course
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <select
                                                className="form-field-input"
                                                value={courseId}
                                                onChange={(e) => {
                                                    setCourseId(e.target.value)
                                                    setLessonId('') // Reset lesson when course changes
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a course (optional)</option>
                                                {courses.map(course => (
                                                    <option key={course.courseId} value={course.courseId}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Select a course to filter lessons
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-book-open"></i>
                                            Lesson
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <select
                                                className={`form-field-input ${errors.lessonId ? 'is-invalid' : ''}`}
                                                value={lessonId}
                                                onChange={(e) => setLessonId(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a lesson</option>
                                                {lessons
                                                    .filter(lesson => !courseId || lesson.courseId == courseId)
                                                    .map(lesson => (
                                                        <option key={lesson.lessonId} value={lesson.lessonId}>
                                                            {lesson.title}
                                                        </option>
                                                    ))}
                                            </select>
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.lessonId && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.lessonId}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Select the lesson this comment is about
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-comment"></i>
                                            Comment Content
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <textarea
                                                className={`form-field-input ${errors.content ? 'is-invalid' : ''}`}
                                                placeholder="Share your thoughts and feedback about this lesson..."
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                rows="6"
                                                disabled={isSubmitting}
                                            />
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.content && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.content}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Write a thoughtful comment about the lesson. Minimum 5 characters required
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <Link to="/comments" className="btn btn-cancel">
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            {id ? 'Update Comment' : 'Post Comment'}
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

export default AddCommentComponent;
