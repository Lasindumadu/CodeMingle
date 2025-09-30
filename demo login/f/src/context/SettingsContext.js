import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    darkModeVariant: 'default',
    fontSize: 'medium',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    quizReminders: true,
    marketingEmails: false,
    profileVisibility: 'public',
    showEmail: false,
    showProgress: true,
    autoplay: true,
    subtitles: false,
    playbackSpeed: '1.0',
    reducedMotion: false,
    highContrast: false
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme and font size whenever settings change
  useEffect(() => {
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  const loadSettings = () => {
    const loadedSettings = {
      theme: localStorage.getItem('cm_theme') || 'light',
      fontSize: localStorage.getItem('cm_fontSize') || 'medium',
      language: localStorage.getItem('cm_language') || 'en',
      emailNotifications: localStorage.getItem('cm_emailNotifications') !== '0',
      pushNotifications: localStorage.getItem('cm_pushNotifications') !== '0',
      courseUpdates: localStorage.getItem('cm_courseUpdates') !== '0',
      quizReminders: localStorage.getItem('cm_quizReminders') !== '0',
      marketingEmails: localStorage.getItem('cm_marketingEmails') === '1',
      profileVisibility: localStorage.getItem('cm_profileVisibility') || 'public',
      showEmail: localStorage.getItem('cm_showEmail') === '1',
      showProgress: localStorage.getItem('cm_showProgress') !== '0',
      autoplay: localStorage.getItem('cm_autoplay') !== '0',
      subtitles: localStorage.getItem('cm_subtitles') === '1',
      playbackSpeed: localStorage.getItem('cm_playbackSpeed') || '1.0'
    };
    
    setSettings(loadedSettings);
  };

  const saveSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // Save to localStorage
    Object.keys(updatedSettings).forEach(key => {
      const value = updatedSettings[key];
      if (typeof value === 'boolean') {
        localStorage.setItem(`cm_${key}`, value ? '1' : '0');
      } else {
        localStorage.setItem(`cm_${key}`, value);
      }
    });
    
    setSettings(updatedSettings);
    return Promise.resolve();
  };

  const applyTheme = (theme) => {
    const body = document.body;
    const root = document.documentElement;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme', 'midnight-variant', 'charcoal-variant', 'purple-variant', 'high-contrast');
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      root.setAttribute('data-theme', 'dark');
      
      // Apply dark theme variant if set
      const variant = settings.darkModeVariant || 'default';
      if (variant !== 'default') {
        body.classList.add(`${variant}-variant`);
      }
    } else if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.add('dark-theme');
        root.setAttribute('data-theme', 'dark');
        
        // Apply dark theme variant if set
        const variant = settings.darkModeVariant || 'default';
        if (variant !== 'default') {
          body.classList.add(`${variant}-variant`);
        }
      } else {
        body.classList.add('light-theme');
        root.setAttribute('data-theme', 'light');
      }
    } else {
      body.classList.add('light-theme');
      root.setAttribute('data-theme', 'light');
    }
    
    // Apply accessibility settings
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }
    
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  };

  const applyFontSize = (fontSize) => {
    const root = document.documentElement;
    
    switch (fontSize) {
      case 'small':
        root.style.setProperty('--base-font-size', '14px');
        root.style.setProperty('--font-scale', '0.9');
        break;
      case 'large':
        root.style.setProperty('--base-font-size', '18px');
        root.style.setProperty('--font-scale', '1.1');
        break;
      case 'medium':
      default:
        root.style.setProperty('--base-font-size', '16px');
        root.style.setProperty('--font-scale', '1');
        break;
    }
  };

  const resetSettings = () => {
    const settingsKeys = [
      'cm_theme', 'cm_fontSize', 'cm_language',
      'cm_emailNotifications', 'cm_pushNotifications', 'cm_courseUpdates',
      'cm_quizReminders', 'cm_marketingEmails', 'cm_profileVisibility',
      'cm_showEmail', 'cm_showProgress', 'cm_autoplay', 'cm_subtitles', 'cm_playbackSpeed'
    ];
    
    settingsKeys.forEach(key => localStorage.removeItem(key));
    loadSettings();
    return Promise.resolve();
  };

  const value = {
    settings,
    saveSettings,
    loadSettings,
    resetSettings,
    applyTheme,
    applyFontSize
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};