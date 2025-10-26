// =========================
// 📘 src/services/testService.js (final)
// =========================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ---- Helpers
const token = () => localStorage.getItem('token') || '';
const jsonHeaders = () => ({ 'Content-Type': 'application/json' });
const authHeaders = () =>
  token() ? { ...jsonHeaders(), Authorization: `Bearer ${token()}` } : jsonHeaders();

const toQuery = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

async function handle(res) {
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // body có thể rỗng/không phải JSON (hard delete trả message đơn)
  }
  if (!res.ok) {
    const msg =
      (body && (body.message || body.error)) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body ?? { success: true };
}

// ---- Service
const TestService = {
  // CREATE (JWT)
  async createTest(payload) {
    const res = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.test || data;
  },

  // READ ALL (optional auth on BE; FE gọi public)
  async getAllTests(filters = {}) {
    const res = await fetch(`${API_BASE_URL}/tests${toQuery(filters)}`, {
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // READ MINE (JWT)
  async getMyTests(filters = {}) {
    const res = await fetch(`${API_BASE_URL}/tests/my-tests${toQuery(filters)}`, {
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // READ BY ID (auth for private tests)
  async getTestById(id) {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.test || data;
  },

  // UPDATE (JWT, admin/creator)
  async updateTest(id, payload) {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.test || data;
  },

  // SOFT DELETE (JWT, admin/creator) -> DELETE /tests/:id
  async softDeleteTest(id) {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handle(res); // { success, message, test }
  },

  // HARD DELETE (JWT, admin/creator) -> DELETE /tests/:id/hard-delete
  async hardDeleteTest(id) {
    const res = await fetch(`${API_BASE_URL}/tests/${id}/hard-delete`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handle(res); // { success, message }
  },

  // SEARCH (auth to include private tests)
  async searchTests(q) {
    const res = await fetch(`${API_BASE_URL}/tests/search?q=${encodeURIComponent(q)}`, {
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.tests || data;
  },

  // BY TOPIC (auth to include private tests)
  async getTestsByTopic(mainTopic, subTopic) {
    const url = subTopic
      ? `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}`
      : `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await handle(res);
    return data.tests || (Array.isArray(data) ? data : []);
  },

  // BY TYPE (auth to include private tests)
  async getTestsByType(testType) {
    const res = await fetch(`${API_BASE_URL}/tests/type/${testType}`, {
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.tests || data;
  },

  // ===== MC ===== (auth to include private tests)
  async getAllMultipleChoicesTests() {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices`, { headers: authHeaders() });
    const data = await handle(res);
    return data.tests || data;
  },
  async getAllMultipleChoiceMainTopics() {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices/main-topics`, { headers: jsonHeaders() });
    const data = await handle(res);
    return data.mainTopics || data || [];
  },
  async getMultipleChoiceSubTopicsByMainTopic(mainTopic) {
    const res = await fetch(`${API_BASE_URL}/tests/multiple-choices/sub-topics/${encodeURIComponent(mainTopic)}`, {
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.subTopics || data || [];
    },

  // ===== Grammar ===== (auth to include private tests)
  async getAllGrammarsTests() {
    const res = await fetch(`${API_BASE_URL}/tests/grammars`, { headers: authHeaders() });
    const data = await handle(res);
    return data.tests || data;
  },
  async getAllGrammarsMainTopics() {
    const res = await fetch(`${API_BASE_URL}/tests/grammars/main-topics`, { headers: jsonHeaders() });
    const data = await handle(res);
    return data.mainTopics || data || [];
  },
  async getGrammarSubTopicsByMainTopic(mainTopic) {
    const res = await fetch(`${API_BASE_URL}/tests/grammars/sub-topics/${encodeURIComponent(mainTopic)}`, {
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.subTopics || data || [];
  },

  // ===== Vocabulary ===== (auth to include private tests)
  async getAllVocabulariesTests() {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies`, { headers: authHeaders() });
    const data = await handle(res);
    return data.tests || data;
  },
  async getAllVocabulariesMainTopics() {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies/main-topics`, { headers: jsonHeaders() });
    const data = await handle(res);
    return data.mainTopics || data || [];
  },
  async getVocabularySubTopicsByMainTopic(mainTopic) {
    const res = await fetch(`${API_BASE_URL}/tests/vocabularies/sub-topics/${encodeURIComponent(mainTopic)}`, {
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.subTopics || data || [];
  },
};

export default TestService;
