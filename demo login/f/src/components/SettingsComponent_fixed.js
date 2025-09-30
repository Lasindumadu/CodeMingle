import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import authService from '../services/AuthService';

const SettingsComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings, saveSettings, resetSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Local state for form inputs
  const [formSettings, setFormSettings] = useState(settings);
  
  // Account Settings
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Update form settings when context settings change
  React.useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setFormSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await saveSettings(formSettings);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error('Settings save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        await resetSettings();
        setSuccess('Settings reset to default values.');
      } catch (err) {
        setError('Failed to reset settings. Please try again.');
      }
    }
  };

  const handleAccountDeletion = () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm account deletion.');
      return;
    }

    if (window.confirm('This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?')) {
      setLoading(true);
      
      // For demo accounts, just logout
      if (authService.isDemoAuth()) {
        setTimeout(() => {
          logout();
          setLoading(false);
          alert('Demo account session ended.');
        }, 1000);
      } else {
        // For real accounts, you would call an API endpoint
        setTimeout(() => {
          logout();
          setLoading(false);
          alert('Account deletion request submitted. You will receive a confirmation email.');
        }, 2000);
      }
    }
  };

  const exportData = () => {
    setLoading(true);
    
    // Simulate data export
    setTimeout(() => {
      const userData = {
        profile: user,
        settings: formSettings,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `codemingle-data-${user?.username || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      setLoading(false);
      setSuccess('Data exported successfully!');
    }, 1000);
  };

  if (!isAuthenticated()) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p>You need to be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <h2 className="mb-4">Settings</h2>

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

          {/* Appearance Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-palette me-2"></i>Appearance
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Theme</label>
                    <select 
                      className="form-select" 
                      value={formSettings.theme} 
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Font Size</label>
                    <select 
                      className="form-select" 
                      value={formSettings.fontSize} 
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select 
                      className="form-select" 
                      value={formSettings.language} 
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>Notifications
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      checked={formSettings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      Email Notifications
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pushNotifications"
                      checked={formSettings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="pushNotifications">
                      Push Notifications
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="courseUpdates"
                      checked={formSettings.courseUpdates}
                      onChange={(e) => handleSettingChange('courseUpdates', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="courseUpdates">
                      Course Updates
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="quizReminders"
                      checked={formSettings.quizReminders}
                      onChange={(e) => handleSettingChange('quizReminders', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="quizReminders">
                      Quiz Reminders
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="marketingEmails"
                      checked={formSettings.marketingEmails}
                      onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="marketingEmails">
                      Marketing Emails
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>Privacy
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Profile Visibility</label>
                    <select 
                      className="form-select" 
                      value={formSettings.profileVisibility} 
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check mb-3 mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showEmail"
                      checked={formSettings.showEmail}
                      onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showEmail">
                      Show Email in Profile
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showProgress"
                      checked={formSettings.showProgress}
                      onChange={(e) => handleSettingChange('showProgress', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showProgress">
                      Show Learning Progress
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-graduation-cap me-2"></i>Learning Preferences
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoplay"
                      checked={formSettings.autoplay}
                      onChange={(e) => handleSettingChange('autoplay', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoplay">
                      Autoplay Videos
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="subtitles"
                      checked={formSettings.subtitles}
                      onChange={(e) => handleSettingChange('subtitles', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="subtitles">
                      Enable Subtitles
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Default Playback Speed</label>
                    <select 
                      className="form-select" 
                      value={formSettings.playbackSpeed} 
                      onChange={(e) => handleSettingChange('playbackSpeed', e.target.value)}
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1.0">1.0x (Normal)</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2.0">2.0x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data & Account Management */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-database me-2"></i>Data & Account Management
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Export Your Data</h6>
                  <p className="text-muted small">Download a copy of your profile data, settings, and learning progress.</p>
                  <button 
                    className="btn btn-outline-info btn-sm mb-3"
                    onClick={exportData}
                    disabled={loading}
                  >
                    <i className="fas fa-download me-1"></i>
                    {loading ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
                <div className="col-md-6">
                  <h6>Reset Settings</h6>
                  <p className="text-muted small">Reset all settings to their default values.</p>
                  <button 
                    className="btn btn-outline-warning btn-sm mb-3"
                    onClick={handleResetSettings}
                  >
                    <i className="fas fa-undo me-1"></i>Reset to Defaults
                  </button>
                </div>
              </div>
              
              <hr />
              
              <div className="danger-zone">
                <h6 className="text-danger">Danger Zone</h6>
                <p className="text-muted small">
                  {authService.isDemoAuth() 
                    ? 'End your demo session and clear all demo data.' 
                    : 'Permanently delete your account and all associated data.'}
                </p>
                
                {!showDeleteConfirm ? (
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    {authService.isDemoAuth() ? 'End Demo Session' : 'Delete Account'}
                  </button>
                ) : (
                  <div className="mt-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={handleAccountDeletion}
                        disabled={loading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                      >
                        {loading ? 'Processing...' : 'Confirm Deletion'}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="d-flex justify-content-end gap-2 mb-4">
            <button 
              className="btn btn-secondary"
              onClick={() => setFormSettings(settings)}
            >
              <i className="fas fa-undo me-1"></i>Reset Changes
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              <i className="fas fa-save me-1"></i>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;