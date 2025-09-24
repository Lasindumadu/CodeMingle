import React, {useState, useEffect} from 'react'
import {Link, useNavigate, useParams } from 'react-router-dom';
import EnrollmentService from '../services/EnrollmentService'
import UserService from '../services/UserService'
import CourseService from '../services/CourseService'
import './ListComponents.css'

const AddEnrollmentComponent = () => {

    const [userId, setUserId] = useState('')
    const [courseId, setCourseId] = useState('')
    const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0])
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const navigate = useNavigate();
    const {id} = useParams();

    const validateForm = () => {
        const newErrors = {}

        if (!userId || userId <= 0) {
            newErrors.userId = 'Please select a user'
        }

        if (!courseId || courseId <= 0) {
            newErrors.courseId = 'Please select a course'
        }

        if (!enrollmentDate) {
            newErrors.enrollmentDate = 'Please select an enrollment date'
        }

        // Check if user is already enrolled in the course
        if (userId && courseId && !id) { // Only for create, not update
            const existingEnrollment = enrollments.find(e => e.userId == userId && e.courseId == courseId)
            if (existingEnrollment) {
                newErrors.duplicate = 'This user is already enrolled in the selected course.'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveOrUpdateEnrollment = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        const enrollment = {
            userId: userId,
            courseId: courseId,
            enrollmentDate: enrollmentDate
        }

        const operation = id
            ? EnrollmentService.updateEnrollment(id, enrollment)
            : EnrollmentService.createEnrollment(enrollment)

        operation.then((response) => {
            console.log(response.data)
            navigate('/enrollments');
        }).catch(error => {
            console.log(error)
            if (error.response && error.response.data) {
                setErrors({ submit: 'Failed to save enrollment. Please try again.' })
            }
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    useEffect(() => {
        if (id) {
            EnrollmentService.getEnrollmentById(id).then((response) =>{
                setUserId(response.data.userId || '')
                setCourseId(response.data.courseId || '')
                setEnrollmentDate(response.data.enrollmentDate || new Date().toISOString().split('T')[0])
            }).catch(error => {
                console.log(error)
            })
        }
    }, [id])

    useEffect(() => {
        UserService.getAllUsers().then((response) => {
            setUsers(response.data)
        }).catch(error => {
            console.log(error)
        })

        CourseService.getAllCourses().then((response) => {
            setCourses(response.data)
        }).catch(error => {
            console.log(error)
        })

        EnrollmentService.getAllEnrollments().then((response) => {
            setEnrollments(response.data)
        }).catch(error => {
            console.log(error)
        })

    }, [])

    const titleText = () => {
        if(id){
            return 'Update Enrollment'
        }else{
            return 'Add New Enrollment'
        }
    }

    const subtitleText = () => {
        if(id){
            return ''
        }else{
            return 'Enroll users in courses to track their learning progress'
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
                            <i className="fas fa-user-graduate"></i>
                        </div>
                        <h1 className="user-form-title">
                            <i className="fas fa-user-graduate me-2"></i>
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

                        {errors.duplicate && (
                            <div className="user-form-alert alert alert-warning">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {errors.duplicate}
                            </div>
                        )}

                        <form onSubmit={saveOrUpdateEnrollment}>
                            <div className="form-section">
                                <h3 className="form-section-header">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Enrollment Information
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
                                            Select the user who will be enrolled in the course
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-book"></i>
                                            Course
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <select
                                                className={`form-field-input ${errors.courseId ? 'is-invalid' : ''}`}
                                                value={courseId}
                                                onChange={(e) => setCourseId(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a course</option>
                                                {courses.map(course => (
                                                    <option key={course.courseId} value={course.courseId}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.courseId && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.courseId}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Select the course the user will be enrolled in
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-calendar-alt"></i>
                                            Enrollment Date
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <input
                                                type="date"
                                                className={`form-field-input ${errors.enrollmentDate ? 'is-invalid' : ''}`}
                                                value={enrollmentDate}
                                                onChange={(e) => setEnrollmentDate(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.enrollmentDate && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.enrollmentDate}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Select the date when the enrollment should be recorded
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <Link to="/enrollments" className="btn btn-cancel">
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
                                            {id ? 'Update Enrollment' : 'Create Enrollment'}
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

export default AddEnrollmentComponent;
