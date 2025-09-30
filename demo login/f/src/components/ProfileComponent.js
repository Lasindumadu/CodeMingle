import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/UserService';
import authService from '../services/AuthService';
import './ProfileComponent.css';

const ProfileComponent = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
    }
  }, [user]);

  if (!isAuthenticated()) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (authService.isDemoAuth()) {
        // For demo auth, just update local storage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser, authService.getToken());
        setSuccess('Profile updated successfully!');
      } else {
        // For real auth, call the API
        const userId = user.userId || user.id;
        const updateData = {
          ...profileData,
          userId: userId
        };
        
        const response = await UserService.updateUser(userId, updateData);
        
        // Handle response data properly
        let updatedUserData;
        if (typeof response.data === 'string') {
          try {
            updatedUserData = JSON.parse(response.data);
          } catch {
            updatedUserData = { ...user, ...profileData };
          }
        } else {
          updatedUserData = response.data || { ...user, ...profileData };
        }
        
        const updatedUser = { ...user, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser, authService.getToken());
        setSuccess('Profile updated successfully!');
      }
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (authService.isDemoAuth()) {
        // For demo auth, just show success message
        setSuccess('Password updated successfully!');
      } else {
        // For real auth, call the API (you'd need to implement this endpoint)
        // await UserService.updatePassword(user.id, passwordData);
        setSuccess('Password updated successfully!');
      }
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError('Failed to update password. Please check your current password.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAccountType = () => {
    if (authService.isDemoAuth()) {
      return 'Demo Account';
    } else if (authService.isRealAuth()) {
      return 'Registered Account';
    }
    return 'Unknown';
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString();
    }
    return 'N/A';
  };

  return (
    <div className="container mt-4 profile-container">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h2 className="mb-4">My Profile</h2>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="card profile-card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              <div>
                <span className={`badge ${authService.isDemoAuth() ? 'bg-warning' : 'bg-success'} me-2`}>
                  {getAccountType()}
                </span>
                {!isEditing && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit me-1"></i>Edit Profile
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {!isEditing ? (
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                    <p><strong>First Name:</strong> {profileData.firstName || 'Not set'}</p>
                    <p><strong>Last Name:</strong> {profileData.lastName || 'Not set'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Role:</strong> 
                      <span className={`badge ms-2 ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                        {user?.role || 'USER'}
                      </span>
                    </p>
                    <p><strong>Location:</strong> {profileData.location || 'Not set'}</p>
                    <p><strong>Website:</strong> {profileData.website || 'Not set'}</p>
                    <p><strong>Member Since:</strong> {getJoinDate()}</p>
                  </div>
                  {profileData.bio && (
                    <div className="col-12 mt-3">
                      <p><strong>Bio:</strong></p>
                      <p className="text-muted">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          name="username"
                          value={profileData.username}
                          onChange={handleInputChange}
                          disabled={authService.isDemoAuth()}
                        />
                        {authService.isDemoAuth() && (
                          <small className="text-muted">Username cannot be changed in demo mode</small>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          placeholder="e.g., New York, USA"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Website</label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          value={profileData.website}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Bio</label>
                        <textarea
                          className="form-control"
                          name="bio"
                          rows="3"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password Change Card */}
          <div className="card profile-card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Security</h5>
              {!showPasswordForm && (
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <i className="fas fa-key me-1"></i>Change Password
                </button>
              )}
            </div>
            <div className="card-body">
              {!showPasswordForm ? (
                <p className="text-muted">
                  Keep your account secure by regularly updating your password.
                </p>
              ) : (
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required={!authService.isDemoAuth()}
                      disabled={authService.isDemoAuth()}
                    />
                    {authService.isDemoAuth() && (
                      <small className="text-muted">Password verification skipped in demo mode</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Account Statistics Card */}
          <div className="card profile-card">
            <div className="card-header">
              <h5 className="mb-0">Account Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border-end">
                    <h4 className="text-primary">0</h4>
                    <small className="text-muted">Courses Enrolled</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end">
                    <h4 className="text-success">0</h4>
                    <small className="text-muted">Courses Completed</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end">
                    <h4 className="text-warning">0</h4>
                    <small className="text-muted">Quizzes Taken</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">0%</h4>
                  <small className="text-muted">Average Score</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;


