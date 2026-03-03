import { create } from 'zustand';
import type { DrawResult, ReadingRecord, User } from '../types';

interface AppState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  
  // 当前抽牌
  currentDraw: DrawResult[] | null;
  setCurrentDraw: (draw: DrawResult[] | null) => void;
  
  // 历史记录
  readingHistory: ReadingRecord[];
  addToHistory: (record: ReadingRecord) => void;
  
  // 设置
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 用户
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // 当前抽牌
  currentDraw: null,
  setCurrentDraw: (draw) => set({ currentDraw: draw }),
  
  // 历史
  readingHistory: [],
  addToHistory: (record) => 
    set((state) => ({ 
      readingHistory: [record, ...state.readingHistory] 
    })),
  
  // 设置
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  // 加载
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
