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
    logger.info('Attempting user registration', { email: userData.email });
    
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
        logger.error('Registration failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'Registration failed');
      }

      logger.info('Registration OTP sent successfully', { email: userData.email });
      // Note: Registration only sends OTP, no token/user data yet
      return data; // { message, email, userId }
    } catch (error) {
      logger.error('Registration error', error);
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
          // Token expired or invalid - clean immediately
          this.token = null;
          this.user = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
  async initiateGoogleLogin() {
    // Save current page for return after login
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/login' && currentPath !== '/register') {
      localStorage.setItem('authReturnTo', currentPath);
    }

    const googleAuthUrl = `${API_BASE_URL}/auth/google`;
    logger.info('Initiating Google OAuth login', {
      url: googleAuthUrl,
      currentOrigin: window.location.origin,
      currentUrl: window.location.href,
      returnTo: localStorage.getItem('authReturnTo'),
      API_BASE_URL,
      expectedCallback: `${window.location.origin}/auth/success`
    });
    
    try {
      // First, test if backend server is running with a simple health check
      const testResponse = await fetch(`${API_BASE_URL}/auth/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        throw new Error('Backend server is not running on port 8000. Please start the backend server first.');
      }
      
      logger.debug('Backend server is running, redirecting to Google OAuth', googleAuthUrl);
      
      // ✅ ĐÚNG: Redirect browser to Google OAuth  
      window.location.href = googleAuthUrl;
      
    } catch (error) {
      logger.error('Failed to initiate Google OAuth', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Backend server chưa chạy. Vui lòng khởi động backend server trên port 8000 trước khi đăng nhập Google.');
      }
      
      throw new Error(error.message || 'Failed to initiate Google login');
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
      // Store token
      this.token = token;
      localStorage.setItem('token', token);

      logger.info('Getting user profile after Google OAuth');
      // Get user profile
      try {
        const userData = await this.getCurrentUser();
        
        if (userData) {
          // Store user data
          this.user = userData;
          localStorage.setItem('user', JSON.stringify(userData));
          
          logger.info('Google OAuth login successful', {
            userId: userData._id || userData.id,
            email: userData.email,
            authProvider: userData.authProvider
          });
          
          return { user: userData, token: token };
        } else {
          throw new Error('Failed to get user data');
        }
      } catch (getUserError) {
        logger.error('Failed to get user profile after Google OAuth', {
          error: getUserError.message,
          token: token ? token.substring(0, 20) + '...' : null,
          apiUrl: `${API_BASE_URL}/auth/me`
        });
        
        // Clean up invalid token immediately
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        throw getUserError;
      }
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

  // Forgot password - send OTP
  async forgotPassword(email) {
    logger.info('Initiating forgot password process', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Forgot password failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'Forgot password request failed');
      }

      logger.info('Forgot password OTP sent successfully', { email });
      return data;
    } catch (error) {
      logger.error('Forgot password error', error);
      throw error;
    }
  }

  // Reset password with OTP
  async resetPasswordWithOTP(email, otp, newPassword) {
    logger.info('Attempting password reset with OTP', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Password reset failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'Password reset failed');
      }

      logger.info('Password reset successful', { email });
      return data;
    } catch (error) {
      logger.error('Password reset error', error);
      throw error;
    }
  }

  // Verify registration OTP
  async verifyRegistrationOTP(email, otp) {
    logger.info('Verifying registration OTP', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('OTP verification failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'OTP verification failed');
      }

      // Store token and user data if verification successful
      if (data.token && data.user) {
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      logger.info('Registration OTP verified successfully', { email });
      return data;
    } catch (error) {
      logger.error('OTP verification error', error);
      throw error;
    }
  }

  // Resend registration OTP
  async resendRegistrationOTP(email) {
    logger.info('Resending registration OTP', { email });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Resend OTP failed', { status: response.status, message: data.message });
        throw new Error(data.message || 'Failed to resend OTP');
      }

      logger.info('Registration OTP resent successfully', { email });
      return data;
    } catch (error) {
      logger.error('Resend OTP error', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
