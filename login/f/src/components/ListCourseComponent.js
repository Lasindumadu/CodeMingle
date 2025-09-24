import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import CourseService from '../services/CourseService'
import './ListComponents.css'

import LessonService from '../services/LessonService'

const ListCourseComponent = () => {
    const [courses, setCourses] = useState([])
    const [filteredCourses, setFilteredCourses] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [lessons, setLessons] = React.useState([])
    const [showModal, setShowModal] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const urlSearchTerm = searchParams.get('search') || ''
    const [sortField, setSortField] = useState('courseId')
    const [sortOrder, setSortOrder] = useState('asc')


    useEffect(() => {
        getAllCourses()
    }, [])

    useEffect(() => {
        if (urlSearchTerm && searchTerm === '') {
            setSearchTerm(urlSearchTerm)
        }
    }, [urlSearchTerm])

    useEffect(() => {
        const filtered = courses.filter(course =>
            (course.title && course.title.toLowerCase().includes((searchTerm || urlSearchTerm).toLowerCase())) ||
            (course.description && course.description.toLowerCase().includes((searchTerm || urlSearchTerm).toLowerCase())) ||
            (course.courseId && course.courseId.toString().includes(searchTerm || urlSearchTerm))
        );
        setFilteredCourses(sortCourses(filtered));
    }, [courses, searchTerm, urlSearchTerm, sortField, sortOrder])

    useEffect(() => {
        if (selectedCourseId) {
            const course = courses.find(c => c.courseId == selectedCourseId)
            setSelectedCourse(course)
        } else {
            setSelectedCourse(null)
        }
    }, [selectedCourseId, courses])

    const getAllCourses = () => {
        CourseService.getAllCourses()
            .then((response) => {
                let data = response.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.error('Failed to parse response data:', e);
                        setCourses([]);
                        return;
                    }
                }
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    console.error('Expected array but got:', data);
                    setCourses([]);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const fetchLessons = (courseId) => {
        if (!courseId) {
            setLessons([]);
            return;
        }
        LessonService.getLessonsByCourseId(courseId)
            .then(response => {
                const lessonsData = response.data;
                if (Array.isArray(lessonsData)) {
                    setLessons(lessonsData);
                } else {
                    setLessons([]);
                }
            })
            .catch(error => {
                console.error('Failed to fetch lessons:', error);
                setLessons([]);
            });
    }

    const deleteCourse = (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            CourseService.deleteCourse(courseId)
                .then(() => {
                    getAllCourses()
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }
    
    useEffect(() => {
        if (selectedCourseId) {
            fetchLessons(selectedCourseId);
        } else {
            setLessons([]);
        }
    }, [selectedCourseId]);

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        if (value === '') {
            setSearchParams({})
        } else {
            setSearchParams({search: value})
        }
        setVisibleCount(10) // Reset pagination on search
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    const sortCourses = (courses) => {
        return [...courses].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'courseId':
                    aValue = a.courseId;
                    bValue = b.courseId;
                    break;
                case 'title':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'description':
                    aValue = a.description || '';
                    bValue = b.description || '';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt || 0);
                    bValue = new Date(b.createdAt || 0);
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return (
        <div className="list-page-container">
            <div className="container">
                <div className="list-header d-flex justify-content-between align-items-center mb-4">
                    <h2 className="list-title mb-0">Courses</h2>
                    <Link to="/add-course" className="btn btn-success btn-lg add-button" title="Add a new course">
                        <i className="fas fa-plus me-2"></i>Add Course
                    </Link>
                </div>

                {courses.length > 0 && (
                    <div className="search-container mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title, description, or ID..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{paddingRight: '8rem'}}
                        />
                        <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                    </div>
                )}

                {courses.length > 0 && (
                        <div className="sort-container mb-4 d-flex gap-3">
                            <div className="form-group" style={{width: '150px'}}>
                                <label htmlFor="sortField" className="form-label">Sort by:</label>
                                <select
                                    id="sortField"
                                    className="form-select"
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                >
                                    <option value="courseId">ID</option>
                                    <option value="title">Title</option>
                                    <option value="description">Description</option>
                                    <option value="createdAt">Created Date</option>
                                </select>
                            </div>
                            <div className="form-group" style={{width: '120px'}}>
                                <label htmlFor="sortOrder" className="form-label">Order:</label>
                                <select
                                    id="sortOrder"
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="asc">A-Z</option>
                                    <option value="desc">Z-A</option>
                                </select>
                            </div>
                        </div>
                )}



                {filteredCourses.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-book fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">{(searchTerm || urlSearchTerm) ? 'No courses match your search' : 'No courses available'}</h4>
                        <p className="empty-text">{(searchTerm || urlSearchTerm) ? 'Try adjusting your search terms.' : 'Start by adding your first course!'}</p>
                    </div>
                ) : (
                    <>
                        <div className="list-card-container">
                            {filteredCourses.slice(0, visibleCount).map((course) => (
                                <div key={course.courseId} className="list-card user-card text-center" onClick={() => { setSelectedCourseId(course.courseId); setShowModal(true); }} style={{cursor: 'pointer'}}>
                                    <div className="user-card-header">
                                        <div className="user-card-avatar">
                                            <i className="fas fa-book"></i>
                                        </div>
                                    </div>
                                    <div className="user-card-body">
                                        <h5 className="card-title">
                                            <i className="fas fa-book me-2"></i>
                                            {course.title}
                                        </h5>
                                        <div className="user-card-info">
                                            <div className="info-item">
                                                <i className="fas fa-info-circle"></i>
                                                <span className="info-label">Description</span>
                                                <span className="info-value">{course.description || 'No description available'}</span>
                                            </div>
                                        </div>
                                        <div className="user-card-meta">
                                            <div className="meta-item">
                                                <i className="fas fa-hashtag"></i>
                                                <span>ID: {course.courseId}</span>
                                            </div>
                                            {course.createdAt && (
                                                <div className="meta-item">
                                                    <i className="fas fa-calendar-plus"></i>
                                                    <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-actions mt-3 d-flex gap-2">
                                        <Link
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            to={`/edit-course/${course.courseId}`}
                                            title="Edit this course"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fas fa-edit me-1"></i>Edit
                                        </Link>
                                        <button
                                            className="btn btn-outline-danger btn-sm flex-fill"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteCourse(course.courseId);
                                            }}
                                            title="Delete this course"
                                        >
                                            <i className="fas fa-trash me-1"></i>Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredCourses.length > visibleCount && (
                            <div className="text-center mt-4">
                                <button className="btn btn-secondary" onClick={loadMore}>
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}

                {selectedCourse && (
                        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                            <Modal.Header closeButton className="user-modal-header">
                                <Modal.Title className="user-modal-title">
                                    <i className="fas fa-book me-2"></i>
                                    Course Details
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="user-modal-body">
                                <div className="user-profile-card">
                                    <div className="user-avatar-section">
                                        <div className="user-avatar">
                                            <i className="fas fa-book"></i>
                                        </div>
                                    </div>
                                    <div className="user-info-section">
                                        <h2 className="user-name">
                                            <i className="fas fa-book me-2"></i>
                                            {selectedCourse.title}
                                        </h2>
                                        <div className="user-details-grid">
                                            <div className="detail-item">
                                                <div className="detail-icon">
                                                    <i className="fas fa-info-circle"></i>
                                                </div>
                                                <div className="detail-content">
                                                    <span className="detail-label">Description</span>
                                                    <span className="detail-value">{selectedCourse.description || 'No description available'}</span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <div className="detail-icon">
                                                    <i className="fas fa-hashtag"></i>
                                                </div>
                                                <div className="detail-content">
                                                    <span className="detail-label">ID</span>
                                                    <span className="detail-value">{selectedCourse.courseId}</span>
                                                </div>
                                            </div>
                                            {selectedCourse.createdAt && (
                                                <div className="detail-item">
                                                    <div className="detail-icon">
                                                        <i className="fas fa-calendar-alt"></i>
                                                    </div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Created</span>
                                                        <span className="detail-value">{new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-stats">
                                            <div className="stat-item">
                                                <i className="fas fa-list-ul"></i>
                                                <span>Lessons</span>
                                                <span className="stat-number">{lessons.length}</span>
                                            </div>
                                        </div>
                                        <div className="lesson-section mt-4">
                                            {lessons.length > 0 ? (
                                                <ul className="lesson-list">
                                                    {lessons.map((lesson) => (
                                                        <li key={lesson.lessonId} className="lesson-item" style={{paddingLeft: '2em'}}>
                                                            <Link to={`/lessons?selected=${lesson.lessonId}`} className="lesson-link" onClick={() => setShowModal(false)}>
                                                                <i className="fas fa-play-circle me-2"></i>
                                                                {lesson.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted">No lessons added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>
                )}
            </div>
        </div>
    )
}

export default ListCourseComponent
