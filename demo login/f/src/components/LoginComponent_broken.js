import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/AuthService';
import './LoginComponent.css';

const LoginComponent = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'demo'

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For now, use demo login with form credentials
      // In production, this would call AuthService.login()
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        const data = await AuthService.demoLogin('admin');
        login(data, data.token);
        navigate(from, { replace: true });
      } else if (credentials.username === 'user' && credentials.password === 'user123') {
        const data = await AuthService.demoLogin('user');
        login(data, data.token);
        navigate(from, { replace: true });
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (accountType) => {
    setError('');
    setLoading(true);

    try {
      const data = await AuthService.demoLogin(accountType);
      login(data, data.token);

      // Redirect to the page user was trying to access, or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to CodeMingle</h2>
          <p>Sign in to your account</p>
        </div>

        {/* Tab Navigation */}
        <div className="login-tabs">
          <button
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Login Form
          </button>
          <button
            className={`tab-button ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            Demo Login
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Login Form Tab */}
        {activeTab === 'form' && (
          <form onSubmit={handleFormSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* Demo Login Tab */}
        {activeTab === 'demo' && (
          <div className="demo-login">
            <p className="demo-info">
              Click below to login with demo accounts:
            </p>

            <div className="demo-buttons">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="demo-button admin"
                disabled={loading}
              >
                <i className="fas fa-user-shield"></i>
                <div>
                  <strong>Admin Login</strong>
                  <small>Full access to all features</small>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('user')}
                className="demo-button user"
                disabled={loading}
              >
                <i className="fas fa-user"></i>
                <div>
                  <strong>User Login</strong>
                  <small>Standard user access</small>
                </div>
              </button>
            </div>

            <div className="demo-credentials">
              <h4>Demo Credentials:</h4>
              <div className="credential-item">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="credential-item">
                <strong>User:</strong> user / user123
              </div>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/register')}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
