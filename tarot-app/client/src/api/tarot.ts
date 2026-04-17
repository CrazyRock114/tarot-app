import axios, { AxiosInstance } from 'axios';
import i18next from 'i18next';

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
  readingId?: string;
}

// 塔罗牌 API
export const tarotApi = {
  // 获取所有塔罗牌
  getCards: () => api.get<TarotCard[]>('/tarot/cards'),
  
  // AI解读 - SSE流式
  getReadingStream: async (
    spreadType: string, 
    cards: DrawnCard[], 
    question: string, 
    save: boolean = true, 
    userId?: string,
    onChunk?: (text: string) => void,
    yesNoResult?: string | null,
    readerStyle?: string,
  ): Promise<ReadingResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时（流式不会卡住）
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ spreadType, cards, question, save, userId, yesNoResult, readerStyle }),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        clearTimeout(timeoutId);
        try {
          const errData = await response.json();
          throw new Error(errData.message || errData.error || `HTTP error! status: ${response.status}`);
        } catch (e) {
          if ((e as Error).message && !(e as Error).message.includes('JSON')) throw e;
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let readingId: string | undefined;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;
          
          try {
            const data = JSON.parse(dataStr);
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.content) {
              fullText += data.content;
              onChunk?.(fullText);
            }
            
            if (data.done && data.readingId) {
              readingId = data.readingId;
            }
          } catch (e) {
            if ((e as Error).message && !(e as Error).message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      clearTimeout(timeoutId);
      
      return {
        reading: fullText || i18next.t('apiErrors.noReading'),
        cards,
        question,
        spreadType,
        readingId,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const err = error as Error;
      if (err.name === 'AbortError') {
        throw new Error(i18next.t('apiErrors.requestTimeout'));
      }
      if (err.message === 'Failed to fetch') {
        throw new Error(i18next.t('apiErrors.networkError'));
      }
      throw error;
    }
  },

  // 兼容旧接口（非流式）
  getReading: async (spreadType: string, cards: DrawnCard[], question: string, save: boolean = true, userId?: string): Promise<ReadingResult> => {
    return tarotApi.getReadingStream(spreadType, cards, question, save, userId);
  },
};

export default api;

// Follow-up question API (SSE streaming)
export const followUpStream = async (
  readingId: string,
  question: string,
  onChunk?: (text: string) => void,
): Promise<{ answer: string; points?: number }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tarot/followup/${readingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });
    
    if (!response.ok) {
      clearTimeout(timeoutId);
      try {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || `HTTP error! status: ${response.status}`);
      } catch (e) {
        if ((e as Error).message && !(e as Error).message.includes('JSON')) throw e;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      clearTimeout(timeoutId);
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let points: number | undefined;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (!dataStr) continue;
        
        try {
          const data = JSON.parse(dataStr);
          if (data.error) throw new Error(data.error);
          if (data.content) {
            fullText += data.content;
            onChunk?.(fullText);
          }
          if (data.done && data.points !== undefined) {
            points = data.points;
          }
        } catch (e) {
          if ((e as Error).message && !(e as Error).message.includes('JSON')) throw e;
        }
      }
    }

    clearTimeout(timeoutId);
    return { answer: fullText, points };
  } catch (error) {
    clearTimeout(timeoutId);
    const err = error as Error;
    if (err.name === 'AbortError') throw new Error(i18next.t('apiErrors.requestTimeout'));
    if (err.message === 'Failed to fetch') throw new Error(i18next.t('apiErrors.networkError'));
    throw error;
  }
};
