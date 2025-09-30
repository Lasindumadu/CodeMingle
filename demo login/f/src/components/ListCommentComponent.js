import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import CommentService from '../services/CommentService'
import UserService from '../services/UserService'
import AuthService from '../services/AuthService'
import './ListComponents.css'

// Add custom styles for the attractive toggle switch filter
const filterToggleStyles = `
.comments-filter-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 15px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    min-width: 180px;
}

.comments-filter-container:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    transform: translateY(-1px);
}

.filter-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    justify-content: center;
}

.filter-toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: #ccc;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.filter-toggle-switch.active {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 10px rgba(40, 167, 69, 0.3);
}

.filter-toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #666;
}

.filter-toggle-switch.active .filter-toggle-slider {
    transform: translateX(30px);
    color: #28a745;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.filter-label {
    font-size: 0.9em;
    font-weight: 600;
    color: #495057;
    text-align: center;
    margin: 0;
    transition: color 0.3s ease;
}

.filter-label.active {
    color: #28a745;
}

.filter-stats {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75em;
    color: #6c757d;
    background: rgba(255,255,255,0.7);
    padding: 4px 8px;
    border-radius: 10px;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
}

.filter-stats.active {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.2);
}

.filter-stats-icon {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}

.filter-count-badge {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7em;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.filter-count-badge.active {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    animation: bounce 0.5s ease;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-3px); }
    60% { transform: translateY(-2px); }
}

@media (max-width: 768px) {
    .comments-filter-container {
        min-width: 160px;
        padding: 10px;
    }
    
    .filter-toggle-switch {
        width: 50px;
        height: 26px;
    }
    
    .filter-toggle-slider {
        width: 20px;
        height: 20px;
        top: 3px;
        left: 3px;
    }
    
    .filter-toggle-switch.active .filter-toggle-slider {
        transform: translateX(24px);
    }
    
    .filter-label {
        font-size: 0.8em;
    }
}
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = filterToggleStyles;
    if (!document.head.querySelector('style[data-component="comments-filter-toggle"]')) {
        styleElement.setAttribute('data-component', 'comments-filter-toggle');
        document.head.appendChild(styleElement);
    }
}

const ListCommentComponent = () => {
    const [comments, setComments] = useState([])
    const [filteredComments, setFilteredComments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedCommentId, setSelectedCommentId] = useState('')
    const [selectedComment, setSelectedComment] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [sortField, setSortField] = useState('commentId')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showMyCommentsOnly, setShowMyCommentsOnly] = useState(false)

    useEffect(() => {
        initializeData();
    }, [])

    // Watch for authentication changes
    useEffect(() => {
        const handleAuthChange = () => {
            initializeData()
        }
        
        window.addEventListener('authChanged', handleAuthChange)
        
        return () => {
            window.removeEventListener('authChanged', handleAuthChange)
        }
    }, [])

    useEffect(() => {
        let filtered = comments.filter(comment =>
            (comment.content && comment.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (comment.userId && comment.userId.toString().includes(searchTerm)) ||
            (comment.lessonId && comment.lessonId.toString().includes(searchTerm))
        );

        // Apply "Show My Comments Only" filter
        if (showMyCommentsOnly && currentUser) {
            filtered = filtered.filter(comment => comment.userId === currentUser.userId);
        }

        setFilteredComments(sortComments(filtered));
    }, [comments, searchTerm, sortField, sortOrder, showMyCommentsOnly, currentUser])

    useEffect(() => {
        if (selectedCommentId) {
            const comment = comments.find(c => c.commentId == selectedCommentId)
            setSelectedComment(comment)
            setShowModal(true)
        } else {
            setSelectedComment(null)
            setShowModal(false)
        }
    }, [selectedCommentId, comments])

    const initializeData = async () => {
        try {
            setLoading(true)
            
            // Get current user info if authenticated
            const username = AuthService.getUsername()
            if (username) {
                try {
                    const userResponse = await UserService.getUserByUsername(username)
                    setCurrentUser(userResponse.data)
                } catch (error) {
                    console.error('Error fetching user data:', error)
                    setCurrentUser(null)
                }
            } else {
                setCurrentUser(null)
            }
            
            // Get all comments
            await getAllComments()
            
        } catch (error) {
            console.error('Error initializing data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAllComments = () => {
        return CommentService.getAllComments().then((response) => {
            setComments(response.data)
            console.log(response.data);
        }).catch(error =>{
            console.log(error);
        })
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

    const deleteComment = (commentId) => {
       CommentService.deleteComment(commentId).then((response) =>{
        getAllComments();
       }).catch(error =>{
           console.log(error);
       })
    }

    const truncateContent = (content, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(10) // Reset pagination on search
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    const sortComments = (comments) => {
        return [...comments].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'commentId':
                    aValue = a.commentId;
                    bValue = b.commentId;
                    break;
                case 'userId':
                    aValue = a.userId || 0;
                    bValue = b.userId || 0;
                    break;
                case 'lessonId':
                    aValue = a.lessonId || 0;
                    bValue = b.lessonId || 0;
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
                    <h2 className="list-title mb-0">Comments</h2>
                    <Link to="/add-comment" className="btn btn-success btn-lg add-button" title="Add a new comment">
                        <i className="fas fa-plus me-2"></i>Add Comment
                    </Link>
                </div>

                {!loading && comments.length > 0 && (
                    <>
                        <div className="search-container mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by content, user ID, or lesson ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{paddingRight: '8rem'}}
                            />
                            <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                        </div>
                        <div className="sort-container mb-4 d-flex gap-3 align-items-end">
                            <div className="form-group" style={{width: '150px'}}>
                                <label htmlFor="sortField" className="form-label">Sort by:</label>
                                <select
                                    id="sortField"
                                    className="form-select"
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                >
                                    <option value="commentId">ID</option>
                                    <option value="userId">User ID</option>
                                    <option value="lessonId">Lesson ID</option>
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
                            {currentUser && AuthService.isAuthenticated() && (
                                <div className="form-group">
                                    <div className="comments-filter-container">
                                        <div className="filter-toggle-wrapper">
                                            <span className={`filter-label ${showMyCommentsOnly ? 'active' : ''}`}>
                                                <i className="fas fa-comments me-1"></i>
                                                {showMyCommentsOnly ? 'My Comments' : 'All Comments'}
                                            </span>
                                            <div 
                                                className={`filter-toggle-switch ${showMyCommentsOnly ? 'active' : ''}`}
                                                onClick={() => {
                                                    setShowMyCommentsOnly(!showMyCommentsOnly)
                                                    setVisibleCount(10) // Reset pagination when filter changes
                                                }}
                                                title={showMyCommentsOnly ? 'Switch to all comments' : 'Switch to my comments only'}
                                            >
                                                <div className="filter-toggle-slider">
                                                    <i className={`fas ${showMyCommentsOnly ? 'fa-user-check' : 'fa-users'}`}></i>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`filter-stats ${showMyCommentsOnly ? 'active' : ''}`}>
                                            <i className={`fas ${showMyCommentsOnly ? 'fa-filter' : 'fa-list'} filter-stats-icon`}></i>
                                            <span>
                                                {showMyCommentsOnly ? 'Filtered' : 'Showing all'}
                                            </span>
                                            <span className={`filter-count-badge ${showMyCommentsOnly ? 'active' : ''}`}>
                                                {filteredComments.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading comments...</p>
                    </div>
                )}

                {selectedComment && (
                    <Modal show={showModal} onHide={() => { setSelectedCommentId(''); setShowModal(false); }} size="lg" centered>
                        <Modal.Header closeButton className="user-modal-header">
                            <Modal.Title className="user-modal-title">
                                <i className="fas fa-comment me-2"></i>
                                Comment Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="user-modal-body">
                            <div className="user-profile-card">
                                <div className="user-avatar-section">
                                    <div className="user-avatar">
                                        <i className="fas fa-comment"></i>
                                    </div>
                                </div>
                                <div className="user-info-section">
                                    <h2 className="user-name">
                                        <i className="fas fa-comment me-2"></i>
                                        Comment #{selectedComment.commentId}
                                    </h2>
                                    <div className="comment-full-content" style={{marginBottom: '1rem'}}>
                                        <h4 className="comment-content-title">
                                            <i className="fas fa-quote-left me-2"></i>
                                            Comment Content
                                        </h4>
                                        <div className="comment-content-text">
                                            {selectedComment.content}
                                        </div>
                                    </div>
                                    <div className="user-details-grid">
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">User</span>
                                                <span className="detail-value">{selectedComment.userName || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-hashtag"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">User ID</span>
                                                <span className="detail-value">{selectedComment.userId}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-book-open"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Lesson</span>
                                                <span className="detail-value">{selectedComment.lessonTitle || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-hashtag"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Lesson ID</span>
                                                <span className="detail-value">{selectedComment.lessonId}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-graduation-cap"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Course</span>
                                                <span className="detail-value">{selectedComment.courseTitle || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-hashtag"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Course ID</span>
                                                <span className="detail-value">{selectedComment.courseId}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-stats">
                                        <div className="stat-item">
                                            <i className="fas fa-hashtag"></i>
                                            <span>Comment ID</span>
                                            <span className="stat-number">{selectedComment.commentId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                )}

                {!loading && filteredComments.length === 0 && (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">
                            {showMyCommentsOnly ? 'You have no comments yet' : 
                             searchTerm ? 'No comments match your search' : 
                             'No comments available'}
                        </h4>
                        <p className="empty-text">
                            {showMyCommentsOnly ? 'Start participating in discussions by adding your first comment!' :
                             searchTerm ? 'Try adjusting your search terms or disable filters.' : 
                             'Start by adding your first comment!'}
                        </p>
                    </div>
                )}

                {!loading && filteredComments.length > 0 && (
                    <>
                        <div className="list-card-container">
                            {filteredComments.slice(0, visibleCount).map(comment => (
                            <div key={comment.commentId} className="list-card user-card text-center" onClick={() => setSelectedCommentId(comment.commentId)} style={{cursor: 'pointer'}}>
                                    <div className="user-card-header">
                                        <div className="user-card-avatar">
                                            <i className="fas fa-comment"></i>
                                        </div>
                                    </div>
                                    <div className="user-card-body">
                                    <h5 className="card-title" style={{marginBottom: '1rem'}}>
                                        <i className="fas fa-comment me-2"></i>
                                        Comment #{comment.commentId}
                                    </h5>
                                    <div className="comment-content-preview" style={{marginBottom: '1rem'}}>
                                        <p className="mb-0">
                                            <strong>Content:</strong> {truncateContent(comment.content)}
                                        </p>
                                    </div>
                                        <div className="user-card-info">
                                            <div className="info-item">
                                                <i className="fas fa-user"></i>
                                                <span className="info-label">User</span>
                                                <span className="info-value">{comment.userName || 'N/A'}</span>
                                            </div>
                                            <div className="info-item">
                                                <i className="fas fa-book-open"></i>
                                                <span className="info-label">Lesson</span>
                                                <span className="info-value">{comment.lessonTitle || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="user-card-meta">
                                            <div className="meta-item">
                                                <i className="fas fa-hashtag"></i>
                                                <span>ID: {comment.commentId}</span>
                                            </div>
                                            <div className="meta-item">
                                                <i className="fas fa-user"></i>
                                                <span>User ID: {comment.userId || 'N/A'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <i className="fas fa-book-open"></i>
                                                <span>Lesson ID: {comment.lessonId || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-actions mt-3 d-flex gap-2">
                                        {canEditOrDeleteComment(comment) ? (
                                            <>
                                                <Link
                                                    className="btn btn-outline-primary btn-sm flex-fill"
                                                    to={`/edit-comment/${comment.commentId}`}
                                                    title="Edit this comment"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="fas fa-edit me-1"></i>Edit
                                                </Link>
                                                <button
                                                    className="btn btn-outline-danger btn-sm flex-fill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Are you sure you want to delete this comment?')) {
                                                            deleteComment(comment.commentId);
                                                        }
                                                    }}
                                                    title="Delete this comment"
                                                >
                                                    <i className="fas fa-trash me-1"></i>Delete
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-muted text-center flex-fill py-2">
                                                <i className="fas fa-lock me-1"></i>
                                                {AuthService.isAuthenticated() ? 'You can only edit your own comments' : 'Login to manage comments'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredComments.length > visibleCount && (
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

export default ListCommentComponent;
