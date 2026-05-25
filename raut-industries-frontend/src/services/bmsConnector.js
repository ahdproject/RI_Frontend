import axios from 'axios';

const BMS_BASE_URL = `${
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')
}/bms`;

export const bmsConnector = axios.create({
  baseURL: BMS_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request: attach token ────────────────────────────────────────────────────
bmsConnector.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raut_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: handle 401 without importing DashboardSlice ────────────────────
let _redirecting = false;

bmsConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !_redirecting) {
      const currentPath = window.location.pathname
      const isAlreadyOnLogin = currentPath === '/login' || currentPath === '/'
      
      if (!isAlreadyOnLogin) {
        _redirecting = true;
        // Clear all auth keys
        localStorage.removeItem('raut_token');
        localStorage.removeItem('raut_user');
        // Use window.location.href for hard navigation to clear all state
        window.location.href = '/login';
        // Flag persists for the duration - will reset on new page load
      }
    }
    return Promise.reject(error);
  }
);

export default bmsConnector;