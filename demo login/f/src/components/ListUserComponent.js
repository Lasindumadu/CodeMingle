import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import UserService from '../services/UserService'
import './ListComponents.css'

const ListUserComponent = () => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedUserId, setSelectedUserId] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [sortField, setSortField] = useState('userId')
    const [sortOrder, setSortOrder] = useState('asc')

    useEffect(() => {
        getAllUsers()
    }, [])

    const sortUsers = useCallback((users) => {
        return [...users].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'userId':
                    aValue = a.userId;
                    bValue = b.userId;
                    break;
                case 'username':
                    aValue = a.username || '';
                    bValue = b.username || '';
                    break;
                case 'email':
                    aValue = a.email || '';
                    bValue = b.email || '';
                    break;
                case 'role':
                    aValue = a.role || '';
                    bValue = b.role || '';
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
    }, [sortField, sortOrder]);

    useEffect(() => {
        const filtered = users.filter(user =>
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredUsers(sortUsers(filtered));
    }, [users, searchTerm, sortUsers])

    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.userId === selectedUserId)
            setSelectedUser(user)
            setShowModal(true)
        } else {
            setSelectedUser(null)
            setShowModal(false)
        }
    }, [selectedUserId, users])

    const getAllUsers = () => {
        UserService.getAllUsers()
            .then((response) => {
                let data = response.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.error('Failed to parse response data:', e);
                        setUsers([]);
                        return;
                    }
                }
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('Expected array but got:', data);
                    setUsers([]);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const deleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            UserService.deleteUser(userId)
                .then(() => {
                    getAllUsers()
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

    return (
        <div className="list-page-container">
            <div className="container">
                <div className="list-header d-flex justify-content-between align-items-center mb-4">
                    <h2 className="list-title mb-0">Users</h2>
                    <Link to="/add-user" className="btn btn-primary btn-lg add-button" title="Add a new user">
                        <i className="fas fa-plus me-2"></i>Add User
                    </Link>
                </div>

                {users.length > 0 && (
                    <>
                        <div className="search-container mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by username or email..."
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
                                    <option value="userId">User ID</option>
                                    <option value="username">Username</option>
                                    <option value="email">Email</option>
                                    <option value="role">Role</option>
                                    <option value="createdAt">Joined Date</option>
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

                {selectedUser && (
                    <Modal show={showModal} onHide={() => { setSelectedUserId(''); setShowModal(false); }} centered size="lg">
                        <Modal.Header closeButton className="user-modal-header">
                            <Modal.Title className="user-modal-title">
                                <i className="fas fa-user-circle me-2"></i>
                                User Profile Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="user-modal-body">
                            <div className="user-profile-card">
                                <div className="user-avatar-section">
                                    <div className="user-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="user-status-badge">
                                        <i className="fas fa-circle"></i>
                                        <span>Active</span>
                                    </div>
                                </div>
                                
                                <div className="user-info-section">
                                    <h2 className="user-name">
                                        <i className="fas fa-user me-2"></i>
                                        {selectedUser.username}
                                    </h2>
                                    
                                    <div className="user-details-grid">
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-envelope"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Email Address</span>
                                                <span className="detail-value">{selectedUser.email}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-shield-alt"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Role</span>
                                                <span className={`detail-value role-badge ${selectedUser.role === 'ADMIN' ? 'admin-role' : 'user-role'}`}>
                                                    <i className={`fas ${selectedUser.role === 'ADMIN' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                                                    {selectedUser.role}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <i className="fas fa-id-card"></i>
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">User ID</span>
                                                <span className="detail-value">#{selectedUser.userId}</span>
                                            </div>
                                        </div>
                                        
                                        {selectedUser.createdAt && (
                                            <div className="detail-item">
                                                <div className="detail-icon">
                                                    <i className="fas fa-calendar-plus"></i>
                                                </div>
                                                <div className="detail-content">
                                                    <span className="detail-label">Joined Date</span>
                                                    <span className="detail-value">
                                                        <i className="fas fa-clock me-1"></i>
                                                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="user-stats">
                                        <div className="stat-item">
                                            <i className="fas fa-chart-line"></i>
                                            <span>Profile Views</span>
                                            <span className="stat-number">1,234</span>
                                        </div>
                                        <div className="stat-item">
                                            <i className="fas fa-star"></i>
                                            <span>Rating</span>
                                            <span className="stat-number">4.8</span>
                                        </div>
                                        <div className="stat-item">
                                            <i className="fas fa-trophy"></i>
                                            <span>Achievements</span>
                                            <span className="stat-number">12</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="user-modal-footer">
                            <button 
                                className="btn btn-outline-secondary me-2"
                                onClick={() => { setSelectedUserId(''); setShowModal(false); }}
                            >
                                <i className="fas fa-times me-1"></i>
                                Close
                            </button>
                            <Link 
                                to={`/edit-user/${selectedUser.userId}`}
                                className="btn btn-primary"
                                onClick={() => { setSelectedUserId(''); setShowModal(false); }}
                            >
                                <i className="fas fa-edit me-1"></i>
                                Edit Profile
                            </Link>
                        </Modal.Footer>
                    </Modal>
                )}

                {filteredUsers.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-users empty-icon fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">{searchTerm ? 'No users match your search' : 'No users available'}</h4>
                        <p className="empty-text">{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first user!'}</p>
                    </div>
                ) : (
                    <>
                        <div className="list-card-container">
                            {filteredUsers.slice(0, visibleCount).map((user) => (
                                <div key={user.userId} className="list-card user-card text-center" onClick={() => setSelectedUserId(user.userId)} style={{cursor: 'pointer'}}>
                                    <div className="user-card-header">
                                        <div className="user-card-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="user-card-status">
                                            <i className="fas fa-circle"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="user-card-body">
                                        <h5 className="card-title">
                                            <i className="fas fa-user me-2"></i>
                                            {user.username}
                                        </h5>
                                        
                                        <div className="user-card-info">
                                            <div className="info-item">
                                                <i className="fas fa-envelope"></i>
                                                <span className="info-label">Email</span>
                                                <span className="info-value">{user.email}</span>
                                            </div>
                                            
                                            <div className="info-item">
                                                <i className="fas fa-shield-alt"></i>
                                                <span className="info-label">Role</span>
                                                <span className={`role-badge ${user.role === 'ADMIN' ? 'admin-role' : 'user-role'}`}>
                                                    <i className={`fas ${user.role === 'ADMIN' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="user-card-meta">
                                            <div className="meta-item">
                                                <i className="fas fa-id-card"></i>
                                                <span>ID: {user.userId}</span>
                                            </div>
                                            {user.createdAt && (
                                                <div className="meta-item">
                                                    <i className="fas fa-calendar-plus"></i>
                                                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="card-actions mt-3 d-flex gap-2">
                                        <Link
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            to={`/edit-user/${user.userId}`}
                                            title="Edit this user"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fas fa-edit me-1"></i>Edit
                                        </Link>
                                        <button
                                            className="btn btn-outline-danger btn-sm flex-fill"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteUser(user.userId);
                                            }}
                                            title="Delete this user"
                                        >
                                            <i className="fas fa-trash me-1"></i>Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredUsers.length > visibleCount && (
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

export default ListUserComponent
