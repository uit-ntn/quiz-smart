const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get current user profile
  getMyProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (oldPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Update user (admin)
  updateUser: async (userId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Create user (admin)
  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};

export default userService;