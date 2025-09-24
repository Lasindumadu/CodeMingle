import React, {useState, useEffect} from 'react'
import {Link, useNavigate, useParams } from 'react-router-dom';
import CourseService from '../services/CourseService'
import './ListComponents.css'

const AddCourseComponent = () => {

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();
    const {id} = useParams();

    const validateForm = () => {
        const newErrors = {}
        if (!title.trim()) {
            newErrors.title = 'Course title is required'
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters'
        }
        if (!description.trim()) {
            newErrors.description = 'Course description is required'
        } else if (description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveOrUpdateCourse = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        const course = {title: title.trim(), description: description.trim()}

        const promise = id
            ? CourseService.updateCourse(id, course)
            : CourseService.createCourse(course)

        promise.then((response) => {
            console.log(response.data)
            navigate('/courses');
        }).catch(error => {
            console.log(error)
            setErrors({submit: 'Failed to save course. Please try again.'})
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    useEffect(() => {
        if (id) {
            CourseService.getCourseById(id).then((response) =>{
                setTitle(response.data.title)
                setDescription(response.data.description)
            }).catch(error => {
                console.log(error)
                setErrors({load: 'Failed to load course data'})
            })
        }
    }, [id])

    const titleText = () => {
        if(id){
            return <span>Update Course</span>
        }else{
            return <span style={{color: 'white'}}>Add New Course</span>
        }
    }

    const subtitleText = () => {
        if(id){
            return ''
        }else{
            return 'Create a new course to expand your learning platform'
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
                            <i className="fas fa-book"></i>
                        </div>
                        <h1 className="user-form-title">
                            <i className="fas fa-book me-2"></i>
                            {titleText()}
                        </h1>
                        {subtitleText() && (
                            <p className="user-form-subtitle">
                                {subtitleText()}
                            </p>
                        )}
                    </div>
                    <div className="user-form-body">
                        {errors.load && (
                            <div className="user-form-alert alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {errors.load}
                            </div>
                        )}
                        <form onSubmit={saveOrUpdateCourse}>
                            <div className="form-section">
                                <h3 className="form-section-header">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Course Information
                                </h3>
                                <div className="form-field-group">
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-heading"></i>
                                            Course Title
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <input
                                                type="text"
                                                className={`form-field-input ${errors.title ? 'is-invalid' : ''}`}
                                                placeholder="Enter an engaging course title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.title && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.title}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Choose a clear and descriptive title for your course
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-field-label">
                                            <i className="form-field-icon fas fa-align-left"></i>
                                            Course Description
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="form-field-input-wrapper">
                                            <textarea
                                                className={`form-field-input ${errors.description ? 'is-invalid' : ''}`}
                                                placeholder="Describe what students will learn in this course..."
                                                rows="5"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <div className="form-field-focus-border"></div>
                                        </div>
                                        {errors.description && (
                                            <div className="form-field-error">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.description}
                                            </div>
                                        )}
                                        <div className="form-field-help">
                                            <i className="fas fa-lightbulb me-1"></i>
                                            Provide a detailed description to help students understand the course content
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {errors.submit && (
                                <div className="user-form-alert alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.submit}
                                </div>
                            )}
                            <div className="form-actions">
                                <Link to="/courses" className="btn btn-cancel">
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
                                            {id ? 'Update Course' : 'Create Course'}
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

export default AddCourseComponent;
