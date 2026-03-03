import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 塔罗牌类型
export interface DrawnCard {
  card: {
    id: number;
    name: string;
    nameEn: string;
    meanings: {
      upright: string;
      reversed: string;
    };
    image?: string;
  };
  position: number;
  orientation: 'upright' | 'reversed';
  positionName?: string;
  positionDescription?: string;
}

export interface ReadingResult {
  id: string;
  spreadType: string;
  spreadName: string;
  question: string;
  cards: Array<{
    cardId: number;
    cardName: string;
    position: number;
    orientation: 'upright' | 'reversed';
    positionName?: string;
  }>;
  interpretation?: string;
  createdAt: string;
}

// 用户 API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  getProfile: () => api.get<User>('/auth/me'),
};

// 塔罗牌 API
export const tarotApi = {
  getSpreads: () => api.get('/tarot/spreads'),
  
  interpret: (spreadType: string, cards: any[], question: string) => {
    return fetch('/api/tarot/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ spreadType, cards, question }),
    });
  },
  
  saveReading: (data: {
    spreadType: string;
    spreadName: string;
    cards: any[];
    question: string;
    interpretation: string;
  }) => api.post('/tarot/readings', data),
  
  getReadings: () => api.get<ReadingResult[]>('/tarot/readings'),
  
  getReading: (id: string) => api.get<ReadingResult>(`/tarot/readings/${id}`),
  
  deleteReading: (id: string) => api.delete(`/readings/${id}`),
};

export default api;
