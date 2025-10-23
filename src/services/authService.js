// Authentication service for handling user login, registration, and auth state
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Enhanced logging utility
const logger = {
  info: (message, data = null) => {
    console.log(`[AuthService] ${message}`, data || '');
  },
  error: (message, error = null) => {
    console.error(`[AuthService ERROR] ${message}`, error || '');
  },
  debug: (message, data = null) => {
    console.log(`[AuthService DEBUG] ${message}`, data || '');
  }
};

// Log configuration on startup
logger.info('AuthService initialized', {
  API_BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  environment: process.env.NODE_ENV
});

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Set auth headers for API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    logger.info('Attempting user login', { email, loginUrl: `${API_BASE_URL}/auth/login` });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      logger.debug('Login response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Login failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      logger.info('Login successful', { userId: data.user?.id, email: data.user?.email });
      return data;
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      if (!this.token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout();
          throw new Error('Session expired');
        }
        throw new Error('Failed to get user profile');
      }

      const userData = await response.json();
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Google OAuth login
  initiateGoogleLogin() {
    const googleAuthUrl = `${API_BASE_URL}/auth/google`;
    logger.info('Initiating Google OAuth login', {
      url: googleAuthUrl,
      currentOrigin: window.location.origin,
      currentUrl: window.location.href,
      API_BASE_URL,
      expectedCallback: `${API_BASE_URL.replace('/api', '')}/api/auth/google/callback`
    });
    
    try {
      logger.debug('Redirecting to Google OAuth', googleAuthUrl);
      
      // Add some delay to ensure logging is visible
      setTimeout(() => {
        window.location.href = googleAuthUrl;
      }, 100);
      
    } catch (error) {
      logger.error('Failed to redirect to Google OAuth', error);
      throw new Error('Failed to initiate Google login');
    }
  }

  // Handle Google OAuth callback (called from redirect page)
  async handleGoogleCallback(token) {
    logger.info('Handling Google OAuth callback', {
      tokenReceived: !!token,
      tokenLength: token ? token.length : 0,
      currentUrl: window.location.href
    });

    try {
      if (!token) {
        logger.error('No token received from Google OAuth callback');
        throw new Error('No token received from Google OAuth');
      }

      logger.debug('Storing token from Google OAuth');
      // Store token temporarily
      this.token = token;
      localStorage.setItem('token', token);

      logger.info('Getting user profile after Google OAuth');
      // Get user profile
      const userData = await this.getCurrentUser();
      
      logger.info('Google OAuth login successful', {
        userId: userData.id,
        email: userData.email
      });
      
      return userData;
    } catch (error) {
      logger.error('Google OAuth callback error', error);
      this.logout(); // Clear any partial auth state
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Get current user data
  getCurrentUserData() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Verify token validity
  async verifyToken() {
    try {
      if (!this.token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedUser = await response.json();
      this.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
