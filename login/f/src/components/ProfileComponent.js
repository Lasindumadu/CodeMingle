import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileComponent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return (
      <div className="container mt-4">
        <h2>Profile</h2>
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      <div className="card mt-3">
        <div className="card-body">
          <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;


