// =========================
// 📘 src/services/testResultService.js (final)
// =========================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ---- Helpers
const getToken = () => localStorage.getItem('token') || '';
const jsonHeaders = () => ({ 'Content-Type': 'application/json' });
const authHeaders = () =>
  getToken() ? { ...jsonHeaders(), Authorization: `Bearer ${getToken()}` } : jsonHeaders();

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
    if (res.status === 401) {
      // hết hạn/không hợp lệ -> dọn local và chuyển login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      try { window.location.href = '/login'; } catch {}
    }
    const msg = (body && (body.message || body.error)) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body ?? { success: true };
}

const TestResultService = {
  // 🟢 Submit / tạo kết quả
  async createTestResult(payload) {
    const res = await fetch(`${API_BASE_URL}/test-results`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // 🟡 Cập nhật kết quả theo id
  async updateTestResult(id, payload) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // 🟡 Cập nhật status theo id (draft/active/archived/deleted...)
  async updateStatusById(id, status) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // 🟡 Cập nhật status theo testId (admin)
  async updateStatusByTestId(testId, status) {
    const res = await fetch(`${API_BASE_URL}/test-results/test/${testId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    return handle(res); // { success, message, modifiedCount }
  },

  // 📘 Lấy 1 result theo id (admin/owner)
  async getTestResultById(id) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // 📘 Lấy results của tôi
  async getMyTestResults() {
    const res = await fetch(`${API_BASE_URL}/test-results/my-results`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.results || data || [];
  },

  // 📊 Thống kê của tôi
  async getMyStatistics() {
    const res = await fetch(`${API_BASE_URL}/test-results/my-statistics`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.statistics || data;
  },

  // 📘 Lấy results theo testId (admin thấy all; user chỉ thấy của mình)
  async getTestResultsByTest(testId) {
    const res = await fetch(`${API_BASE_URL}/test-results/test/${testId}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.results || data || [];
  },

  // 📊 Thống kê theo userId (admin)
  // NOTE: route này suy ra từ controller getUserStatistics(userId).
  // Nếu router bạn đang dùng khác (vd: /test-results/user/:userId/stats),
  // hãy đổi path dưới cho khớp.
  async getUserStatistics(userId) {
    const res = await fetch(`${API_BASE_URL}/test-results/user/${userId}/statistics`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.statistics || data;
  },

  // 📘 Lấy tất cả (admin) + optional filters { test_id, user_id, status, ... }
  async getAllTestResults(filters = {}) {
    const res = await fetch(`${API_BASE_URL}/test-results${toQuery(filters)}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.results || (Array.isArray(data) ? data : []);
  },

  // 🔴 Soft delete (admin/owner)
  async softDeleteTestResult(id) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // 🔴 Hard delete (admin)
  async hardDeleteTestResult(id) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}/hard-delete`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.result || data;
  },

  // ♻️ Restore (admin)
  async restoreTestResult(id) {
    const res = await fetch(`${API_BASE_URL}/test-results/${id}/restore`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await handle(res);
    return data.result || data;
  },
};

export default TestResultService;
