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
  
  // AI解读 - 改进错误处理和超时控制
  getReading: async (spreadType: string, cards: DrawnCard[], question: string): Promise<ReadingResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35秒超时
    
    try {
      const response = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ spreadType, cards, question }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // 检查响应状态
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // 如果不是JSON响应，使用文本
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      // 解析响应
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format: expected JSON');
      }
      
      const data = await response.json();
      
      if (!data.reading) {
        throw new Error('Invalid response: missing reading field');
      }
      
      return data as ReadingResult;
    } catch (error) {
      clearTimeout(timeoutId);
      
      const err = error as Error;
      if (err.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接后重试');
      }
      
      // 网络错误处理
      if (err.message === 'Failed to fetch') {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      
      throw error;
    }
  },
};

export default api;
