// src/services/vocabularyService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/** Build query string from filters object */
const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

/* =========================
   READ
   ========================= */

/** GET /vocabularies?test_id=&difficulty=&status=  (auth to include private tests) */
export async function getAllVocabularies(filters = {}) {
  const url = `${API_BASE_URL}/vocabularies${Object.keys(filters).length ? `?${qs(filters)}` : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.vocabularies || data || [];
}

/** GET /vocabularies/test/:testId (auth to access private test vocabularies) */
export async function getAllVocabulariesByTestId(testId) {
  const res = await fetch(`${API_BASE_URL}/vocabularies/test/${testId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.vocabularies || data || [];
}

/** GET /vocabularies/:id (auth to access private test vocabularies) */
export async function getVocabularyById(id) {
  const res = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.vocabulary || data;
}

/** GET /vocabularies/search?q=... (auth to include private tests in search) */
export async function searchVocabularies(q) {
  const res = await fetch(`${API_BASE_URL}/vocabularies/search?q=${encodeURIComponent(q)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.vocabularies || data || [];
}

/** Lấy ngẫu nhiên vocabularies từ BE data (lọc server, random client) */
export async function getRandomVocabularies(count = 10, filters = {}) {
  const list = await getAllVocabularies(filters);
  if (!list.length) return [];
  // shuffle nhẹ nhàng
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/* =========================
   WRITE (auth required)
   ========================= */

/** POST /vocabularies */
export async function createVocabulary(payload) {
  const res = await fetch(`${API_BASE_URL}/vocabularies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  const data = await res.json();
  return data.vocabulary || data;
}

/** PUT /vocabularies/:id */
export async function updateVocabulary(id, payload) {
  const res = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  const data = await res.json();
  return data.vocabulary || data;
}

/** DELETE /vocabularies/:id */
export async function deleteVocabulary(id) {
  const res = await fetch(`${API_BASE_URL}/vocabularies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  // BE trả { message, vocabulary } — nhưng cũng handle empty body
  try {
    const data = await res.json();
    return data.vocabulary || data || { success: true };
  } catch {
    return { success: true };
  }
}

/* =========================
   DEFAULT EXPORT (tiện import)
   ========================= */
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