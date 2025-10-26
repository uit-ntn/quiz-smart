// =========================
// 📘 src/services/multipleChoiceService.js (final)
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
    if (v !== undefined && v !== null && `${v}` !== '') p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

async function handle(res) {
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = (body && (body.message || body.error)) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body ?? { success: true };
}

const MultipleChoiceService = {
  // =========================
  // 📘 Get all multiple-choice (filters: main_topic, sub_topic, difficulty, status, test_id)
  // =========================
  async getAllMultipleChoices(filters = {}) {
    const res = await fetch(
      `${API_BASE_URL}/multiple-choices${toQuery(filters)}`,
      { method: 'GET', headers: jsonHeaders() }
    );
    const data = await handle(res);
    // Controller: { message, count, questions }
    return data.questions || (Array.isArray(data) ? data : []);
  },

  // =========================
  // 📘 Get by ID
  // =========================
  async getQuestionById(id) {
    const res = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
      method: 'GET',
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.question || data;
  },

  // =========================
  // 📘 Get all by Test ID
  // =========================
  async getQuestionsByTestId(testId) {
    const res = await fetch(`${API_BASE_URL}/multiple-choices/test/${testId}`, {
      method: 'GET',
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    return data.questions || (Array.isArray(data) ? data : []);
  },

  // =========================
  // 🟢 Create (JWT)
  // =========================
  async createMultipleChoice(payload) {
    const res = await fetch(`${API_BASE_URL}/multiple-choices`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.question || data;
  },

  // =========================
  // 🟡 Update (JWT, admin/creator)
  // =========================
  async updateMultipleChoice(id, payload) {
    const res = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.question || data;
  },

  // =========================
  // 🔴 Delete (JWT, admin/creator)
  // =========================
  async deleteMultipleChoice(id) {
    const res = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.question || data || { success: true };
  },

  // =========================
  // 🧭 Distinct main topics
  // =========================
  async getAllMultipleChoicesMainTopics() {
    const res = await fetch(`${API_BASE_URL}/multiple-choices/main-topics`, {
      method: 'GET',
      headers: jsonHeaders(),
    });
    const data = await handle(res);
    // { message, count, mainTopics }
    return data.mainTopics || data || [];
  },

  // =========================
  // 🧭 Distinct sub topics by mainTopic
  // =========================
  async getAllMultipleChoicesSubTopicsByMainTopic(mainTopic) {
    const res = await fetch(
      `${API_BASE_URL}/multiple-choices/sub-topics/${encodeURIComponent(mainTopic)}`,
      { method: 'GET', headers: jsonHeaders() }
    );
    const data = await handle(res);
    // { message, count, subTopics }
    return data.subTopics || data || [];
  },
};

export default MultipleChoiceService;


// Multiple Choice Schema Reference
/*
{
  _id: ObjectId,
  test_id: ObjectId,               // ref: tests
  question_text: String,
  options: [
    { label: "A", text: String },
    { label: "B", text: String },
    { label: "C", text: String },
    { label: "D", text: String }
  ],
  correct_answers: [String],       // ["B"] hoặc ["A","C"]
  explanation: {
    correct: String,
    incorrect_choices: {           // {"A": "...", "C": "..."}
      label: String
    }
  },
  difficulty: String,              // "easy" | "medium" | "hard"
  tags: [String],
  status: String,                  // "active" | "draft" | "archived"
  created_by: ObjectId,
  updated_by: ObjectId,
  created_at: Date,
  updated_at: Date
}

*/