import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import CourseService from '../services/CourseService'
import EnrollmentService from '../services/EnrollmentService'
import UserService from '../services/UserService'
import { useAuth } from '../context/AuthContext'
import AuthService from '../services/AuthService'
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
    const [enrollmentStatus, setEnrollmentStatus] = useState({})
    const [enrolling, setEnrolling] = useState({})
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const { user, isAuthenticated } = useAuth()


    useEffect(() => {
        getAllCourses()
        initializeUser()
    }, [])

    useEffect(() => {
        if (AuthService.isAuthenticated() && currentUser && courses.length > 0) {
            checkEnrollmentStatus()
        }
    }, [currentUser, courses])

    // Watch for authentication changes
    useEffect(() => {
        const handleAuthChange = () => {
            initializeUser()
        }
        
        window.addEventListener('authChanged', handleAuthChange)
        
        return () => {
            window.removeEventListener('authChanged', handleAuthChange)
        }
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

    const initializeUser = async () => {
        try {
            const username = AuthService.getUsername()
            if (!username) {
                setCurrentUser(null)
                setEnrollmentStatus({})
                return
            }

            // Get user details by username from backend
            const userResponse = await UserService.getUserByUsername(username)
            const userData = userResponse.data
            setCurrentUser(userData)
        } catch (error) {
            console.error('Error initializing user:', error)
            setCurrentUser(null)
            setEnrollmentStatus({})
        }
    }

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

    const checkEnrollmentStatus = async () => {
        const userId = currentUser?.userId;
        if (!currentUser || !userId) return;
        
        const statusPromises = courses.map(async (course) => {
            try {
                const response = await EnrollmentService.checkUserEnrollment(userId, course.courseId);
                return { courseId: course.courseId, isEnrolled: response.data };
            } catch (error) {
                console.error(`Error checking enrollment for course ${course.courseId}:`, error);
                return { courseId: course.courseId, isEnrolled: false };
            }
        });

        const results = await Promise.all(statusPromises);
        const statusMap = {};
        results.forEach(result => {
            statusMap[result.courseId] = result.isEnrolled;
        });
        setEnrollmentStatus(statusMap);
    }

    const showToast = (message, isSuccess = true) => {
        setToastMessage(message);
        if (isSuccess) {
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 4000);
        } else {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 4000);
        }
    }

    const handleEnrollment = async (courseId) => {
        // Use currentUser from backend instead of AuthContext user
        const userId = currentUser?.userId;
        
        if (!AuthService.isAuthenticated() || !currentUser || !userId) {
            showToast('Please log in to enroll in courses', false);
            return;
        }

        setEnrolling(prev => ({ ...prev, [courseId]: true }));
        
        try {
            await EnrollmentService.enrollUserInCourse(userId, courseId);
            setEnrollmentStatus(prev => ({ ...prev, [courseId]: true }));
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('enrollmentUpdated'));
            
            const courseName = courses.find(c => c.courseId === courseId)?.title || 'course';
            showToast(`Successfully enrolled in ${courseName}!`, true);
        } catch (error) {
            console.error('Error enrolling in course:', error);
            if (error.response?.data?.message) {
                showToast(error.response.data.message, false);
            } else {
                showToast('Failed to enroll in course. Please try again.', false);
            }
        } finally {
            setEnrolling(prev => ({ ...prev, [courseId]: false }));
        }
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
                                <div key={course.courseId} className="list-card user-card text-center position-relative" onClick={() => { setSelectedCourseId(course.courseId); setShowModal(true); }} style={{cursor: 'pointer', overflow: 'visible'}}>
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
                                    {/* Enrollment Status Badge - Only for non-admin users */}
                                    {AuthService.isAuthenticated() && currentUser && !AuthService.isAdmin() && (
                                        <div className="enrollment-status-badge position-absolute" style={{top: '15px', right: '15px', zIndex: 30}}>
                                            {enrollmentStatus[course.courseId] ? (
                                                <div className="enrollment-badge enrolled-badge" style={{
                                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    borderRadius: '25px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                                                    transform: 'rotate(-8deg) scale(1.05)',
                                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                                    backdropFilter: 'blur(10px)',
                                                    animation: 'pulse 2s infinite',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <i className="fas fa-crown me-2" style={{color: '#ffd700'}}></i>
                                                    <span>ENROLLED</span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-2px',
                                                        right: '-2px',
                                                        width: '8px',
                                                        height: '8px',
                                                        background: '#ffd700',
                                                        borderRadius: '50%',
                                                        animation: 'sparkle 1.5s infinite'
                                                    }}></div>
                                                </div>
                                            ) : (
                                                <div className="enrollment-badge not-enrolled-badge" style={{
                                                    background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                                                    color: '#212529',
                                                    padding: '8px 16px',
                                                    borderRadius: '25px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
                                                    transform: 'rotate(8deg) scale(1.05)',
                                                    border: '2px solid rgba(255, 255, 255, 0.5)',
                                                    backdropFilter: 'blur(10px)',
                                                    animation: 'bounce 2s infinite',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative'
                                                }}>
                                                    <i className="fas fa-bolt me-2" style={{color: '#dc3545'}}></i>
                                                    <span>JOIN NOW</span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        right: '-12px',
                                                        transform: 'translateY(-50%)',
                                                        width: '0',
                                                        height: '0',
                                                        borderLeft: '8px solid #fd7e14',
                                                        borderTop: '6px solid transparent',
                                                        borderBottom: '6px solid transparent'
                                                    }}></div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="card-actions mt-3 d-flex gap-2">
                                        {/* Admin View */}
                                        {AuthService.isAdmin() ? (
                                            <>
                                                <button
                                                    className="btn btn-outline-info btn-sm flex-fill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCourseId(course.courseId);
                                                        setShowModal(true);
                                                    }}
                                                    title="View course details"
                                                >
                                                    <i className="fas fa-info-circle me-1"></i>View Details
                                                </button>
                                                <Link
                                                    className="btn btn-outline-primary btn-sm"
                                                    to={`/edit-course/${course.courseId}`}
                                                    title="Edit this course"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCourse(course.courseId);
                                                    }}
                                                    title="Delete this course"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        ) : (
                                            /* Regular User View */
                                            <>
                                                {/* Enrollment/View Button */}
                                                {AuthService.isAuthenticated() && currentUser ? (
                                                    enrollmentStatus[course.courseId] ? (
                                                        <button
                                                            className="btn btn-success btn-sm flex-fill"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCourseId(course.courseId);
                                                                setShowModal(true);
                                                            }}
                                                            title="View course lessons"
                                                        >
                                                            <i className="fas fa-play me-1"></i>View Lessons
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-sm flex-fill"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEnrollment(course.courseId);
                                                            }}
                                                            disabled={enrolling[course.courseId]}
                                                            title="Enroll in this course"
                                                        >
                                                            {enrolling[course.courseId] ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin me-1"></i>Enrolling...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-user-plus me-1"></i>Enroll Now
                                                                </>
                                                            )}
                                                        </button>
                                                    )
                                                ) : (
                                                    <button
                                                        className="btn btn-outline-info btn-sm flex-fill"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCourseId(course.courseId);
                                                            setShowModal(true);
                                                        }}
                                                        title="View course details"
                                                    >
                                                        <i className="fas fa-info-circle me-1"></i>View Details
                                                    </button>
                                                )}
                                            </>
                                        )}
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
                                        {/* Enrollment Status and Button - Only for non-admin users */}
                                        {AuthService.isAuthenticated() && currentUser && !AuthService.isAdmin() && (
                                            <div className="enrollment-section mt-4 p-3 bg-light rounded">
                                                {enrollmentStatus[selectedCourse.courseId] ? (
                                                    <div className="text-success">
                                                        <i className="fas fa-check-circle me-2"></i>
                                                        You are enrolled in this course
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-muted mb-2">
                                                            <i className="fas fa-info-circle me-2"></i>
                                                            You need to enroll to access the lessons
                                                        </p>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEnrollment(selectedCourse.courseId);
                                                            }}
                                                            disabled={enrolling[selectedCourse.courseId]}
                                                        >
                                                            {enrolling[selectedCourse.courseId] ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                                    Enrolling...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-user-plus me-2"></i>
                                                                    Enroll in Course
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="lesson-section mt-4">
                                            {lessons.length > 0 ? (
                                                <>
                                                    {/* Admin users can always access lessons */}
                                                    {AuthService.isAdmin() ? (
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
                                                        /* Regular users need enrollment to access lessons */
                                                        <>
                                                            {AuthService.isAuthenticated() && currentUser && enrollmentStatus[selectedCourse.courseId] ? (
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
                                                                <div className="locked-lessons">
                                                                    <h6 className="text-muted mb-3">
                                                                        <i className="fas fa-lock me-2"></i>
                                                                        Course Lessons ({lessons.length})
                                                                    </h6>
                                                                    <ul className="lesson-list">
                                                                        {lessons.map((lesson) => (
                                                                            <li key={lesson.lessonId} className="lesson-item locked" style={{paddingLeft: '2em'}}>
                                                                                <span className="text-muted">
                                                                                    <i className="fas fa-lock me-2"></i>
                                                                                    {lesson.title}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    {!AuthService.isAuthenticated() && (
                                                                        <p className="text-muted mt-2">
                                                                            <i className="fas fa-info-circle me-2"></i>
                                                                            Please log in and enroll to access lessons
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-muted">No lessons added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>
                )}

                {/* Toast Notifications */}
                {showSuccessToast && (
                    <div className="position-fixed top-0 end-0 p-3" style={{zIndex: 1050}}>
                        <div className="toast show" role="alert">
                            <div className="toast-header bg-success text-white">
                                <i className="fas fa-check-circle me-2"></i>
                                <strong className="me-auto">Success</strong>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowSuccessToast(false)}
                                ></button>
                            </div>
                            <div className="toast-body">
                                {toastMessage}
                            </div>
                        </div>
                    </div>
                )}

                {showErrorToast && (
                    <div className="position-fixed top-0 end-0 p-3" style={{zIndex: 1050}}>
                        <div className="toast show" role="alert">
                            <div className="toast-header bg-danger text-white">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                <strong className="me-auto">Error</strong>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowErrorToast(false)}
                                ></button>
                            </div>
                            <div className="toast-body">
                                {toastMessage}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListCourseComponent
