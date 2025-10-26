const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const GrammarService = {
  /**
   * 🔹 Lấy tất cả grammar questions (có thể filter qua query)
   * @param {Object} filters { test_id, difficulty, status }
   * @returns {Promise<Object>} JSON response
   */
  getAllGrammars: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/grammars${query ? `?${query}` : ''}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch grammar questions (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching grammar questions:', error);
      throw error;
    }
  },

  /**
   * 🔹 Lấy grammar question theo ID
   * @param {String} questionId
   * @returns {Promise<Object>}
   */
  getGrammarById: async (questionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammars/${questionId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch grammar question (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching grammar question:', error);
      throw error;
    }
  },

  /**
   * 🔹 Lấy danh sách grammar theo Test ID
   * @param {String} testId
   * @returns {Promise<Object>}
   */
  getGrammarsByTestId: async (testId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammars/test/${testId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch grammars by test ID (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching grammars by test ID:', error);
      throw error;
    }
  },

  /**
   * 🔹 Tạo mới grammar question (Admin/Teacher)
   * @param {Object} grammarData
   * @param {String} token
   * @returns {Promise<Object>}
   */
  createGrammar: async (grammarData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(grammarData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create grammar: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating grammar:', error);
      throw error;
    }
  },

  /**
   * 🔹 Cập nhật grammar question (Admin/Teacher hoặc Creator)
   * @param {String} grammarId
   * @param {Object} grammarData
   * @param {String} token
   * @returns {Promise<Object>}
   */
  updateGrammar: async (grammarId, grammarData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammars/${grammarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(grammarData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update grammar: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error updating grammar:', error);
      throw error;
    }
  },

  /**
   * 🔹 Xoá grammar question (Admin/Teacher hoặc Creator)
   * @param {String} grammarId
   * @param {String} token
   * @returns {Promise<Object>}
   */
  deleteGrammar: async (grammarId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammars/${grammarId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete grammar: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error deleting grammar:', error);
      throw error;
    }
  },
};

export default GrammarService;
