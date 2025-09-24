import React, { useState } from 'react';

const SettingsComponent = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Persist in localStorage for now
    localStorage.setItem('cm_theme', theme);
    localStorage.setItem('cm_notifications', notifications ? '1' : '0');
    alert('Settings saved');
  };

  return (
    <div className="container mt-4">
      <h2>Settings</h2>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Theme</label>
          <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="notifications">
            Enable notifications
          </label>
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default SettingsComponent;


