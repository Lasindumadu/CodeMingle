import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import UserService from '../services/UserService'

const AddUserComponent = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('USER')
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { id } = useParams()

    const validateForm = () => {
        const newErrors = {}
        if (!username.trim()) {
            newErrors.username = 'Username is required'
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required'
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveOrUpdateUser = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        const user = { username: username.trim(), email: email.trim(), password, role }

        const promise = id ? UserService.updateUser(id, user) : UserService.createUser(user)

        promise
            .then((response) => {
                console.log(response.data)
                navigate('/users')
            })
            .catch((error) => {
                console.log(error)
                setErrors({ submit: 'Failed to save user. Please try again.' })
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    useEffect(() => {
        if (id) {
            UserService.getUserById(id)
                .then((response) => {
                    setUsername(response.data.username)
                    setEmail(response.data.email)
                    setPassword(response.data.password)
                    setRole(response.data.role || 'USER')
                })
                .catch((error) => {
                    console.log(error)
                    setErrors({ load: 'Failed to load user data' })
                })
        }
    }, [id])

    const title = () => {
        if (id) {
            return <><i className="fas fa-user-edit me-2"></i>Update User</>
        } else {
            return <span style={{color: 'white'}}><i className="fas fa-user-plus me-2"></i>Add New User</span>
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
                                    <i className="fas fa-user-edit"></i>
                                </div>
                                <h1 className="user-form-title">
                                    {title()}
                                </h1>
                            </div>
                            
                            <div className="user-form-body">
                                {errors.load && (
                                    <div className="alert alert-danger user-form-alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errors.load}
                                    </div>
                                )}
                                
                                <form onSubmit={saveOrUpdateUser} className="user-form">
                                    <div className="form-section">
                                        <div className="form-field-group">
                                            <div className="form-field">
                                                <label htmlFor="username" className="form-field-label">
                                                    <i className="fas fa-user form-field-icon"></i>
                                                    Username
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        placeholder="Enter a unique username"
                                                        name="username"
                                                        className={`form-field-input ${errors.username ? 'is-invalid' : ''}`}
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.username && (
                                                    <div className="form-field-error">
                                                        <i className="fas fa-exclamation-circle me-1"></i>
                                                        {errors.username}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-field">
                                                <label htmlFor="email" className="form-field-label">
                                                    <i className="fas fa-envelope form-field-icon"></i>
                                                    Email Address
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        placeholder="Enter email address"
                                                        name="email"
                                                        className={`form-field-input ${errors.email ? 'is-invalid' : ''}`}
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.email && (
                                                    <div className="form-field-error">
                                                        <i className="fas fa-exclamation-circle me-1"></i>
                                                        {errors.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-field-group">
                                            <div className="form-field">
                                                <label htmlFor="password" className="form-field-label">
                                                    <i className="fas fa-key form-field-icon"></i>
                                                    Password
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        placeholder="Enter a secure password"
                                                        name="password"
                                                        className={`form-field-input ${errors.password ? 'is-invalid' : ''}`}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.password && (
                                                    <div className="form-field-error">
                                                        <i className="fas fa-exclamation-circle me-1"></i>
                                                        {errors.password}
                                                    </div>
                                                )}
                                                <div className="form-field-help">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Password must be at least 6 characters long
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-field-group">
                                            <div className="form-field">
                                                <label htmlFor="role" className="form-field-label">
                                                    <i className="fas fa-user-tag form-field-icon"></i>
                                                    User Role
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-select-wrapper">
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        className={`form-field-select ${role === 'ADMIN' ? 'admin-role' : 'user-role'}`}
                                                        value={role}
                                                        onChange={(e) => setRole(e.target.value)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="USER">
                                                            User
                                                        </option>
                                                        <option value="ADMIN">
                                                            Administrator
                                                        </option>
                                                    </select>
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                <div className="form-field-help">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Select the appropriate role for this user
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {errors.submit && (
                                        <div className="alert alert-danger user-form-alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {errors.submit}
                                        </div>
                                    )}

                                    <div className="form-actions">
                                        <Link to="/users" className="btn btn-cancel">
                                            <i className="fas fa-times me-2"></i>
                                            Cancel
                                        </Link>
                                        <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Saving...
                                                </>
                                            ) : id ? (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Update User
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus me-2"></i>
                                                    Create User
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

export default AddUserComponent
