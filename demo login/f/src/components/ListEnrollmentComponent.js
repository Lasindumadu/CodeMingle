import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import EnrollmentService from '../services/EnrollmentService'
import UserService from '../services/UserService'
import CourseService from '../services/CourseService'
import LessonService from '../services/LessonService'
import AuthService from '../services/AuthService'
import './ListComponents.css'

const ListEnrollmentComponent = () => {
    const [enrollments, setEnrollments] = useState([])
    const [filteredEnrollments, setFilteredEnrollments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
    const [selectedEnrollment, setSelectedEnrollment] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])
    const [lessons, setLessons] = useState([])
    const [sortField, setSortField] = useState('enrollmentId')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        initializeData()
    }, [])

    // Listen for enrollment updates and authentication changes
    useEffect(() => {
        const handleEnrollmentUpdate = () => {
            if (AuthService.isAdmin()) {
                getAllEnrollments()
            } else if (currentUser) {
                getUserEnrollments()
            }
        }

        const handleAuthChange = () => {
            // Clear data and reinitialize when auth changes
            setEnrollments([])
            setFilteredEnrollments([])
            setCurrentUser(null)
            initializeData()
        }
        
        // Listen for custom enrollment events
        window.addEventListener('enrollmentUpdated', handleEnrollmentUpdate)
        // Listen for authentication changes
        window.addEventListener('authChanged', handleAuthChange)
        
        return () => {
            window.removeEventListener('enrollmentUpdated', handleEnrollmentUpdate)
            window.removeEventListener('authChanged', handleAuthChange)
        }
    }, [currentUser])

    // Watch for username changes to detect user switches
    useEffect(() => {
        const currentUsername = AuthService.getUsername()
        if (currentUser && currentUser.username !== currentUsername) {
            // User has switched, reinitialize
            initializeData()
        }
    }, [currentUser])

    useEffect(() => {
        const filtered = enrollments.filter(enrollment => {
            const course = courses.find(c => c.courseId == enrollment.courseId)
            const user = users.find(u => u.userId == enrollment.userId)
            
            if (AuthService.isAdmin()) {
                // Admin can search by user, course, or IDs
                return (
                    (user && user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (course && course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (course && course.courseId && course.courseId.toString().includes(searchTerm)) ||
                    (enrollment.userId && enrollment.userId.toString().includes(searchTerm))
                )
            } else {
                // Regular users can only search by course
                return (
                    (course && course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (course && course.courseId && course.courseId.toString().includes(searchTerm))
                )
            }
        });
        setFilteredEnrollments(sortEnrollments(filtered));
    }, [enrollments, searchTerm, courses, users, sortField, sortOrder])

    useEffect(() => {
        if (selectedEnrollmentId) {
            const enrollment = enrollments.find(e => e.enrollmentId == selectedEnrollmentId)
            setSelectedEnrollment(enrollment)
            setShowModal(true)
        } else {
            setSelectedEnrollment(null)
            setShowModal(false)
        }
    }, [selectedEnrollmentId, enrollments])

    const initializeData = async () => {
        try {
            setLoading(true)
            
            // Get current user info
            const username = AuthService.getUsername()
            if (!username) {
                console.error('No username found in auth service')
                setLoading(false)
                return
            }

            // Get user details by username
            const userResponse = await UserService.getUserByUsername(username)
            const user = userResponse.data
            setCurrentUser(user)

            // Load courses, lessons, and users for display purposes
            await Promise.all([
                getAllCourses(),
                getAllLessons(),
                AuthService.isAdmin() ? getAllUsers() : Promise.resolve()
            ])

            // Get enrollments based on user role
            if (AuthService.isAdmin()) {
                await getAllEnrollments()
            } else {
                await getUserEnrollments(user.userId)
            }
            
        } catch (error) {
            console.error('Error initializing data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getUserEnrollments = async (userId = null) => {
        try {
            const userIdToUse = userId || currentUser?.userId
            if (!userIdToUse) {
                console.error('No user ID available')
                return
            }

            const response = await EnrollmentService.getUserEnrollments(userIdToUse)
            setEnrollments(response.data)
        } catch (error) {
            console.error('Error fetching user enrollments:', error)
            setEnrollments([])
        }
    }

    const getAllEnrollments = async () => {
        try {
            const response = await EnrollmentService.getAllEnrollments()
            setEnrollments(response.data)
        } catch (error) {
            console.error('Error fetching all enrollments:', error)
            setEnrollments([])
        }
    }

    const getAllUsers = () => {
        return UserService.getAllUsers()
            .then((response) => {
                setUsers(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getAllCourses = () => {
        return CourseService.getAllCourses()
            .then((response) => {
                setCourses(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getAllLessons = () => {
        return LessonService.getAllLessons()
            .then((response) => {
                setLessons(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const deleteEnrollment = (enrollmentId) => {
        const confirmMessage = AuthService.isAdmin() 
            ? 'Are you sure you want to delete this enrollment?' 
            : 'Are you sure you want to unenroll from this course?'
            
        if (window.confirm(confirmMessage)) {
            EnrollmentService.deleteEnrollment(enrollmentId)
                .then(() => {
                    if (AuthService.isAdmin()) {
                        getAllEnrollments()
                    } else {
                        getUserEnrollments()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(10) // Reset pagination on search
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    const sortEnrollments = (enrollments) => {
        return [...enrollments].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'enrollmentId':
                    aValue = a.enrollmentId;
                    bValue = b.enrollmentId;
                    break;
                case 'userId':
                    aValue = a.userId;
                    bValue = b.userId;
                    break;
                case 'userName':
                    aValue = users.find(u => u.userId == a.userId)?.username || '';
                    bValue = users.find(u => u.userId == b.userId)?.username || '';
                    break;
                case 'courseId':
                    aValue = a.courseId;
                    bValue = b.courseId;
                    break;
                case 'courseName':
                    aValue = courses.find(c => c.courseId == a.courseId)?.title || '';
                    bValue = courses.find(c => c.courseId == b.courseId)?.title || '';
                    break;
                case 'enrollmentDate':
                    aValue = new Date(a.enrollmentDate);
                    bValue = new Date(b.enrollmentDate);
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
                    <h2 className="list-title mb-0">{AuthService.isAdmin() ? 'All Enrollments' : 'My Enrollments'}</h2>
                    {AuthService.isAdmin() && (
                        <Link to="/add-enrollment" className="btn btn-success btn-lg add-button" title="Add a new enrollment">
                            <i className="fas fa-plus me-2"></i>Add Enrollment
                        </Link>
                    )}
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">{AuthService.isAdmin() ? 'Loading all enrollments...' : 'Loading your enrollments...'}</p>
                    </div>
                )}

                {!loading && enrollments.length > 0 && (
                    <>
                        <div className="search-container mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={AuthService.isAdmin() ? "Search by user, course, or ID..." : "Search your courses..."}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{paddingRight: '8rem'}}
                            />
                            <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                        </div>
                        <div className="sort-container mb-4 d-flex gap-3">
                            <div className="form-group" style={{width: '150px'}}>
                                <label htmlFor="sortField" className="form-label">Sort by:</label>
                                <select
                                    id="sortField"
                                    className="form-select"
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                >
                                    <option value="enrollmentId">Enrollment ID</option>
                                    <option value="userId">User ID</option>
                                    <option value="userName">Username</option>
                                    <option value="courseId">Course ID</option>
                                    <option value="courseName">Course Name</option>
                                    <option value="enrollmentDate">Enrollment Date</option>
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
                    </>
                )}

                {selectedEnrollment && (
                    <Modal show={showModal} onHide={() => { setSelectedEnrollmentId(''); setShowModal(false); }} size="lg" centered>
                        <Modal.Header closeButton className="user-modal-header">
                            <Modal.Title className="user-modal-title">
                                <i className="fas fa-user-graduate me-2"></i>
                                Enrollment Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="user-modal-body">
                            <div className="user-profile-card">
                                <div className="user-avatar-section">
                                    <div className="user-avatar">
                                        <i className="fas fa-user-graduate"></i>
                                    </div>
                                </div>
                                <div className="user-info-section">
                                    <h2 className="user-name">
                                        <i className="fas fa-book me-2"></i>
                                        {courses.find(c => c.courseId == selectedEnrollment.courseId)?.title || 'Course'}
                                    </h2>
                                    <div className="user-details-grid">
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Student</span>
                                                <span className="detail-value">
                                                    {AuthService.isAdmin() 
                                                        ? (users.find(u => u.userId == selectedEnrollment.userId)?.username || 'User')
                                                        : (currentUser?.username || 'User')
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-book"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Course</span>
                                                <span className="detail-value">{courses.find(c => c.courseId == selectedEnrollment.courseId)?.title || 'Course'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-hashtag"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Course ID</span>
                                                <span className="detail-value">{selectedEnrollment.courseId}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-calendar-alt"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Enrollment Date</span>
                                                <span className="detail-value">{new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-stats">
                                        <div className="stat-item">
                                            <i className="fas fa-hashtag"></i>
                                            <span>Enrollment ID</span>
                                            <span className="stat-number">{selectedEnrollment.enrollmentId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                )}

                {!loading && filteredEnrollments.length === 0 && (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-user-graduate fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">
                            {searchTerm 
                                ? 'No enrollments match your search' 
                                : (AuthService.isAdmin() ? 'No enrollments found' : 'You are not enrolled in any courses yet')
                            }
                        </h4>
                        <p className="empty-text">
                            {searchTerm 
                                ? 'Try adjusting your search terms.' 
                                : (AuthService.isAdmin() ? 'No students have enrolled in courses yet.' : 'Browse available courses to get started!')
                            }
                        </p>
                        {!searchTerm && !AuthService.isAdmin() && (
                            <Link to="/courses" className="btn btn-primary mt-3">
                                <i className="fas fa-book me-2"></i>Browse Courses
                            </Link>
                        )}
                    </div>
                )}

                {!loading && filteredEnrollments.length > 0 && (
                    <>
                        <div className="list-card-container">
                            {filteredEnrollments.slice(0, visibleCount).map(enrollment => (
                            <div key={enrollment.enrollmentId} className="list-card user-card text-center" onClick={() => setSelectedEnrollmentId(enrollment.enrollmentId)} style={{cursor: 'pointer'}}>
                                    <div className="user-card-header">
                                        <div className="user-card-avatar">
                                            <i className="fas fa-user-graduate"></i>
                                        </div>
                                    </div>
                                    <div className="user-card-body">
                                        <h5 className="card-title">
                                            <i className="fas fa-book me-2"></i>
                                            {courses.find(c => c.courseId == enrollment.courseId)?.title || 'Course'}
                                        </h5>
                                        <div className="user-card-info">
                                            {AuthService.isAdmin() && (
                                                <div className="info-item">
                                                    <i className="fas fa-user"></i>
                                                    <span className="info-label">Student</span>
                                                    <span className="info-value">{users.find(u => u.userId == enrollment.userId)?.username || 'User'}</span>
                                                </div>
                                            )}
                                            <div className="info-item">
                                                <i className="fas fa-calendar-plus"></i>
                                                <span className="info-label">Enrolled</span>
                                                <span className="info-value">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="user-card-meta">
                                            <div className="meta-item">
                                                <i className="fas fa-hashtag"></i>
                                                <span>Course ID: {enrollment.courseId}</span>
                                            </div>
                                            {AuthService.isAdmin() && (
                                                <div className="meta-item">
                                                    <i className="fas fa-hashtag"></i>
                                                    <span>User ID: {enrollment.userId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-actions mt-3 d-flex gap-2">
                                        <Link
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            to={`/courses/${enrollment.courseId}`}
                                            title="View course details"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fas fa-eye me-1"></i>View Course
                                        </Link>
                                        {AuthService.isAdmin() && (
                                            <Link
                                                className="btn btn-outline-secondary btn-sm flex-fill"
                                                to={`/edit-enrollment/${enrollment.enrollmentId}`}
                                                title="Edit this enrollment"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fas fa-edit me-1"></i>Edit
                                            </Link>
                                        )}
                                        <button
                                            className="btn btn-outline-danger btn-sm flex-fill"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteEnrollment(enrollment.enrollmentId);
                                            }}
                                            title="Unenroll from this course"
                                        >
                                            <i className="fas fa-times me-1"></i>Unenroll
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredEnrollments.length > visibleCount && (
                            <div className="text-center mt-4">
                                <button className="btn btn-secondary" onClick={loadMore}>
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ListEnrollmentComponent
