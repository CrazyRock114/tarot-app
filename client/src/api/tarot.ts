import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 塔罗牌类型
export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  arcana: string;
  number: number;
  meaning: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: number;
  orientation: 'upright' | 'reversed';
}

export interface ReadingResult {
  reading: string;
  cards: DrawnCard[];
  question?: string;
  spreadType?: string;
}

// 塔罗牌 API（极简版）
export const tarotApi = {
  // 获取所有塔罗牌
  getCards: () => api.get<TarotCard[]>('/tarot/cards'),
  
  // AI解读 - 直接调用，不存储历史
  getReading: (spreadType: string, cards: DrawnCard[], question: string): Promise<Response> => {
    return fetch('/api/tarot/reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spreadType, cards, question }),
    });
  },
};

export default api;
