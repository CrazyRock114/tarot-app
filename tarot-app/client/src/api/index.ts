import axios from 'axios';

const API_URL = '/api';
let csrfToken: string | null = null;
export const setCsrfToken = (token: string | null) => { csrfToken = token; };
export const getCsrfToken = () => csrfToken;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许携带 Cookie（HttpOnly token + sessionId）
});

api.interceptors.request.use((config) => {
  // 添加 CSRF token（非 GET/OPTIONS 请求）
  if (config.method && !['get', 'options'].includes(config.method.toLowerCase())) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Handle 401 responses — auto logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Skip auto-logout for login/register requests
      const url = error.config?.url || '';
      const isSessionProbe = url.includes('/auth/me') || url.includes('/auth/csrf');
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !isSessionProbe) {
        setCsrfToken(null);
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    // CSRF token invalid — stale sessionId cookie without CSRF token
    // Call server logout to clear stuck HttpOnly cookies, then redirect
    if (error.response?.status === 403 && error.response?.data?.error === 'CSRF token invalid') {
      try {
        await api.post('/auth/logout');
      } catch {
        // ignore
      }
      setCsrfToken(null);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string; inviteCode?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
  getCsrf: () => api.get('/auth/csrf'),
};

// Readings API
export const readingsApi = {
  getAll: () => api.get('/readings'),
  getById: (id: string) => api.get(`/readings/${id}`),
  create: (data: any) => api.post('/readings', data),
  delete: (id: string) => api.delete(`/readings/${id}`),
};

// Tarot API
export const tarotApi = {
  getCards: () => api.get('/tarot/cards'),
  getCard: (id: string) => api.get(`/tarot/cards/${id}`),
  getSpreads: () => api.get('/tarot/spreads'),
  interpret: (data: { question: string; cards: any[]; readerStyle: string }) =>
    api.post('/tarot/interpret', data),
};

export default api;
