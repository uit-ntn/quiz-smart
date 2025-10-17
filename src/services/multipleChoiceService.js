const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

async function getAllQuestions(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.main_topic) queryParams.append('main_topic', filters.main_topic);
    if (filters.sub_topic) queryParams.append('sub_topic', filters.sub_topic);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${API_BASE_URL}/multiple-choices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching multiple choice questions:', error);
    throw error;
  }
}

async function getQuestionById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}

async function getRandomQuestions(count = 10, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('count', count.toString());

    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.main_topic) queryParams.append('main_topic', filters.main_topic);

    const response = await fetch(`${API_BASE_URL}/multiple-choices/random?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
}

async function getQuestionsByTopic(mainTopic, subTopic = null) {
  try {
    let url = `${API_BASE_URL}/multiple-choices/topic/${encodeURIComponent(mainTopic)}`;
    if (subTopic) url += `/${encodeURIComponent(subTopic)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching questions by topic:', error);
    throw error;
  }
}

async function searchQuestions(searchTerm) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/multiple-choices/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
}

async function getQuestionTopics() {
  try {
    const questions = await getAllQuestions({ status: 'active' });
    const topics = {};

    questions.forEach((question) => {
      if (!topics[question.main_topic]) {
        topics[question.main_topic] = new Set();
      }
      topics[question.main_topic].add(question.sub_topic);
    });

    // Convert Sets to Arrays
    Object.keys(topics).forEach((topic) => {
      topics[topic] = Array.from(topics[topic]);
    });

    return topics;
  } catch (error) {
    console.error('Error fetching question topics:', error);
    throw error;
  }
}

const MultipleChoiceService = {
  getAllQuestions,
  getQuestionById,
  getRandomQuestions,
  getQuestionsByTopic,
  searchQuestions,
  getQuestionTopics,
};

export default MultipleChoiceService;
