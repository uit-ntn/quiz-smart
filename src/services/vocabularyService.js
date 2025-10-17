const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

async function getAllVocabularies(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.main_topic) queryParams.append('main_topic', filters.main_topic);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${API_BASE_URL}/vocabularies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    throw error;
  }
}

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

async function createVocabulary(vocabularyData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    throw error;
  }
}

async function updateVocabulary(id, vocabularyData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vocabularyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    throw error;
  }
}

async function deleteVocabulary(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    throw error;
  }
}

async function getVocabulariesByTopic(mainTopic, subTopic = null) {
  try {
    const filters = { main_topic: mainTopic };
    if (subTopic) filters.sub_topic = subTopic;
    return await getAllVocabularies(filters);
  } catch (error) {
    console.error('Error fetching vocabularies by topic:', error);
    throw error;
  }
}

async function getRandomVocabularies(count = 10, difficulty = null, mainTopic = null, subTopic = null) {
  try {
    const filters = { status: 'active' };
    if (difficulty) filters.difficulty = difficulty;
    if (mainTopic) filters.main_topic = mainTopic;
    if (subTopic) filters.sub_topic = subTopic;

    const allVocabularies = await getAllVocabularies(filters);

    if (!allVocabularies || allVocabularies.length === 0) return [];

    // Shuffle + slice
    const shuffled = allVocabularies.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allVocabularies.length));
  } catch (error) {
    console.error('Error fetching random vocabularies:', error);
    throw error;
  }
}

async function getQuizVocabularies(params = {}) {
  try {
    const {
      count = 10,
      difficulty = null,
      mainTopic = null,
      subTopic = null,
      random = true,
    } = params;

    const filters = { status: 'active' };
    if (difficulty) filters.difficulty = difficulty;
    if (mainTopic) filters.main_topic = mainTopic;
    if (subTopic) filters.sub_topic = subTopic;

    const vocabularies = await getAllVocabularies(filters);

    if (!vocabularies || vocabularies.length === 0)
      throw new Error('Không tìm thấy từ vựng phù hợp với tiêu chí đã chọn');

    let result = vocabularies;
    if (random) result = vocabularies.sort(() => 0.5 - Math.random());

    return result.slice(0, Math.min(count, result.length));
  } catch (error) {
    console.error('Error fetching quiz vocabularies:', error);
    throw error;
  }
}

async function getVocabularyTopics() {
  try {
    const vocabularies = await getAllVocabularies({ status: 'active' });
    const topics = {};

    vocabularies.forEach((vocab) => {
      if (!topics[vocab.main_topic]) topics[vocab.main_topic] = new Set();
      topics[vocab.main_topic].add(vocab.sub_topic);
    });

    // Convert Sets to Arrays
    Object.keys(topics).forEach((topic) => {
      topics[topic] = Array.from(topics[topic]);
    });

    return topics;
  } catch (error) {
    console.error('Error fetching vocabulary topics:', error);
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
  getVocabulariesByTopic,
  getRandomVocabularies,
  getQuizVocabularies,
  getVocabularyTopics,
};

export default VocabularyService;
