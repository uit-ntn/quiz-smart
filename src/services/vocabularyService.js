const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Lấy tất cả vocabularies (không có topic, chỉ filter theo test_id, difficulty, status nếu cần)
 */
async function getAllVocabularies(filters = {}) {
  try {
    console.log('Calling API:', `${API_BASE_URL}/vocabularies`);
    const response = await fetch(`${API_BASE_URL}/vocabularies`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('getAllVocabularies response:', data);
    
    // Handle different response formats
    let allVocabularies = [];
    if (data.vocabularies && Array.isArray(data.vocabularies)) {
      allVocabularies = data.vocabularies;
    } else if (Array.isArray(data)) {
      allVocabularies = data;
    } else if (data.success && data.vocabularies) {
      allVocabularies = data.vocabularies;
    } else {
      console.warn('Unexpected response format:', data);
      return [];
    }

    // Áp dụng filter phía FE (vì BE trả về toàn bộ)
    let result = allVocabularies;
    if (filters.difficulty) {
      result = result.filter((v) => v.difficulty === filters.difficulty);
    }
    if (filters.status) {
      result = result.filter((v) => v.status === filters.status);
    }
    if (filters.test_id) {
      result = result.filter((v) => String(v.test_id) === String(filters.test_id));
    }

    return result;
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    throw error;
  }
}

/**
 * Lấy vocabulary theo ID
 */
async function getVocabularyById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    
    // Backend now returns { success: true, vocabulary: {...} }
    return data.vocabulary || data;
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    throw error;
  }
}

/**
 * Tìm kiếm vocabularies theo từ hoặc nghĩa
 */
async function searchVocabularies(searchTerm) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vocabularies/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    
    // Backend now returns { success: true, vocabularies: [...] }
    return data.vocabularies || data;
  } catch (error) {
    console.error('Error searching vocabularies:', error);
    throw error;
  }
}

/**
 * Tạo mới vocabulary
 */
async function createVocabulary(vocabularyData) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend now returns { success: true, vocabulary: {...} }
    return data.vocabulary || data;
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    throw error;
  }
}

/**
 * Cập nhật vocabulary
 */
async function updateVocabulary(id, vocabularyData) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend now returns { success: true, vocabulary: {...} }
    return data.vocabulary || data;
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    throw error;
  }
}

/**
 * Xóa vocabulary
 */
async function deleteVocabulary(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend now returns { success: true, message: '...', vocabulary: {...} }
    return data.vocabulary || data;
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    throw error;
  }
}

/**
 * Lấy tất cả vocabularies theo test_id
 */
async function getAllVocabulariesByTestId(testId) {
  try {
    const url = `${API_BASE_URL}/vocabularies/test/${testId}`;
    console.log('Calling API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('getAllVocabulariesByTestId response:', data);
    
    // Handle different response formats
    if (data.vocabularies && Array.isArray(data.vocabularies)) {
      return data.vocabularies;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.success && data.vocabularies) {
      return data.vocabularies;
    } else {
      console.warn('Unexpected response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vocabularies by test id:', error);
    throw error;
  }
}

/**
 * Lấy ngẫu nhiên vocabularies để làm quiz
 */
async function getRandomVocabularies(count = 10, filters = {}) {
  try {
    const allVocabularies = await getAllVocabularies(filters);
    if (!allVocabularies || allVocabularies.length === 0) return [];

    // Trộn ngẫu nhiên
    const shuffled = allVocabularies.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allVocabularies.length));
  } catch (error) {
    console.error('Error fetching random vocabularies:', error);
    throw error;
  }
}

/**
 * Lấy tất cả main topics từ vocabularies (gọi API backend)
 */
async function getAllVocabularyMainTopics() {
  try {
    console.log('Calling API:', `${API_BASE_URL}/tests/vocabularies/main-topics`);
    const response = await fetch(`${API_BASE_URL}/tests/vocabularies/main-topics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('getAllVocabularyMainTopics response:', data);
    
    // Handle different response formats
    if (data.mainTopics && Array.isArray(data.mainTopics)) {
      return data.mainTopics;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.success && data.mainTopics) {
      return data.mainTopics;
    } else {
      console.warn('Unexpected response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vocabulary main topics:', error);
    throw error;
  }
}

/**
 * Lấy sub topics theo main topic (gọi API backend)
 */
async function getVocabularySubTopicsByMainTopic(mainTopic) {
  try {
    const url = `${API_BASE_URL}/tests/vocabularies/sub-topics/${encodeURIComponent(mainTopic)}`;
    console.log('Calling API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('getVocabularySubTopicsByMainTopic response:', data);
    
    // Handle different response formats
    if (data.subTopics && Array.isArray(data.subTopics)) {
      return data.subTopics;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.success && data.subTopics) {
      return data.subTopics;
    } else {
      console.warn('Unexpected response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vocabulary sub topics:', error);
    throw error;
  }
}

/**
 * Lấy danh sách tests theo main topic và sub topic (gọi API backend)
 */
async function getVocabularyTestsByTopics(mainTopic, subTopic) {
  try {
    console.log('Fetching vocabulary tests for:', { mainTopic, subTopic });
    
    const url = `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}`;
    console.log('API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response Data:', data);
    
    // Handle different response formats
    let allTests = [];
    if (data.tests) {
      allTests = data.tests;
    } else if (Array.isArray(data)) {
      allTests = data;
    } else if (data.success && Array.isArray(data.tests)) {
      allTests = data.tests;
    } else {
      console.warn('Unexpected response format:', data);
      return [];
    }
    
    // Lọc chỉ lấy tests có test_type là 'vocabulary'
    const vocabularyTests = allTests.filter(test => test.test_type === 'vocabulary');
    console.log('Filtered vocabulary tests:', vocabularyTests);
    
    return vocabularyTests || [];
  } catch (error) {
    console.error('Error fetching vocabulary tests by topics:', error);
    throw error;
  }
}

/**
 * Lấy thông tin test theo ID (gọi API backend)
 */
async function getVocabularyTestById(testId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const test = await response.json();
    
    // Kiểm tra xem có phải vocabulary test không
    if (test.test_type !== 'vocabulary') {
      throw new Error('Test này không phải là vocabulary test');
    }
    
    return test;
  } catch (error) {
    console.error('Error fetching vocabulary test by ID:', error);
    throw error;
  }
}

/**
 * Generate vocabulary using AI (Gemini)
 */
async function generateVocabulary(generationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(generationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating vocabulary:', error);
    throw error;
  }
}

const VocabularyService = {
  getAllVocabularies,
  getVocabularyById,
  searchVocabularies,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getAllVocabulariesByTestId,
  getRandomVocabularies,
  getAllVocabularyMainTopics,
  getVocabularySubTopicsByMainTopic,
  getVocabularyTestsByTopics,
  getVocabularyTestById,
  generateVocabulary,
};

export default VocabularyService;

/*
Vocaburaly Schema sample:
{
  _id: ObjectId(),
  test_id: ObjectId("670abcd123456789..."),
  word: "curriculum",
  meaning: "chương trình học",
  example_sentence: "Our school has introduced a new curriculum.",
  main_topic: "Vocabulary",
  sub_topic: "Education",
  difficulty: "medium",
  created_by: ObjectId("adminId"),
  created_at: ISODate(),
  updated_at: ISODate()
}
*/