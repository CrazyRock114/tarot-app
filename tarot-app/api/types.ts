// API 类型定义

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  arcana: string;
  number: number;
  meaning: string;
  meaningReversed?: string;
  image?: string;
  keywords?: { upright: string[]; reversed: string[] };
  element?: string;
  planet?: string;
}

export interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  positions: SpreadPosition[];
  cardCount: number;
  suitableFor: string[];
}

export interface DrawnCard {
  card: TarotCard;
  position: number;
  orientation: 'upright' | 'reversed';
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  points: number;
  membership?: string;
  membershipExpiry?: Date | null;
  birthday?: string;
  inviteCode?: string;
  invitedBy?: string;
  lastCheckIn?: Date | null;
  checkInStreak?: number;
  totalCheckIns?: number;
  achievements?: string[];
  dailyReadings?: number;
  lastReadingDate?: string;
}

export interface ReadingData {
  id?: string;
  userId?: string;
  question: string;
  spreadType: string;
  spreadName?: string;
  cards: DrawnCard[];
  interpretation: string;
  readerStyle?: string;
  yesNoResult?: 'yes' | 'no' | 'maybe' | null;
  followUps?: Array<{ question: string; answer: string; createdAt: Date }>;
  shareId?: string;
  isShared?: boolean;
  createdAt?: Date;
}

export interface DailyFortuneData {
  date: string;
  zodiac: string;
  userId?: string;
  cardName?: string;
  cardNameEn?: string;
  cardImage?: string;
  cardOrientation?: string;
  fortune?: string;
  overall?: number;
  love?: number;
  career?: number;
  wealth?: number;
  health?: number;
  luckyNumber?: number;
  luckyColor?: string;
  advice?: string;
}

export interface PointsLogData {
  userId: string;
  type: 'checkin' | 'share' | 'invite' | 'recharge' | 'spend' | 'subscribe' | 'lucky_draw' | 'achievement';
  amount: number;
  description?: string;
  createdAt?: Date;
}

export interface ApiRequest {
  method: string;
  url: string;
  headers: {
    authorization?: string;
    cookie?: string;
    'accept-language'?: string;
    'x-forwarded-for'?: string | string[];
    [key: string]: string | string[] | undefined;
  };
  body?: any;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
  setHeader: (key: string, value: string) => void;
  end: () => void;
}

export type RouteHandler = (req: ApiRequest, res: ApiResponse, ...params: string[]) => Promise<any>;
