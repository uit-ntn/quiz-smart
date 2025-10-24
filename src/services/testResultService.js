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

const testResultService = {
  // Create new test result (draft)
  createTestResult: async (resultData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(resultData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating test result:', error);
      throw error;
    }
  },

  // Update test result status (draft -> active)
  updateTestResultStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating test result status:', error);
      throw error;
    }
  },

  // Get test result by ID
  getTestResultById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting test result:', error);
      throw error;
    }
  },

  // Get my test results
  getMyTestResults: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/my-results`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting my test results:', error);
      throw error;
    }
  },

  // Get user statistics
  getMyStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/my-statistics`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting my statistics:', error);
      throw error;
    }
  },

  // Get test results by test
  getTestResultsByTest: async (testId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/test/${testId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting test results by test:', error);
      throw error;
    }
  },

  // Get all test results (admin)
  getAllTestResults: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting all test results:', error);
      throw error;
    }
  },

  // Delete test result (admin)
  deleteTestResult: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting test result:', error);
      throw error;
    }
  }
};

export default testResultService;
