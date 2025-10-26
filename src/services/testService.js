// =========================
// 📘 TestService.js (updated)
// =========================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// helper build querystring từ object filters
const toQuery = (obj = {}) => {
  const q = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

const TestService = {
  // Create
  createTest: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create test: ${await res.text()}`);
    const data = await res.json();
    return data.test || data;
  },

  // All (có filters)
  getAllTests: async (filters = {}) => {
    const res = await fetch(`${API_BASE_URL}/tests${toQuery(filters)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // My tests (có filters, cần JWT)
  getMyTests: async (filters = {}) => {
    const res = await fetch(`${API_BASE_URL}/tests/my-tests${toQuery(filters)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch my tests: ${await res.text()}`);
    const data = await res.json();
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // By ID
  getTestById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch test: ${await res.text()}`);
    const data = await res.json();
    return data.test || data;
    // service/getTestById trả về { message, test } -> vẫn OK
  },

  // Update (JWT)
  updateTest: async (id, payload) => {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update test: ${await res.text()}`);
    const data = await res.json();
    return data.test || data;
  },

  // Soft delete (JWT) -> DELETE /api/tests/:id (controller.softDeleteTest)
  softDeleteTest: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to soft delete: ${await res.text()}`);
    return res.json(); // { success, message, test }
  },

  // Hard delete (JWT) -> DELETE /api/tests/:id/hard-delete (controller.hardDeleteTest)
  hardDeleteTest: async (id) => {
    const url = `${API_BASE_URL}/tests/${id}/hard-delete`;
    const headers = getAuthHeaders();
    
    console.log('Hard delete request:', {
      url,
      method: 'DELETE',
      headers,
      testId: id
    });
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    console.log('Hard delete response status:', res.status);
    const responseText = await res.text();
    console.log('Hard delete response text:', responseText);
    
    if (!res.ok) {
      let errorMessage = `Failed to hard delete (${res.status})`;
      
      // Handle specific error cases
      if (res.status === 404) {
        errorMessage = 'Test not found or endpoint not available';
      } else if (res.status === 403) {
        errorMessage = 'Access denied - you do not have permission to delete this test';
      } else if (res.status === 401) {
        errorMessage = 'Authentication required - please login again';
      } else {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage += `: ${responseText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
      return { success: true, message: responseText };
    }
  },

  // Search
  searchTests: async (q) => {
    const res = await fetch(`${API_BASE_URL}/tests/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`Failed to search tests: ${await res.text()}`);
    const data = await res.json();
    return data.tests || data;
  },

  // By topic (mainTopic[/subTopic])
  getTestsByTopic: async (mainTopic, subTopic) => {
    const url = subTopic
      ? `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}`
      : `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch by topic: ${await res.text()}`);
    const data = await res.json();
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // By type (multiple_choice | grammar | vocabulary)
  getTestsByType: async (testType) => {
    const res = await fetch(`${API_BASE_URL}/tests/type/${testType}`);
    if (!res.ok) throw new Error(`Failed to fetch by type: ${await res.text()}`);
    const data = await res.json();
    return data.tests || data;
  },

  // ======= Topics/Sub-topics per type (khớp controller) =======
  // Multiple Choice topics
  getAllMultipleChoicesTests: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices`);
    if (!res.ok) throw new Error(`Failed to fetch MC tests: ${await res.text()}`);
    const data = await res.json();
    return data.tests || data;
  },
  getAllMultipleChoiceMainTopics: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices/main-topics`);
    if (!res.ok) throw new Error(`Failed to fetch MC main topics: ${await res.text()}`);
    const data = await res.json();
    return data.mainTopics || data || [];
  },
  getMultipleChoiceSubTopicsByMainTopic: async (mainTopic) => {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices/sub-topics/${encodeURIComponent(mainTopic)}`);
    if (!res.ok) throw new Error(`Failed to fetch MC sub topics: ${await res.text()}`);
    const data = await res.json();
    return data.subTopics || data || [];
  },

  // Grammar topics
  getAllGrammarsTests: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/grammars`);
    if (!res.ok) throw new Error(`Failed to fetch grammar tests: ${await res.text()}`);
    const data = await res.json();
    return data.tests || data;
  },
  getAllGrammarsMainTopics: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/grammars/main-topics`);
    if (!res.ok) throw new Error(`Failed to fetch grammar main topics: ${await res.text()}`);
    const data = await res.json();
    return data.mainTopics || data || [];
  },
  getGrammarSubTopicsByMainTopic: async (mainTopic) => {
    const res = await fetch(`${API_BASE_URL}/tests/grammars/sub-topics/${encodeURIComponent(mainTopic)}`);
    if (!res.ok) throw new Error(`Failed to fetch grammar sub topics: ${await res.text()}`);
    const data = await res.json();
    return data.subTopics || data || [];
  },

  // Vocabulary topics
  getAllVocabulariesTests: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies`);
    if (!res.ok) throw new Error(`Failed to fetch vocabulary tests: ${await res.text()}`);
    const data = await res.json();
    return data.tests || data;
  },
  getAllVocabulariesMainTopics: async () => {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies/main-topics`);
    if (!res.ok) throw new Error(`Failed to fetch vocabulary main topics: ${await res.text()}`);
    const data = await res.json();
    return data.mainTopics || data || [];
  },
  getVocabularySubTopicsByMainTopic: async (mainTopic) => {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies/sub-topics/${encodeURIComponent(mainTopic)}`);
    if (!res.ok) throw new Error(`Failed to fetch vocabulary sub topics: ${await res.text()}`);
    const data = await res.json();
    return data.subTopics || data || [];
  },
};

export default TestService;
