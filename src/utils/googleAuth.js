/**
 * Utility functions for Google OAuth
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Tạo Google OAuth URL với returnUrl
 * @param {string} returnUrl - URL để redirect sau khi đăng nhập thành công
 * @returns {string} Google OAuth URL
 */
export const createGoogleAuthUrl = (returnUrl = null) => {
  let url = `${API_BASE_URL}/auth/google`;
  
  if (returnUrl) {
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    url += `?returnUrl=${encodedReturnUrl}`;
  }
  
  return url;
};

/**
 * Redirect tới Google OAuth với returnUrl
 * @param {string} returnUrl - URL để redirect sau khi đăng nhập thành công
 */
export const redirectToGoogle = (returnUrl = null) => {
  const targetUrl = returnUrl || window.location.pathname + window.location.search;
  const googleUrl = createGoogleAuthUrl(targetUrl);
  window.location.href = googleUrl;
};

/**
 * Lưu current page vào localStorage và redirect tới Google
 * @param {string} customReturnUrl - URL tùy chỉnh thay vì current page
 */
export const saveAndRedirectToGoogle = (customReturnUrl = null) => {
  const returnUrl = customReturnUrl || window.location.pathname + window.location.search;
  
  // Lưu vào localStorage để sử dụng sau khi callback
  if (returnUrl && !['/login', '/register'].includes(returnUrl)) {
    localStorage.setItem('authReturnTo', returnUrl);
  }
  
  redirectToGoogle(returnUrl);
};

/**
 * Lấy saved return URL từ localStorage
 * @param {string} defaultUrl - URL mặc định nếu không có saved URL
 * @returns {string} Return URL
 */
export const getSavedReturnUrl = (defaultUrl = '/dashboard') => {
  const saved = localStorage.getItem('authReturnTo');
  localStorage.removeItem('authReturnTo'); // Clear after use
  return saved || defaultUrl;
};

/**
 * Parse returnUrl từ current URL query params
 * @returns {string|null} Return URL hoặc null
 */
export const getReturnUrlFromQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('returnUrl');
};

export default {
  createGoogleAuthUrl,
  redirectToGoogle,
  saveAndRedirectToGoogle,
  getSavedReturnUrl,
  getReturnUrlFromQuery
};