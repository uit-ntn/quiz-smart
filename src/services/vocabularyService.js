const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Lấy tất cả vocabularies (không có topic, chỉ filter theo test_id, difficulty, status nếu cần)
 */
async function getAllVocabularies(filters = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const all = await response.json();

    // Áp dụng filter phía FE (vì BE trả về toàn bộ)
    let result = all;
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

    return await response.json();
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

    return await response.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/vocabularies/test/${testId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
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

const VocabularyService = {
  getAllVocabularies,
  getVocabularyById,
  searchVocabularies,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getAllVocabulariesByTestId,
  getRandomVocabularies,
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