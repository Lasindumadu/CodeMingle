import React, {useState, useEffect, useRef} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LessonService from '../services/LessonService'
import CourseService from '../services/CourseService'
import EnrollmentService from '../services/EnrollmentService'
import CommentService from '../services/CommentService'
import UserService from '../services/UserService'
import AuthService from '../services/AuthService'
import { useAuth } from '../context/AuthContext'
import './ListComponents.css'
import './ListLessonComponent.css'

const ListLessonComponent = () => {

    const [lessons, setLessons] = useState([])
    const [courses, setCourses] = useState([])
    const [selectedLessonId, setSelectedLessonId] = useState('')
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [filteredLessons, setFilteredLessons] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedLessonCardId, setSelectedLessonCardId] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()
    const urlSearchTerm = searchParams.get('search') || ''
    const urlSelected = searchParams.get('selected') || ''
    const [sortField, setSortField] = useState('lessonId')
    const [sortOrder, setSortOrder] = useState('asc')
    const lessonDetailRef = useRef(null)
    const [enrollmentStatus, setEnrollmentStatus] = useState({})
    const { user, isAuthenticated, isAdmin } = useAuth()
    
    // Comment-related state
    const [lessonComments, setLessonComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [showComments, setShowComments] = useState(false)
    const [loadingComments, setLoadingComments] = useState(false)

    useEffect(() => {
        getAllLessons();
        getAllCourses();
    }, [])

    useEffect(() => {
        if (isAuthenticated() && user && courses.length > 0) {
            checkEnrollmentStatus()
        }
    }, [user, courses, isAuthenticated])



    useEffect(() => {
        if (selectedLessonId) {
            const lesson = lessons.find(l => l.lessonId == selectedLessonId)
            setSelectedLesson(lesson)
        } else if (urlSelected) {
            const lesson = lessons.find(l => l.lessonId == urlSelected)
            setSelectedLesson(lesson)
            setSelectedLessonId(urlSelected)
            setSelectedLessonCardId(urlSelected)
        } else {
            setSelectedLesson(null)
        }
    }, [selectedLessonId, lessons, urlSelected])

    useEffect(() => {
        if (urlSearchTerm && searchTerm === '') {
            setSearchTerm(urlSearchTerm)
        }
    }, [urlSearchTerm])

    useEffect(() => {
        const lowerSearch = (searchTerm || urlSearchTerm).toLowerCase();

        const filtered = lessons.filter(lesson => {
            const title = lesson.title ? lesson.title.toLowerCase() : '';
            const topic = lesson.topic ? lesson.topic.toLowerCase() : '';
            const content = lesson.content ? lesson.content.toLowerCase() : '';

            // Change here: match if title, topic, content, or lessonId starts with the search term
            return (
                title.includes(lowerSearch) ||
                topic.includes(lowerSearch) ||
                content.includes(lowerSearch) ||
                (lesson.lessonId && lesson.lessonId.toString().includes(lowerSearch))
            );
        });
        setFilteredLessons(sortLessons(filtered));
    }, [lessons, searchTerm, urlSearchTerm, sortField, sortOrder]);
    

    const getAllLessons = () => {
        LessonService.getAllLessons()
            .then((response) => {
                console.log('Response data:', response.data);

                let data = response.data;

                // ✅ handle if API returns an array
                if (Array.isArray(data)) {
                    setLessons(data);
                }
                // ✅ handle if API wraps lessons in an object
                else if (data.lessons && Array.isArray(data.lessons)) {
                    setLessons(data.lessons);
                }
                else {
                    console.error('Unexpected response format:', data);
                    setLessons([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching lessons:", error);
                setLessons([]);
            });
    };

    const getAllCourses = () => {
        CourseService.getAllCourses()
            .then((response) => {
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
                setCourses([]);
            });
    };
    

    const deleteLesson = (lessonId) => {
       LessonService.deleteLesson(lessonId).then((response) =>{
        getAllLessons();
       }).catch(error =>{
           console.log(error);
       })
    }

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return 'No content available';
        const plain = content.replace(/<[^>]*>/g, '');
        return plain.length > maxLength ? plain.substring(0, maxLength) + '...' : plain;
    }

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

    const sortLessons = (lessons) => {
        return [...lessons].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'lessonId':
                    aValue = a.lessonId;
                    bValue = b.lessonId;
                    break;
                case 'title':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'topic':
                    aValue = a.topic || '';
                    bValue = b.topic || '';
                    break;
                case 'courseTitle':
                    aValue = a.courseTitle || '';
                    bValue = b.courseTitle || '';
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
        if (!user || !user.userId) return;
        
        const statusPromises = courses.map(async (course) => {
            try {
                const response = await EnrollmentService.checkUserEnrollment(user.userId, course.courseId);
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

    const isUserEnrolledInLesson = (lesson) => {
        // Admin can access all lessons
        if (isAdmin()) return true;
        
        // Check if user is enrolled in the course that contains this lesson
        return enrollmentStatus[lesson.courseId] === true;
    }

    const handleLessonSelect = (lessonId) => {
        const lesson = lessons.find(l => l.lessonId == lessonId);
        
        // Check if user has access to this lesson
        if (!isAuthenticated()) {
            // Show a more user-friendly message for non-authenticated users
            const loginMessage = document.createElement('div');
            loginMessage.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show position-fixed" 
                     style="top: 20px; right: 20px; z-index: 1050; max-width: 400px;" role="alert">
                    <i class="fas fa-sign-in-alt me-2"></i>
                    <strong>Login Required</strong><br>
                    Please log in to access lesson content.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            document.body.appendChild(loginMessage);
            setTimeout(() => {
                if (loginMessage.parentNode) {
                    loginMessage.parentNode.removeChild(loginMessage);
                }
            }, 5000);
            return;
        }
        
        if (!isUserEnrolledInLesson(lesson)) {
            // Show a more user-friendly message for non-enrolled users
            const enrollMessage = document.createElement('div');
            const courseName = courses.find(c => c.courseId === lesson.courseId)?.title || 'this course';
            enrollMessage.innerHTML = `
                <div class="alert alert-info alert-dismissible fade show position-fixed" 
                     style="top: 20px; right: 20px; z-index: 1050; max-width: 400px;" role="alert">
                    <i class="fas fa-lock me-2"></i>
                    <strong>Enrollment Required</strong><br>
                    You need to enroll in "${courseName}" to access this lesson.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            document.body.appendChild(enrollMessage);
            setTimeout(() => {
                if (enrollMessage.parentNode) {
                    enrollMessage.parentNode.removeChild(enrollMessage);
                }
            }, 5000);
            return;
        }
        
        setSelectedLessonId(lessonId)
        setSelectedLessonCardId(lessonId)
        
        // Scroll to lesson detail after a short delay to ensure it's rendered
        setTimeout(() => {
            if (lessonDetailRef.current) {
                lessonDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                })
            }
        }, 100)
    }

    // Initialize current user and load comments when lesson is selected
    useEffect(() => {
        const initializeUser = async () => {
            try {
                const username = AuthService.getUsername()
                if (username) {
                    const userResponse = await UserService.getUserByUsername(username)
                    setCurrentUser(userResponse.data)
                } else {
                    setCurrentUser(null)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
                setCurrentUser(null)
            }
        }
        
        initializeUser()
    }, [])

    // Load comments when lesson is selected
    useEffect(() => {
        if (selectedLessonId) {
            loadLessonComments(selectedLessonId)
        } else {
            setLessonComments([])
            setShowComments(false)
        }
    }, [selectedLessonId])

    // Watch for authentication changes
    useEffect(() => {
        const handleAuthChange = () => {
            const initializeUser = async () => {
                try {
                    const username = AuthService.getUsername()
                    if (username) {
                        const userResponse = await UserService.getUserByUsername(username)
                        setCurrentUser(userResponse.data)
                    } else {
                        setCurrentUser(null)
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error)
                    setCurrentUser(null)
                }
            }
            initializeUser()
        }
        
        window.addEventListener('authChanged', handleAuthChange)
        
        return () => {
            window.removeEventListener('authChanged', handleAuthChange)
        }
    }, [])

    const loadLessonComments = async (lessonId) => {
        try {
            setLoadingComments(true)
            const response = await CommentService.getAllComments()
            const allComments = response.data
            
            // Filter comments for this specific lesson
            const lessonSpecificComments = allComments.filter(comment => 
                comment.lessonId === parseInt(lessonId)
            )
            
            // Sort comments by creation date (newest first)
            lessonSpecificComments.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt)
                }
                return b.commentId - a.commentId // Fallback to ID sorting
            })
            
            setLessonComments(lessonSpecificComments)
        } catch (error) {
            console.error('Error loading lesson comments:', error)
            setLessonComments([])
        } finally {
            setLoadingComments(false)
        }
    }

    const handleSubmitComment = async (e) => {
        e.preventDefault()
        
        if (!AuthService.isAuthenticated() || !currentUser) {
            alert('Please log in to post a comment')
            return
        }
        
        if (!newComment.trim()) {
            alert('Please enter a comment')
            return
        }
        
        if (newComment.trim().length < 5) {
            alert('Comment must be at least 5 characters long')
            return
        }
        
        try {
            setIsSubmittingComment(true)
            
            const commentData = {
                userId: currentUser.userId,
                lessonId: parseInt(selectedLessonId),
                content: newComment.trim()
            }
            
            await CommentService.createComment(commentData)
            setNewComment('')
            
            // Reload comments to show the new one
            await loadLessonComments(selectedLessonId)
            
            // Show success message
            const successMessage = document.createElement('div')
            successMessage.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show position-fixed" 
                     style="top: 20px; right: 20px; z-index: 1050; max-width: 400px;" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Comment Posted!</strong><br>
                    Your comment has been added successfully.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `
            document.body.appendChild(successMessage)
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage)
                }
            }, 4000)
            
        } catch (error) {
            console.error('Error submitting comment:', error)
            alert('Failed to post comment. Please try again.')
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const canEditOrDeleteComment = (comment) => {
        // Admin can edit/delete any comment
        if (AuthService.isAdmin()) {
            return true
        }
        
        // User can only edit/delete their own comments
        if (currentUser && comment.userId === currentUser.userId) {
            return true
        }
        
        return false
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return
        }
        
        try {
            await CommentService.deleteComment(commentId)
            
            // Reload comments to reflect the deletion
            await loadLessonComments(selectedLessonId)
            
            // Show success message
            const successMessage = document.createElement('div')
            successMessage.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show position-fixed" 
                     style="top: 20px; right: 20px; z-index: 1050; max-width: 400px;" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Comment Deleted!</strong><br>
                    The comment has been removed successfully.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `
            document.body.appendChild(successMessage)
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage)
                }
            }, 4000)
            
        } catch (error) {
            console.error('Error deleting comment:', error)
            alert('Failed to delete comment. Please try again.')
        }
    }

    const formatCommentDate = (dateString) => {
        if (!dateString) return 'Unknown date'
        
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffInMinutes = Math.floor((now - date) / (1000 * 60))
            
            if (diffInMinutes < 1) return 'Just now'
            if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
            
            const diffInHours = Math.floor(diffInMinutes / 60)
            if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
            
            const diffInDays = Math.floor(diffInHours / 24)
            if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
            
            return date.toLocaleDateString()
        } catch (error) {
            return 'Unknown date'
        }
    }

    const lessonsByCourse = courses.reduce((acc, course) => {
        acc[course.courseId] = lessons.filter(lesson => lesson.courseId == course.courseId)
        return acc
    }, {})

    return (
        <div className="lesson-page-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <div className="sidebar bg-light p-3 sidebar-custom">
                            <h5 className="mb-3 text-success fw-bold"><i className="fas fa-compass me-2"></i>Course Navigator</h5>
                            {courses.map(course => (
                                <div key={course.courseId} className="mb-3 border rounded p-2 bg-white shadow-sm course-card">
                                    <h6 className="bg-success text-white p-2 rounded mb-2 fw-semibold">
                                        <i className="fas fa-book me-2"></i>{course.title}
                                    </h6>
                                    <ul className="list-group list-group-flush lesson-ul">
                                        {lessonsByCourse[course.courseId]?.map(lesson => (
                                            <li key={lesson.lessonId} className={`list-group-item border-0 p-1 lesson-li ${selectedLessonCardId == lesson.lessonId ? 'bg-warning bg-opacity-25 border-start border-warning border-3' : ''}`}>
                                                <button
                                                    className={`btn p-0 text-decoration-none w-100 text-start lesson-button ${selectedLessonCardId == lesson.lessonId ? 'text-warning fw-bold selected' : 'text-dark'}`}
                                                    onClick={() => handleLessonSelect(lesson.lessonId)}
                                                >
                                                    <i className="fas fa-chalkboard-teacher me-1"></i><span className="lesson-title">{lesson.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="list-header d-flex justify-content-between align-items-center mb-4">
                            <h2 className="list-title mb-0">Lessons</h2>
                            <Link to="/add-lesson" className="btn btn-success btn-lg add-button" title="Add a new lesson">
                                <i className="fas fa-plus me-2"></i>Add Lesson
                            </Link>
                        </div>

                        {lessons.length > 0 && (
                            <div className="search-container mb-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title, topic, content, or ID..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                style={{paddingRight: '8rem'}}
                                />
                                <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                            </div>
                        )}

                        {lessons.length > 0 && (
                            <div className="sort-container mb-4 d-flex gap-3">
                                <div className="form-group" style={{width: '150px'}}>
                                    <label htmlFor="sortField" className="form-label">Sort by:</label>
                                    <select
                                        id="sortField"
                                        className="form-select"
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value)}
                                    >
                                        <option value="lessonId">ID</option>
                                        <option value="title">Title</option>
                                        <option value="topic">Topic</option>
                                        <option value="courseTitle">Course</option>
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

                        {selectedLesson && (
                            <div ref={lessonDetailRef} className="lesson-detail-card mb-4">
                                <div className="lesson-detail-header">
                                    <h3 className="lesson-detail-title">{selectedLesson.title}</h3>
                                    {selectedLesson.topic && (
                                        <div className="mt-1">
                                            <i className="fas fa-stream me-2"></i>{selectedLesson.topic}
                                        </div>
                                    )}
                                </div>
                                <div className="lesson-detail-body">
                                    <div className="lesson-meta">
                                        <span className="lesson-chip"><i className="fas fa-hashtag me-1"></i>ID: {selectedLesson.lessonId}</span>
                                        {selectedLesson.courseTitle && (
                                            <span className="lesson-chip"><i className="fas fa-book me-1"></i>{selectedLesson.courseTitle}</span>
                                        )}
                                    </div>
                                    {/* Mini Table of Contents */}
                                    {selectedLesson.content && (
                                        <div className="lesson-toc">
                                            <h6 className="mb-2"><i className="fas fa-list me-2"></i>Contents</h6>
                                            <ul>
                                                {(selectedLesson.content.match(/<h2[\s\S]*?>[\s\S]*?<\/h2>/gi) || []).map((h2, idx) => {
                                                    const text = h2.replace(/<[^>]*>/g, '').trim();
                                                    return <li key={idx}>{text}</li>
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="lesson-content-html">
                                        {selectedLesson.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }}></div>
                                        ) : (
                                            <p>No content available</p>
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    <div className="lesson-comments-section mt-5 pt-4 border-top">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">
                                                <i className="fas fa-comments me-2"></i>
                                                Discussion ({lessonComments.length})
                                            </h5>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => setShowComments(!showComments)}
                                            >
                                                <i className={`fas fa-chevron-${showComments ? 'up' : 'down'} me-1`}></i>
                                                {showComments ? 'Hide Comments' : 'Show Comments'}
                                            </button>
                                        </div>

                                        {showComments && (
                                            <div className="comments-container">
                                                {/* Add Comment Form */}
                                                {AuthService.isAuthenticated() && currentUser ? (
                                                    <div className="add-comment-form mb-4 p-3 bg-light rounded">
                                                        <h6 className="mb-3">
                                                            <i className="fas fa-plus-circle me-2"></i>
                                                            Add Your Comment
                                                        </h6>
                                                        <form onSubmit={handleSubmitComment}>
                                                            <div className="mb-3">
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="3"
                                                                    placeholder="Share your thoughts about this lesson..."
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    disabled={isSubmittingComment}
                                                                    maxLength="1000"
                                                                />
                                                                <div className="form-text">
                                                                    {newComment.length}/1000 characters
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    <i className="fas fa-info-circle me-1"></i>
                                                                    Minimum 5 characters required
                                                                </small>
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-primary"
                                                                    disabled={isSubmittingComment || newComment.trim().length < 5}
                                                                >
                                                                    {isSubmittingComment ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                            Posting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-paper-plane me-2"></i>
                                                                            Post Comment
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <div className="login-prompt mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                                        <div className="text-center">
                                                            <i className="fas fa-sign-in-alt fa-2x text-warning mb-2"></i>
                                                            <h6 className="mb-2">Join the Discussion</h6>
                                                            <p className="mb-2 text-muted">Please log in to share your thoughts and engage with other learners.</p>
                                                            <Link to="/login" className="btn btn-warning btn-sm">
                                                                <i className="fas fa-sign-in-alt me-1"></i>
                                                                Log In to Comment
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Comments List */}
                                                <div className="comments-list">
                                                    {loadingComments ? (
                                                        <div className="text-center py-4">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading comments...</span>
                                                            </div>
                                                            <p className="mt-2 text-muted">Loading comments...</p>
                                                        </div>
                                                    ) : lessonComments.length === 0 ? (
                                                        <div className="no-comments text-center py-4">
                                                            <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                                                            <h6 className="text-muted">No comments yet</h6>
                                                            <p className="text-muted mb-0">Be the first to share your thoughts about this lesson!</p>
                                                        </div>
                                                    ) : (
                                                        lessonComments.map((comment) => (
                                                            <div key={comment.commentId} className="comment-item mb-3 p-3 border rounded bg-white">
                                                                <div className="comment-header d-flex justify-content-between align-items-start mb-2">
                                                                    <div className="comment-author-info">
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="comment-avatar me-2">
                                                                                <i className="fas fa-user-circle fa-lg text-primary"></i>
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="mb-0 fw-bold">
                                                                                    {comment.userName || 'Anonymous User'}
                                                                                </h6>
                                                                                <small className="text-muted">
                                                                                    <i className="fas fa-clock me-1"></i>
                                                                                    {formatCommentDate(comment.createdAt)}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {canEditOrDeleteComment(comment) && (
                                                                        <div className="comment-actions">
                                                                            <div className="dropdown">
                                                                                <button
                                                                                    className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                                                    type="button"
                                                                                    data-bs-toggle="dropdown"
                                                                                    aria-expanded="false"
                                                                                >
                                                                                    <i className="fas fa-ellipsis-v"></i>
                                                                                </button>
                                                                                <ul className="dropdown-menu">
                                                                                    <li>
                                                                                        <Link
                                                                                            className="dropdown-item"
                                                                                            to={`/edit-comment/${comment.commentId}`}
                                                                                        >
                                                                                            <i className="fas fa-edit me-2"></i>Edit
                                                                                        </Link>
                                                                                    </li>
                                                                                    <li>
                                                                                        <button
                                                                                            className="dropdown-item text-danger"
                                                                                            onClick={() => handleDeleteComment(comment.commentId)}
                                                                                        >
                                                                                            <i className="fas fa-trash me-2"></i>Delete
                                                                                        </button>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="comment-content">
                                                                    <p className="mb-0">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredLessons.length === 0 ? (
                            <div className="empty-state text-center py-5">
                                <i className="fas fa-chalkboard-teacher fa-3x text-muted mb-3"></i>
                                <h4 className="empty-title">{searchTerm ? 'No lessons match your search' : 'No lessons available'}</h4>
                                <p className="empty-text">{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first lesson!'}</p>
                            </div>
                        ) : (
                            <>
                                {/* Group lessons under course headers */}
                                {courses.map(course => {
                                    const lessonsForCourse = filteredLessons.filter(l => (l.courseId == course.courseId) || (l.courseTitle && l.courseTitle === course.title));
                                    if (lessonsForCourse.length === 0) return null;
                                    return (
                                        <div key={course.courseId} className="mb-4">
                                            <div className="course-header-container">
                                                <h4 className="course-header-title">
                                                    <i className="fas fa-book-open"></i>
                                                    {course.title}
                                                </h4>
                                            </div>
                                            <div className="list-card-container user-card-container">
                                                {lessonsForCourse.slice(0, visibleCount).map(lesson => (
                                                    <div key={lesson.lessonId} className="list-card user-card text-center" onClick={() => handleLessonSelect(lesson.lessonId)} style={{cursor: 'pointer'}}>
                                                        <i className="fas fa-graduation-cap card-icon fa-2x text-primary mb-3"></i>
                                                        <h5 className="card-title">{lesson.title}</h5>
{lesson.topic && (
    <h6 className="card-subtitle mb-2">{lesson.topic}</h6>
)}
                                                        <p className="mb-2">
                                                            {truncateContent(lesson.content)}
                                                        </p>
                                                        <div className="card-meta mt-auto">
                                                            ID: {lesson.lessonId}
                                                            <span className="course-badge"> • Course: {lesson.courseTitle || course.title}</span>
                                                        </div>
                                                        <div className="card-actions mt-3 d-flex gap-2">
                                                            <Link
                                                                className="btn btn-outline-primary btn-sm flex-fill"
                                                                to={`/edit-lesson/${lesson.lessonId}`}
                                                                title="Edit this lesson"
                                                            >
                                                                <i className="fas fa-edit me-1"></i>Edit
                                                            </Link>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm flex-fill"
                                                                onClick={() => {
                                                                    if (window.confirm('Are you sure you want to delete this lesson?')) {
                                                                        deleteLesson(lesson.lessonId);
                                                                    }
                                                                }}
                                                                title="Delete this lesson"
                                                            >
                                                                <i className="fas fa-trash me-1"></i>Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredLessons.length > visibleCount && (
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
            </div>
        </div>
    )
}

export default ListLessonComponent;
