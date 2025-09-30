import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const USERNAME_KEY = 'username';
const AUTH_TYPE_KEY = 'authType'; // 'demo' or 'real'

// Hardcoded credentials for testing
const DEMO_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN'
  },
  user: {
    username: 'user',
    password: 'user123',
    role: 'USER'
  }
};

class AuthService {
  // Demo login with hardcoded credentials
  async demoLogin(accountType) {
    try {
      const credentials = DEMO_CREDENTIALS[accountType];

      if (!credentials) {
        throw new Error('Invalid account type. Use "admin" or "user"');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate a simple JWT-like token (in production, this would come from backend)
      const token = btoa(JSON.stringify({
        username: credentials.username,
        role: credentials.role,
        type: 'demo',
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      // Store authentication data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, credentials.role);
      localStorage.setItem(USERNAME_KEY, credentials.username);
      localStorage.setItem(AUTH_TYPE_KEY, 'demo');

      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('authChanged'));

      return {
        token,
        role: credentials.role,
        username: credentials.username,
        authType: 'demo'
      };
    } catch (error) {
      throw error;
    }
  }

  // Real user login with backend
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password
      });

      const { token, role, username: user, email } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role || 'USER');
      localStorage.setItem(USERNAME_KEY, user || username);
      localStorage.setItem(AUTH_TYPE_KEY, 'real');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return {
        ...response.data,
        authType: 'real'
      };
    } catch (error) {
      throw error;
    }
  }

  // Real user registration with backend
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData);

      const { token, role, username, email } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role || 'USER');
      localStorage.setItem(USERNAME_KEY, username);
      localStorage.setItem(AUTH_TYPE_KEY, 'real');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return {
        ...response.data,
        authType: 'real'
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(AUTH_TYPE_KEY);
    delete axios.defaults.headers.common['Authorization'];
    
    // Dispatch auth change event
    window.dispatchEvent(new CustomEvent('authChanged'));
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get stored role
  getRole() {
    return localStorage.getItem(ROLE_KEY) || 'USER';
  }

  // Get stored username
  getUsername() {
    return localStorage.getItem(USERNAME_KEY);
  }

  // Get authentication type
  getAuthType() {
    return localStorage.getItem(AUTH_TYPE_KEY) || null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode token to check if it's still valid
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  // Check if user is admin
  isAdmin() {
    return this.getRole() === 'ADMIN';
  }

  // Check if using demo authentication
  isDemoAuth() {
    return this.getAuthType() === 'demo';
  }

  // Check if using real authentication
  isRealAuth() {
    return this.getAuthType() === 'real';
  }
}

const authService = new AuthService();
export default authService;
