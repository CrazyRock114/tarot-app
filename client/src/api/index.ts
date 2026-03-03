import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
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
