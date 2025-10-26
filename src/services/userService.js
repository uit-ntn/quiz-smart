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
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorText;
    } catch {
      errorMessage = errorText || 'Network error';
    }
    console.error('API Error Response:', errorText);
    throw new Error(errorMessage);
  }
  
  const text = await response.text();
  if (!text) return {};
  
  try {
    return JSON.parse(text);
  } catch {
    return { data: text };
  }
};

const userService = {
  // Get all users (admin only)
  getAllUsers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_BASE_URL}/users?${queryParams}` : `${API_BASE_URL}/users`;
      
      console.log('Calling API:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      console.log('getAllUsers response:', data);
      
      // Handle different response formats
      if (data.users && Array.isArray(data.users)) {
        return data.users;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.success && data.users) {
        return data.users;
      } else {
        console.warn('Unexpected response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      
      // Backend returns user object directly or { user: {...} }
      return data.user || data;
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
      const data = await handleResponse(response);
      
      // Backend returns user object directly or { user: {...} }
      return data.user || data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await handleResponse(response);
      
      // Backend returns updated user object directly or { user: {...} }
      return data.user || data;
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
      const data = await handleResponse(response);
      
      // Backend returns { message: '...' }
      return data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Search users (admin only)
  searchUsers: async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      
      // Backend returns users array directly or { users: [...] }
      return data.users || data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (userId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await handleResponse(response);
      
      // Backend returns updated user object directly or { user: {...} }
      return data.user || data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user - soft delete (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      
      // Backend returns { message: 'User deleted successfully' }
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      const data = await handleResponse(response);
      
      // Backend returns created user object or { user: {...} }
      return data.user || data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};

export default userService;