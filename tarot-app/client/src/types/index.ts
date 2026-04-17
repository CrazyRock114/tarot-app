// 塔罗牌类型定义
export type CardSuit = 'major' | 'wands' | 'cups' | 'swords' | 'coins';
export type CardOrientation = 'upright' | 'reversed';

export interface TarotCard {
  id: number;                    // 0-77
  name: string;                  // 牌名
  nameEn: string;                // 英文名
  suit: CardSuit;                // 牌组
  arcana: 'major' | 'minor';     // 大阿尔克那/小阿尔克那
  number?: number;               // 数字(小阿尔克那)
  image: string;                 // 图片路径
  keywords: {
    upright: string[];           // 正位关键词
    reversed: string[];          // 逆位关键词
  };
  keywordsEn?: {
    upright: string[];
    reversed: string[];
  };
  meanings: {
    upright: string;             // 正位含义
    reversed: string;            // 逆位含义
  };
  meaningsEn?: {
    upright: string;
    reversed: string;
  };
  description: string;           // 牌面描述
  element?: string;              // 元素
  planet?: string;               // 行星
  zodiac?: string;               // 星座
}

// 抽牌结果
export interface DrawResult {
  card: TarotCard;
  position: number;              // 牌阵位置
  orientation: CardOrientation;
  timestamp: number;
}

// 牌阵
export interface Spread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  positions: SpreadPosition[];
  cardCount: number;
  suitableFor: string[];         // 适用问题类型
}

export interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
}

// AI塔罗师
export interface TarotReader {
  id: string;
  name: string;
  avatar: string;
  style: 'mystic' | 'rational' | 'warm' | 'punk';
  styleName: string;
  description: string;
  prompt: string;
}

// 占卜记录
export interface ReadingRecord {
  id: string;
  userId?: string;
  question: string;
  spreadId: string;
  cards: DrawResult[];
  interpretation?: string;
  readerId?: string;
  createdAt: number;
}

// 用户
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: number;
}
