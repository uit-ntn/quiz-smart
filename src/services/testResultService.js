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
    
    // Some endpoints might return empty body (204), handle that
    const text = await response.text();
    if (!text) return {};
    
    try {
        return JSON.parse(text);
    } catch {
        return { data: text };
    }
};

// Build query string from filters object
const buildQueryString = (params = {}) => {
    const qs = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        const val = params[key];
        if (val !== undefined && val !== null) {
            qs.append(key, val);
        }
    });
    const str = qs.toString();
    return str ? `?${str}` : '';
};

const testResultService = {
    // Create new test result (server sets status to 'active')
    createTestResult: async (resultData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(resultData)
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error creating test result:', error);
            throw error;
        }
    },

    // Update a test result by id (fields update)
    updateTestResult: async (id, updateData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error updating test result:', error);
            throw error;
        }
    },

    // Update test result status by result id (e.g., draft -> active, or soft-delete status changes)
    updateTestResultStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/${id}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error updating test result status:', error);
            throw error;
        }
    },

    // Update status for all test results of a test (by testId)
    updateStatusByTestId: async (testId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/test/${testId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating status by test id:', error);
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
            const data = await handleResponse(response);
            // Backend now returns { success: true, result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error getting test result:', error);
            throw error;
        }
    },

    // Get my test results (for current user)
    getMyTestResults: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/my-results`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, results: [...] }
            return data.results || data;
        } catch (error) {
            console.error('Error getting my test results:', error);
            throw error;
        }
    },

    // Get my statistics (for current user)
    getMyStatistics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/my-statistics`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, statistics: {...} }
            return data.statistics || data;
        } catch (error) {
            console.error('Error getting my statistics:', error);
            throw error;
        }
    },

    // Get test results by test id
    getTestResultsByTest: async (testId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/test/${testId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, results: [...] }
            return data.results || data;
        } catch (error) {
            console.error('Error getting test results by test:', error);
            throw error;
        }
    },

    // Get test results by user id
    getTestResultsByUser: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/user/${userId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, results: [...] }
            return data.results || data;
        } catch (error) {
            console.error('Error getting test results by user:', error);
            throw error;
        }
    },

    // Get all test results (admin) with optional filters (e.g., status, test_id, user_id, page, limit)
    getAllTestResults: async (filters = {}) => {
        try {
            const qs = buildQueryString(filters);
            const url = `${API_BASE_URL}/test-results${qs}`;
            console.log('Calling API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            console.log('getAllTestResults response:', data);
            
            // Handle different response formats
            if (data.results && Array.isArray(data.results)) {
                return data.results;
            } else if (Array.isArray(data)) {
                return data;
            } else if (data.success && data.results) {
                return data.results;
            } else {
                console.warn('Unexpected response format:', data);
                return [];
            }
        } catch (error) {
            console.error('Error getting all test results:', error);
            throw error;
        }
    },

    // Soft delete test result (marks as deleted) - typical DELETE route for soft delete
    softDeleteTestResult: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, message: '...', result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error soft deleting test result:', error);
            throw error;
        }
    },

    // Hard delete test result (admin only) - assumed endpoint
    hardDeleteTestResult: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/${id}/hard-delete`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, message: '...', result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error hard deleting test result:', error);
            throw error;
        }
    },

    // Restore deleted test result (assumed endpoint)
    restoreTestResult: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test-results/${id}/restore`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            // Backend now returns { success: true, message: '...', result: {...} }
            return data.result || data;
        } catch (error) {
            console.error('Error restoring test result:', error);
            throw error;
        }
    }
};

export default testResultService;
