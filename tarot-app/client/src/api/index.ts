import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许携带 Cookie（HttpOnly token + sessionId）
});

// Add auth token to requests (向后兼容 localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 添加 CSRF token（非 GET/OPTIONS 请求）
  if (config.method && !['get', 'options'].includes(config.method.toLowerCase())) {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Handle 401 responses — auto logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip auto-logout for login/register requests
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('csrfToken');
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
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
