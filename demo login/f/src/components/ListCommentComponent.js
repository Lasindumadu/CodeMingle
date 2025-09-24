import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import CommentService from '../services/CommentService'
import './ListComponents.css'

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

    useEffect(() => {
        getAllComments();
    }, [])

    useEffect(() => {
        const filtered = comments.filter(comment =>
            (comment.content && comment.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (comment.userId && comment.userId.toString().includes(searchTerm)) ||
            (comment.lessonId && comment.lessonId.toString().includes(searchTerm))
        );
        setFilteredComments(sortComments(filtered));
    }, [comments, searchTerm, sortField, sortOrder])

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

    const getAllComments = () => {
        CommentService.getAllComments().then((response) => {
            setComments(response.data)
            console.log(response.data);
        }).catch(error =>{
            console.log(error);
        })
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

                {comments.length > 0 && (
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
                        <div className="sort-container mb-4 d-flex gap-3">
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
                        </div>
                    </>
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

                {filteredComments.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">{searchTerm ? 'No comments match your search' : 'No comments available'}</h4>
                        <p className="empty-text">{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first comment!'}</p>
                    </div>
                ) : (
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
                                                deleteComment(comment.commentId);
                                            }}
                                            title="Delete this comment"
                                        >
                                            <i className="fas fa-trash me-1"></i>Delete
                                        </button>
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
