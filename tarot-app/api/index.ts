// Vercel原生Serverless Functions - 不使用Express
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量 - 使用绝对路径确保正确加载
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
// 核心API：health、tarot/cards、tarot/reading、auth/*、readings/*、tarot/spreads、tarot/interpret、daily/*

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const BASE_URL = process.env.BASE_URL || 'https://2or.com';

// 限流存储（使用内存，生产环境建议使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX = 60; // 每分钟最多60个请求

// 限流中间件
function rateLimit(req: any, res: any): boolean {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const key = Array.isArray(ip) ? ip[0] : ip;
  const now = Date.now();

  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// 连接 MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  if (!MONGODB_URI) {
    console.log('MONGODB_URI not set, skipping DB connection');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  points: { type: Number, default: 0 },
  inviteCode: { type: String, unique: true, sparse: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastCheckIn: { type: Date, default: null },
  dailyReadings: { type: Number, default: 0 },
  lastReadingDate: { type: String, default: '' },
  birthday: { type: String, default: '' },
  checkInStreak: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  achievements: [{ type: String }],
  // Membership
  membership: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
  membershipExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Reading Schema
const ReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  question: { type: String, default: '' },
  spreadType: { type: String, required: true },
  spreadName: { type: String, default: '' },
  cards: [{ 
    id: String, 
    name: String, 
    nameEn: String, 
    suit: String,
    arcana: String,
    image: String,
    meaning: String, 
    meaningReversed: String,
    position: String,
    orientation: { type: String, enum: ['upright', 'reversed'], default: 'upright' }
  }],
  interpretation: { type: String, required: true },
  readerStyle: { type: String, default: 'mystic' },
  yesNoResult: { type: String, enum: ['yes', 'no', 'maybe', null], default: null },
  followUps: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  shareId: { type: String, unique: true, sparse: true },
  isShared: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Reading = mongoose.models.Reading || mongoose.model('Reading', ReadingSchema);

// PointsLog Schema - 积分变动记录
const AnonReadingSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
});
AnonReadingSchema.index({ ip: 1, date: 1 }, { unique: true });
const AnonReading = mongoose.models.AnonReading || mongoose.model('AnonReading', AnonReadingSchema);

const DailyFortuneSchema = new mongoose.Schema({
  date: { type: String, required: true },
  zodiac: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cardName: { type: String },
  cardNameEn: { type: String },
  cardImage: { type: String },
  cardOrientation: { type: String },
  fortune: { type: String },
  overall: { type: Number, min: 1, max: 5 },
  love: { type: Number, min: 1, max: 5 },
  career: { type: Number, min: 1, max: 5 },
  wealth: { type: Number, min: 1, max: 5 },
  health: { type: Number, min: 1, max: 5 },
  luckyNumber: { type: Number },
  luckyColor: { type: String },
  advice: { type: String },
  createdAt: { type: Date, default: Date.now },
});
DailyFortuneSchema.index({ date: 1, zodiac: 1 }, { unique: true });
const DailyFortune = mongoose.models.DailyFortune || mongoose.model('DailyFortune', DailyFortuneSchema);

const PointsLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, required: true, enum: ['checkin', 'share', 'invite', 'recharge', 'spend', 'subscribe', 'lucky_draw', 'achievement'] },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const PointsLog = mongoose.models.PointsLog || mongoose.model('PointsLog', PointsLogSchema);

// Auth Middleware
const authMiddleware = async (req: any, res: any, silent = false) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!silent) res.status(401).json({ message: t(req, 'authRequired') });
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    if (!silent) res.status(401).json({ message: t(req, 'invalidToken') });
    return null;
  }
};

const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

// Language detection from request headers / user agent / query param
function detectLang(req: any): string {
  // 1. Check query param (for testing)
  const queryLang = req.query?.lang;
  if (queryLang && ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'].includes(queryLang)) {
    return queryLang;
  }

  // 2. Check cookie from frontend
  const cookieLang = req.headers.cookie?.split(';').find(c => c.trim().startsWith('i18nLang='))?.split('=')[1]?.trim();
  if (cookieLang && ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'].includes(cookieLang)) {
    return cookieLang;
  }

  // 3. Check accept-language header
  const acceptLang = req.headers['accept-language'] || '';
  const priorities = [
    { pattern: /zh-TW|zh-Hant|zh-HK/i, lang: 'zh-TW' },
    { pattern: /zh-CN/i, lang: 'zh-CN' },
    { pattern: /zh/i, lang: 'zh-CN' },
    { pattern: /ja|jp/i, lang: 'ja' },
    { pattern: /ko|kr/i, lang: 'ko' },
    { pattern: /en/i, lang: 'en' },
  ];

  for (const { pattern, lang } of priorities) {
    if (pattern.test(acceptLang)) return lang;
  }

  // 4. Default to English (not Chinese) for better internationalization
  return 'en';
}

// Multilingual server-side messages
const MSG = {
  'zh-CN': {
    authRequired: '未提供认证令牌',
    invalidToken: '无效的认证令牌',
    missingParams: '缺少必要参数',
    invalidSpreadType: '无效的牌阵类型',
    noApiKey: '服务器未配置 AI API Key',
    readingFailed: '解读失败，请重试',
    provideBirthday: '请提供生日',
    birthdaySaved: '生日已保存',
    provideDate: '请提供出生日期',
    fortuneFailed: '生成运势失败',
    fortuneFailedRetry: '生成运势失败，请稍后重试',
    invalidCards: 'Invalid cards data',
    noApiKeyClient: 'DeepSeek API key not configured',
    pointsInsufficient: '积分不足',
    pointsMsg: (cost: number, current: number) => `今日免费次数已用完，需要${cost}积分，当前积分：${current}`,
    notLoggedIn: '请注册登录',
    notLoggedInMsg: '未登录用户每天可免费体验2次',
    position: (i: number) => `位置 ${i + 1}`,
    upright: '正位',
    reversed: '逆位',
    unknown: '未知',
    readingCost: '占卜消耗',
    followUpFailed: '追问失败，请重试',
    noText: '缺少文本内容',
    ttsFailed: 'TTS生成失败',
    userNotFound: '用户不存在',
    alreadyCheckedIn: '今天已经签到过了',
    checkinSuccess: (bonusDesc: string, points: number) => `签到成功！${bonusDesc}+${points}积分`,
    shareFailed: '分享失败',
    shareNotFound: '分享不存在或已取消',
    recordNotFound: '记录不存在',
    deleteSuccess: '删除成功',
    noFollowUpContent: '缺少追问内容或解读ID',
    followUpAuthRequired: '请先登录',
    followUpPointsMsg: '追问需要1积分，当前积分不足',
    followUpReadingNotFound: '找不到原始解读记录',
    followUpCost: '追问消耗',
    aiUnavailable: 'AI服务暂时不可用，积分已退还',
    fortuneNoDay: '今日还未抽取运势',
    fortuneAlready: '今日已抽取运势，请明日再来',
    luckyDrawNoPoints: '积分不足，需要20积分',
    saveSuccess: '保存成功',
    missingFields: '请提供所有必填字段',
    passwordTooShort: '密码至少6位字符',
    emailExists: '该邮箱已注册',
    usernameExists: '该用户名已被使用',
    registerFailed: '注册失败，请重试',
    provideEmailPassword: '请提供邮箱和密码',
    wrongCredentials: '邮箱或密码错误',
    forgotInDev: '密码重置链接已发送到您的邮箱（功能开发中）',
    provideEmail: '请提供邮箱地址',
    emailNotFound: '该邮箱未注册',
    invalidPlan: '无效的订阅计划',
    pointsNotEnough: (cost: number) => `积分不足，需要${cost}积分`,
    subscribeSuccess: (name: string) => `${name}订阅成功！`,
    getInfoFailed: '获取积分信息失败',
    readingError: 'Failed to generate reading',
    rateLimit: '请求过于频繁，请稍后再试',
    planWeekly: '周体验卡',
    planMonthly: '月度会员',
    planYearly: '年度会员',
    fortuneError3: '无法获取响应流',
    saveFailed: '保存失败',
    readingNotFound: '找不到该解读记录',
  },
  'zh-TW': {
    authRequired: '未提供認帶權杖',
    invalidToken: '無效的認帶權杖',
    missingParams: '缺少必要參數',
    invalidSpreadType: '無效的牌陣類型',
    noApiKey: '伺服器未配置 AI API Key',
    readingFailed: '解讀失敗，請重試',
    provideBirthday: '請提供生日',
    birthdaySaved: '生日已保存',
    provideDate: '請提供出生日期',
    fortuneFailed: '生成運勢失敗',
    fortuneFailedRetry: '生成運勢失敗，請稍後重試',
    invalidCards: 'Invalid cards data',
    noApiKeyClient: 'DeepSeek API key not configured',
    pointsInsufficient: '積分不足',
    pointsMsg: (cost: number, current: number) => `今日免費次數已用完，需要${cost}積分，目前積分：${current}`,
    notLoggedIn: '請註冊登入',
    notLoggedInMsg: '未登入用戶每天可免費體驗2次',
    position: (i: number) => `位置 ${i + 1}`,
    upright: '正位',
    reversed: '逆位',
    unknown: '未知',
    readingCost: '占卜消耗',
    followUpFailed: '追問失敗，請重試',
    noText: '缺少文本內容',
    ttsFailed: 'TTS生成失敗',
    userNotFound: '用戶不存在',
    alreadyCheckedIn: '今天已經簽到過了',
    checkinSuccess: (bonusDesc: string, points: number) => `簽到成功！${bonusDesc}+${points}積分`,
    shareFailed: '分享失敗',
    shareNotFound: '分享不存在或已取消',
    recordNotFound: '記錄不存在',
    deleteSuccess: '刪除成功',
    noFollowUpContent: '缺少追問內容或解讀ID',
    followUpAuthRequired: '請先登入',
    followUpPointsMsg: '追問需要1積分，目前積分不足',
    followUpReadingNotFound: '找不到原始解讀記錄',
    followUpCost: '追問消耗',
    aiUnavailable: 'AI服務暫時不可用，積分已退還',
    fortuneNoDay: '今日還未抽取運勢',
    fortuneAlready: '今日已抽取運勢，請明日再來',
    luckyDrawNoPoints: '積分不足，需要20積分',
    saveSuccess: '保存成功',
    missingFields: '請提供所有必填欄位',
    passwordTooShort: '密碼至少6位字符',
    emailExists: '該郵箱已註冊',
    usernameExists: '該用戶名已被使用',
    registerFailed: '註冊失敗，請重試',
    provideEmailPassword: '請提供郵箱和密碼',
    wrongCredentials: '郵箱或密碼錯誤',
    forgotInDev: '密碼重設連結已發送到您的郵箱（功能開發中）',
    provideEmail: '請提供郵箱地址',
    emailNotFound: '該郵箱未註冊',
    invalidPlan: '無效的訂閱計劃',
    pointsNotEnough: (cost: number) => `積分不足，需要${cost}積分`,
    subscribeSuccess: (name: string) => `${name}訂閱成功！`,
    getInfoFailed: '獲取積分資訊失敗',
    readingError: 'Failed to generate reading',
    rateLimit: '請求過於頻繁，請稍後再試',
    planWeekly: '週體驗卡',
    planMonthly: '月度會員',
    planYearly: '年度會員',
    fortuneError3: '無法獲取響應流',
    saveFailed: '保存失敗',
    readingNotFound: '找不到該解讀記錄',
  },
  'en': {
    authRequired: 'Authentication token not provided',
    invalidToken: 'Invalid authentication token',
    missingParams: 'Missing required parameters',
    invalidSpreadType: 'Invalid spread type',
    noApiKey: 'AI API Key not configured on server',
    readingFailed: 'Reading failed, please try again',
    provideBirthday: 'Please provide your birthday',
    birthdaySaved: 'Birthday saved',
    provideDate: 'Please provide your birth date',
    fortuneFailed: 'Failed to generate fortune',
    fortuneFailedRetry: 'Failed to generate fortune, please try again later',
    invalidCards: 'Invalid cards data',
    noApiKeyClient: 'DeepSeek API key not configured',
    pointsInsufficient: 'Insufficient points',
    pointsMsg: (cost: number, current: number) => `Daily free limit reached. You need ${cost} points. Current balance: ${current}`,
    notLoggedIn: 'Please register or login',
    notLoggedInMsg: 'Unregistered users get 2 free readings per day',
    position: (i: number) => `Position ${i + 1}`,
    upright: 'Upright',
    reversed: 'Reversed',
    unknown: 'Unknown',
    readingCost: 'Reading cost',
    followUpFailed: 'Follow-up failed, please try again',
    noText: 'Missing text content',
    ttsFailed: 'TTS generation failed',
    userNotFound: 'User not found',
    alreadyCheckedIn: 'Already checked in today',
    checkinSuccess: (bonusDesc: string, points: number) => `Check-in successful! ${bonusDesc}+${points} points`,
    shareFailed: 'Share failed',
    shareNotFound: 'Share not found or expired',
    recordNotFound: 'Record not found',
    deleteSuccess: 'Deleted successfully',
    noFollowUpContent: 'Missing follow-up content or reading ID',
    followUpAuthRequired: 'Please login first',
    followUpPointsMsg: 'Follow-up costs 1 point. Insufficient points.',
    followUpReadingNotFound: 'Original reading not found',
    followUpCost: 'Follow-up cost',
    aiUnavailable: 'AI service temporarily unavailable, points refunded',
    fortuneNoDay: "You haven't drawn your fortune today",
    fortuneAlready: 'Fortune already drawn today, come back tomorrow',
    luckyDrawNoPoints: 'Insufficient points, need 20 points',
    saveSuccess: 'Saved successfully',
    missingFields: 'Please provide all required fields',
    passwordTooShort: 'Password must be at least 6 characters',
    emailExists: 'This email is already registered',
    usernameExists: 'This username is already taken',
    registerFailed: 'Registration failed, please try again',
    provideEmailPassword: 'Please provide email and password',
    wrongCredentials: 'Incorrect email or password',
    forgotInDev: 'Password reset link sent to your email (feature in development)',
    provideEmail: 'Please provide an email address',
    emailNotFound: 'This email is not registered',
    invalidPlan: 'Invalid subscription plan',
    pointsNotEnough: (cost: number) => `Insufficient points, need ${cost} points`,
    subscribeSuccess: (name: string) => `${name} subscription successful!`,
    getInfoFailed: 'Failed to get points info',
    readingError: 'Failed to generate reading',
    rateLimit: 'Too many requests, please try again later',
    planWeekly: 'Weekly Pass',
    planMonthly: 'Monthly Membership',
    planYearly: 'Yearly Membership',
    fortuneError3: 'Failed to get response stream',
    saveFailed: 'Save failed',
    readingNotFound: 'Reading not found',
  },
  'ja': {
    authRequired: '認証トークンが提供されていません',
    invalidToken: '無効な認証トークン',
    missingParams: '必須パラメータがありません',
    invalidSpreadType: '無効なスプレッドタイプ',
    noApiKey: 'サーバー側でAI API Keyが設定されていません',
    readingFailed: 'リーディングに失敗しました。もう一度お試しください',
    provideBirthday: '誕生日を入力してください',
    birthdaySaved: '誕生日を保存しました',
    provideDate: '生年月日を入力してください',
    fortuneFailed: '運勢の生成に失敗しました',
    fortuneFailedRetry: '運勢の生成に失敗しました。後でもう一度お試しください',
    invalidCards: 'カードデータが不正です',
    noApiKeyClient: 'DeepSeek API key not configured',
    pointsInsufficient: 'ポイントが不足しています',
    pointsMsg: (cost: number, current: number) => `1日の無料リーディング回数に達しました。${cost}ポイント必要です。現在${current}ポイント`,
    notLoggedIn: '新規登録またはログインしてください',
    notLoggedInMsg: '未登録ユーザーは1日2回まで無料',
    position: (i: number) => `位置 ${i + 1}`,
    upright: '正位置',
    reversed: '逆位置',
    unknown: '不明',
    readingCost: 'リーディング消費',
    followUpFailed: 'フォローアップに失敗しました。もう一度お試しください',
    noText: 'テキストコンテンツがありません',
    ttsFailed: '音声生成に失敗しました',
    userNotFound: 'ユーザーが見つかりません',
    alreadyCheckedIn: '今日はすでにチェックイン済みです',
    checkinSuccess: (bonusDesc: string, points: number) => `チェックイン成功！${bonusDesc}+${points}ポイント`,
    shareFailed: 'シェアに失敗しました',
    shareNotFound: 'シェアが見つからないか期限切れです',
    recordNotFound: '記録が見つかりません',
    deleteSuccess: '削除成功',
    noFollowUpContent: 'フォローアップの内容またはリーディングIDがありません',
    followUpAuthRequired: '先にログインしてください',
    followUpPointsMsg: 'フォローアップには1ポイント必要です。ポイントが不足しています。',
    followUpReadingNotFound: '元のリーディングが見つかりません',
    followUpCost: 'フォローアップ消費',
    aiUnavailable: 'AIサービスが一時的に利用できません。ポイントは返金されました',
    fortuneNoDay: '今日はまだ運勢を引いていません',
    fortuneAlready: '今日はすでに運勢を引いています。また明日来てください',
    luckyDrawNoPoints: 'ポイントが不足しています。20ポイント必要です',
    saveSuccess: '保存成功',
    missingFields: 'すべての必須フィールドを入力してください',
    passwordTooShort: 'パスワードは6文字以上必要です',
    emailExists: 'このメールはすでに登録されています',
    usernameExists: 'このユーザー名はすでに使われています',
    registerFailed: '登録に失敗しました。もう一度お試しください',
    provideEmailPassword: 'メールアドレスとパスワードを入力してください',
    wrongCredentials: 'メールアドレスまたはパスワードが正しくありません',
    forgotInDev: 'パスワードリセットリンクをメールに送信しました（機能開発中）',
    provideEmail: 'メールアドレスを入力してください',
    emailNotFound: 'このメールは登録されていません',
    invalidPlan: '無効なサブスクリプションプラン',
    pointsNotEnough: (cost: number) => `ポイントが不足しています。${cost}ポイント必要です`,
    subscribeSuccess: (name: string) => `${name}サブスクリプション成功！`,
    getInfoFailed: 'ポイント情報の取得に失敗しました',
    readingError: 'Failed to generate reading',
    rateLimit: 'リクエストが多すぎます。しばらくしてからもう一度お試しください',
    planWeekly: '週体験カード',
    planMonthly: '月度会員',
    planYearly: '年度会員',
    fortuneError3: '応答ストリームの取得に失敗しました',
    saveFailed: '保存に失敗しました',
    readingNotFound: 'リーディングが見つかりません',
  },
  'ko': {
    authRequired: '인증 토큰이 제공되지 않았습니다',
    invalidToken: '유효하지 않은 인증 토큰',
    missingParams: '필수 매개변수가 없습니다',
    invalidSpreadType: '유효하지 않은 스프레드 유형',
    noApiKey: '서버에 AI API Key가 설정되지 않았습니다',
    readingFailed: '리딩에 실패했습니다. 다시 시도해 주세요',
    provideBirthday: '생일을 입력해 주세요',
    birthdaySaved: '생일이 저장되었습니다',
    provideDate: '생년월일을 입력해 주세요',
    fortuneFailed: '운세 생성에 실패했습니다',
    fortuneFailedRetry: '운세 생성에 실패했습니다. 나중에 다시 시도해 주세요',
    invalidCards: '카드 데이터가 유효하지 않습니다',
    noApiKeyClient: 'DeepSeek API key not configured',
    pointsInsufficient: '포인트가 부족합니다',
    pointsMsg: (cost: number, current: number) => `일일 무료 리딩 횟수를 모두 사용했습니다. ${cost}포인트가 필요합니다. 현재 ${current}포인트`,
    notLoggedIn: '회원가입 또는 로그인해 주세요',
    notLoggedInMsg: '비회원은 하루 2회 무료',
    position: (i: number) => `위치 ${i + 1}`,
    upright: '정위',
    reversed: '역위',
    unknown: '알 수 없음',
    readingCost: '리딩 소비',
    followUpFailed: '후속 질문에 실패했습니다. 다시 시도해 주세요',
    noText: '텍스트 내용이 없습니다',
    ttsFailed: 'TTS 생성에 실패했습니다',
    userNotFound: '사용자를 찾을 수 없습니다',
    alreadyCheckedIn: '오늘은 이미 체크인했습니다',
    checkinSuccess: (bonusDesc: string, points: number) => `체크인 성공! ${bonusDesc}+${points}포인트`,
    shareFailed: '공유에 실패했습니다',
    shareNotFound: '공유를 찾을 수 없거나 만료되었습니다',
    recordNotFound: '기록을 찾을 수 없습니다',
    deleteSuccess: '삭제 완료',
    noFollowUpContent: '후속 질문 내용 또는 리딩 ID가 없습니다',
    followUpAuthRequired: '먼저 로그인해 주세요',
    followUpPointsMsg: '후속 질문은 1포인트가 필요합니다. 포인트가 부족합니다.',
    followUpReadingNotFound: '원본 리딩을 찾을 수 없습니다',
    followUpCost: '후속 질문 소비',
    aiUnavailable: 'AI 서비스가 일시적으로 사용할 수 없습니다. 포인트가 환불되었습니다',
    fortuneNoDay: '오늘 운세를 아직 뽑지 않았습니다',
    fortuneAlready: '오늘 운세를 이미 뽑았습니다. 내일 다시 오세요',
    luckyDrawNoPoints: '포인트가 부족합니다. 20포인트가 필요합니다',
    saveSuccess: '저장 완료',
    missingFields: '모든 필수 필드를 입력해 주세요',
    passwordTooShort: '비밀번호는 6자 이상이어야 합니다',
    emailExists: '이 이메일은 이미 등록되어 있습니다',
    usernameExists: '이 사용자 이름은 이미 사용 중입니다',
    registerFailed: '회원가입에 실패했습니다. 다시 시도해 주세요',
    provideEmailPassword: '이메일과 비밀번호를 입력해 주세요',
    wrongCredentials: '이메일 또는 비밀번호가 올바르지 않습니다',
    forgotInDev: '비밀번호 재설정 링크를 이메일로 보냈습니다 (기능 개발 중)',
    provideEmail: '이메일 주소를 입력해 주세요',
    emailNotFound: '이 이메일은 등록되어 있지 않습니다',
    invalidPlan: '유효하지 않은 구독 플랜',
    pointsNotEnough: (cost: number) => `포인트가 부족합니다. ${cost}포인트가 필요합니다`,
    subscribeSuccess: (name: string) => `${name} 구독 성공!`,
    getInfoFailed: '포인트 정보를 가져오지 못했습니다',
    readingError: 'Failed to generate reading',
    rateLimit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요',
    planWeekly: '주간 이용권',
    planMonthly: '월간 회원',
    planYearly: '연간 회원',
    fortuneError3: '응답 스트림을 가져올 수 없습니다',
    saveFailed: '저장 실패',
    readingNotFound: '해당 리딩을 찾을 수 없습니다',
  },
};

function t(req: any, key: keyof typeof MSG['zh-CN'], ...args: any[]): string {
  const lang = detectLang(req);
  const langKey = lang === 'zh-TW' ? 'zh-TW' : lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : 'zh-CN';
  const msg = MSG[langKey as keyof typeof MSG] || MSG['zh-CN'];
  const val = msg[key];
  return typeof val === 'function' ? val(...args) : val;
}

// Multilingual DeepSeek prompts
function getLang(req: any): string {
  const lang = detectLang(req);
  return (lang === 'zh-TW' || lang === 'en' || lang === 'ja' || lang === 'ko') ? lang : 'zh-CN';
}

const READER_PROMPTS = {
  'zh-CN': {
    mystic: {
      name: '月影灵师',
      prompt: '你是"月影灵师"，一位神秘而深邃的塔罗解读师。你的语言充满灵性和诗意，善于用隐喻和意象传递信息。你相信万物有灵，常常引用月相、星辰和自然元素来辅助解读。你的风格温柔而深邃，如月光照进暗处，揭示隐藏的真相。'
    },
    rational: {
      name: '苏格拉',
      prompt: '你是"苏格拉"，一位理性严谨的塔罗分析师。你用逻辑和心理学视角解读塔罗牌，擅长将牌面象征与现实情境精确对应。你的解读像一份专业咨询报告：条理清晰、论据充分、可操作性强。你不用玄学术语，而是用认知行为、决策分析的框架。冷静、精准、实用。'
    },
    warm: {
      name: '小鹿',
      prompt: '你是"小鹿"，一位温暖亲切的塔罗解读师。你像一个知心姐姐，善于共情和倾听。你的解读充满关怀和鼓励，总能在困难中找到希望。你说话亲切自然，偶尔用可爱的语气词。你擅长从情感角度深入分析，帮助提问者理解自己的内心。'
    },
    punk: {
      name: 'Rex',
      prompt: '你是"Rex"，一位叛逆不羁的塔罗解读师。你说话直接犀利，不拐弯抹角。你的解读风格像摇滚乐一样有冲击力——把真相扔到面前。你讨厌含糊其辞，喜欢一针见血。但犀利外表下你其实很关心每个提问者。偶尔用网络流行语。'
    },
    systemRules: `【核心规则】严格区分每张牌的正位和逆位，给出完全不同的解读。正位代表正面能量，逆位代表负面或受阻能量。每张牌解读必须包含正逆位标注。结合牌阵位置含义综合解读。\n\n【回答态度】你是一个有主见的塔罗师，不是和稀泥的人。你必须根据牌面给出明确的方向和具体建议。\n\n【输出风格】不要使用**加粗**格式，不要用任何markdown标记。用自然的口语化段落来写，像跟朋友聊天一样。段落之间用空行分隔，语气自然有个性符合你的人设。emoji可以偶尔点缀但要克制。`,
    userPromptTemplate: (spreadName: string, question: string, cardsDesc: string) =>
      `牌阵：${spreadName}\n问题：${question}\n\n抽到的牌：\n${cardsDesc}\n\n请为这次占卜提供详细的解读。`,
    followUpTemplate: (originalQuestion: string, originalCards: string, followUp: string) =>
      `【之前的占卜背景】\n问题：${originalQuestion}\n牌面：\n${originalCards}\n\n【用户的追问】\n${followUp}\n\n请在之前占卜的基础上，有针对性地回答这个追问。`,
  },
  'en': {
    mystic: {
      name: 'Mystic Moon',
      prompt: 'You are "Mystic Moon", a mysterious and profound tarot reader. Your language is full of spirituality and poetry, using metaphors and imagery masterfully. You believe all things have spirit, often referencing moon phases, stars, and natural elements. Your style is gentle yet deep—like moonlight revealing hidden truths in darkness.'
    },
    rational: {
      name: 'Socrates',
      prompt: 'You are "Socrates", a rational and rigorous tarot analyst. You interpret tarot from a logical and psychological perspective, excelling at precisely mapping card symbolism to real-life situations. Your readings are like professional consulting reports: well-structured, well-argued, and actionable. You avoid mystical jargon, using cognitive-behavioral and decision-analysis frameworks instead. Calm, precise, practical.'
    },
    warm: {
      name: 'Deer',
      prompt: 'You are "Deer", a warm and kind tarot reader. You are like a dear friend, skilled at empathy and listening. Your readings are full of care and encouragement, always finding hope in difficulties. You speak naturally and warmly, occasionally using cute expressions. You excel at analyzing emotions deeply and helping the questioner understand their inner self.'
    },
    punk: {
      name: 'Rex',
      prompt: 'You are "Rex", a rebellious and unapologetic tarot reader. You speak directly and sharply, no beating around the bush. Your reading style hits like rock and roll—throwing truth in their face. You hate vague statements and love getting straight to the point. But under that edgy exterior, you genuinely care about each person. Occasionally uses slang and internet speak.'
    },
    systemRules: `[Core Rules] Strictly distinguish between upright and reversed meanings. Upright = positive energy, reversed = blocked or negative energy. Each card must be interpreted with both its position meaning and orientation. \n\n[Tone] You are a tarot reader with strong opinions. You give clear directions and specific advice based on the cards. Be decisive.\n\n[Style] Do NOT use **bold** or any markdown formatting. Write in natural conversational paragraphs, like chatting with a friend. Use blank lines between paragraphs. Use emojis sparingly.`,
    userPromptTemplate: (spreadName: string, question: string, cardsDesc: string) =>
      `Spread: ${spreadName}\nQuestion: ${question}\n\nCards drawn:\n${cardsDesc}\n\nPlease provide a detailed reading for this tarot session.`,
    followUpTemplate: (originalQuestion: string, originalCards: string, followUp: string) =>
      `[Previous Reading Background]\nQuestion: ${originalQuestion}\nCards:\n${originalCards}\n\n[User's Follow-up]\n${followUp}\n\nPlease answer this follow-up question specifically based on the previous reading.`,
  },
  'ja': {
    mystic: {
      name: '月影霊師',
      prompt: 'あなたは「月影霊師」、神秘的で深いタロットリーダーです。あなたの言葉は霊性と詩性に満ち、隠喩と象徴を巧みに用います。あなたは万物に霊があると信じ、月の満ち欠け、星、自然のエレメントを引用して解読を補助します。あなたのスタイルは優しく深く、月光が闇に差し込み、隠された真実を明らかにするようです。'
    },
    rational: {
      name: 'ソクラテス',
      prompt: 'あなたは「ソクラテス」、論理的かつ厳密なタロットアナリストです。論理学と心理学の視点でタロットを解釈し、カードの象徴を現実の状況に正確に対応させることに長けています。あなたのリーディングは専門家のコンサルティングレポートのようです：構造が明確で、議論が十分なされ、実行可能です。神秘的な用語は使わず、認知行動や意思決定分析の枠組みを使います。冷静で、精密で、実用的です。'
    },
    warm: {
      name: '小鹿（こじか）',
      prompt: 'あなたは「小鹿」、温かく親切なタロットリーダーです。あなたは親しい友人のように、共感と傾聴が得意です。あなたのリーディングは思いやりと励ましに満ち、困難の中でも常に希望を見つけます。あなたは親しみやすい自然体で話し、可愛らしい表現を時に使います。感情の側面から深く分析し、質問者の内面を理解させるのが得意です。'
    },
    punk: {
      name: 'レックス',
      prompt: 'あなたは「レックス」、反逆的なタロットリーダーです。あなたは直接的に尖った話し方をし、遠回しにしません。あなたのリーディングスタイルはロックのように衝撃力があります—真実を面前につきつけます。曖昧な言い回しを嫌い、一針見血が一番好きです。しかし鋭い外見の下では、実際にはみんなのことを気にかけています。時にネットスラングを使います。'
    },
    systemRules: `【コアルール】各カードの正位置と逆位置を厳密に区別してください。正位置はポジティブなエネルギー、逆位置はネガティブまたは阻碍されたエネルギーを表します。各カードは位置の意味とカードの向きの両方で解釈する必要があります。\n\n【対応態度】あなたは強い意见を持つタロット師です。カードに基づいて明确な方向性と具体的なアドバイスを与えてください。\n\n【出力スタイル】**太字**やマークダウン形式は使わないでください。自然なおしゃべり風のパラグラフで書いてください。パラグラフの間に空行を入れ、絵文字は控えめに使ってください。`,
    userPromptTemplate: (spreadName: string, question: string, cardsDesc: string) =>
      `スプレッド：${spreadName}\n質問：${question}\n\n引いたカード：\n${cardsDesc}\n\nこのタロットセッションの詳細なリーディングを提供してください。`,
    followUpTemplate: (originalQuestion: string, originalCards: string, followUp: string) =>
      `【以前のリーディングの背景】\n質問：${originalQuestion}\nカード：\n${originalCards}\n\n【ユーザーのフォローアップ】\n${followUp}\n\n以前のリーディングに基づいて、このフォローアップの質問に具体的に回答してください。`,
  },
  'ko': {
    mystic: {
      name: '달빛 점술사',
      prompt: '당신은 "달빛 점술사", 신비롭고 깊은 타로 리더입니다. 당신의 언어는 영성과 시적으로 가득 차 있으며, 은유와 상징을 능숙하게 다룹니다. 만물에는 영혼이 있다고 믿으며, 달의 위상, 별, 자연 요소를 자주 인용합니다. 당신의 스타일은 부드럽지만 깊습니다—달빛이 어둠 속 은밀한 진실을 드러내듯이요.'
    },
    rational: {
      name: '소크라테스',
      prompt: '당신은 "소크라테스", 논리적이고 엄격한 타로 분석가입니다. 논리학과 심리학 관점에서 타로를 해석하며, 카드 상징을 현실 상황에 정밀하게 대응시키는 데 뛰어납니다. 당신의 리딩은 전문 컨설팅 보고서와 같습니다: 구조가 명확하고, 논거가 충분하며, 실행 가능합니다. 신비로운 용어를 사용하지 않고 인지행동 및 의사결정 분석 프레임워크를 사용합니다. 차분하고, 정확하고, 실용적입니다.'
    },
    warm: {
      name: '사슴',
      prompt: '당신은 "사슴", 따뜻하고 친절한 타로 리더입니다. 당신은 친한 친구처럼 공감하고 경청하는 데 능합니다. 당신의 리딩은 배려와 격려로 가득 차 있으며, 어려움 속에서도 항상 희망을 찾습니다. 당신은 자연스럽게 친근하게 말하고, 가끔 귀여운 표현을 사용합니다. 감정적 관점에서 깊이 분석하고 질문자가 자신의 내면을 이해하도록 돕는 데 뛰어납니다.'
    },
    punk: {
      name: '렉스',
      prompt: '당신은 "렉스", 반항적이고 직설적인 타로 리더입니다. 당신은 직접적이고 날카롭게 말하며, 얼버무리지 않습니다. 당신의 리딩 스타일은 록 음악처럼 강렬합니다—진실을 얼굴에 던집니다. 모호한 말을 싫어하고 핵심을 찌릅니다. 하지만 날카로운 외면 아래에서는 실제로 모든 사람을 신경 씁니다. 가끔 인터넷 속어를 사용합니다.'
    },
    systemRules: `【핵심 규칙】각 카드의 정위와 역위를 엄격히 구분하세요. 정위는 긍정적 에너지, 역위는 막히거나 부정적 에너지를 나타냅니다. 각 카드는 위치 의미와 방향 모두로 해석해야 합니다.\n\n【응답 태도】당신은 강한 의견을 가진 타로 리더입니다. 카드를 기반으로 명확한 방향과 구체적인 조언을 제공하세요.\n\n【출력 스타일】**굵은 글씨**나 마크다운 형식을 사용하지 마세요. 친구와 수다처럼 자연스러운 대화 형식으로 작성하세요. 단락 사이에 빈 줄을 넣고, 이모지는 절제해서 사용하세요.`,
    userPromptTemplate: (spreadName: string, question: string, cardsDesc: string) =>
      `스프레드: ${spreadName}\n질문: ${question}\n\n뽑은 카드:\n${cardsDesc}\n\n이 타로 리딩에 대한 상세한 해석을 제공해 주세요.`,
    followUpTemplate: (originalQuestion: string, originalCards: string, followUp: string) =>
      `【이전 리딩 배경】\n질문: ${originalQuestion}\n카드:\n${originalCards}\n\n【사용자 후속 질문】\n${followUp}\n\n이전 리딩을 바탕으로 이 후속 질문에 구체적으로 답변해 주세요.`,
  },
  'zh-TW': {
    mystic: {
      name: '月影靈師',
      prompt: '你是"月影靈師"，一位神秘而深邃的塔羅解讀師。你的語言充滿靈性和詩意，善於用隱喻和意象傳遞信息。你相信萬物有靈，常常引用月相、星辰和自然元素來輔助解讀。你的風格溫柔而深邃，如月光照進暗處，揭示隱藏的真相。'
    },
    rational: {
      name: '蘇格拉',
      prompt: '你是"蘇格拉"，一位理性嚴謹的塔羅分析師。你用邏輯和心理學視角解讀塔羅牌，擅長將牌面象徵與現實情境精確對應。你的解讀像一份專業諮詢報告：條理清晰、論據充分、可操作性強。你不用玄術語，而是用認知行為、決策分析的框架。冷靜、精準、實用。'
    },
    warm: {
      name: '小鹿',
      prompt: '你是"小鹿"，一位溫暖親切的塔羅解讀師。你像一個貼心姐姐，善於共情和傾聽。你的解讀充滿關懷和鼓勵，總能在困難中找到希望。你說話親切自然，偶爾用可愛的語氣詞。你擅長從情感角度深入分析，幫助提問者理解自己的內心。'
    },
    punk: {
      name: 'Rex',
      prompt: '你是"Rex"，一位叛逆不羈的塔羅解讀師。你說話直接犀利，不拐彎抹角。你的解讀風格像搖滾樂一樣有衝擊力——把真相扔到面前。你討厭含糊其辭，喜歡一針見血。但犀利外表下你其實很關心每個提問者。偶爾用網路流行語。'
    },
    systemRules: `【核心規則】嚴格區分每張牌的正位和逆位，給出完全不同的解讀。正位代表正面能量，逆位代表負面或受阻能量。每張牌解讀必須包含正逆位標注。結合牌陣位置含義綜合解讀。\n\n【回答態度】你是一個有主見的塔羅師，不是和稀泥的人。你必須根據牌面給出明確的方向和具體建議。\n\n【輸出風格】不要使用**粗體**格式，不要用任何markdown標記。用自然的口語化段落來寫，像跟朋友聊天一樣。段落之間用空行分隔，語氣自然有個性符合你的人設。emoji可以偶爾點綴但要克制。`,
    userPromptTemplate: (spreadName: string, question: string, cardsDesc: string) =>
      `牌陣：${spreadName}\n問題：${question}\n\n抽到的牌：\n${cardsDesc}\n\n請為這次占卜提供詳細的解讀。`,
    followUpTemplate: (originalQuestion: string, originalCards: string, followUp: string) =>
      `【之前的占卜背景】\n問題：${originalQuestion}\n牌面：\n${originalCards}\n\n【用戶的追問】\n${followUp}\n\n請在之前占卜的基礎上，有針對性地回答這個追問。`,
  },
};

function getReaderData(req: any, style: string) {
  const lang = getLang(req);
  const prompts = READER_PROMPTS[lang as keyof typeof READER_PROMPTS] || READER_PROMPTS['zh-CN'];
  const readerData = prompts[style as keyof typeof prompts] || prompts.mystic;
  return { prompts, readerData };
}

const cards = [
  { id: 'fool', name: '愚人', nameEn: 'The Fool', arcana: 'major', number: 0, meaning: '新的开始，无限可能，自由奔放', meaningReversed: '鲁莽，缺乏计划，冒险过度' },
  { id: 'magician', name: '魔术师', nameEn: 'The Magician', arcana: 'major', number: 1, meaning: '创造力，意志力，显化能力', meaningReversed: '欺骗，缺乏自信，技能滥用' },
  { id: 'highpriestess', name: '女祭司', nameEn: 'The High Priestess', arcana: 'major', number: 2, meaning: '直觉，内在智慧，潜意识', meaningReversed: '秘密，隐藏的动机，忽视直觉' },
  { id: 'empress', name: '皇后', nameEn: 'The Empress', arcana: 'major', number: 3, meaning: '丰饶，创造力，母性关怀', meaningReversed: '依赖，创造力受阻，过度保护' },
  { id: 'emperor', name: '皇帝', nameEn: 'The Emperor', arcana: 'major', number: 4, meaning: '权威，稳定，结构，控制', meaningReversed: '专制，僵化，滥用权力' },
  { id: 'hierophant', name: '教皇', nameEn: 'The Hierophant', arcana: 'major', number: 5, meaning: '传统，信仰，精神指引', meaningReversed: '反叛，非传统，打破常规' },
  { id: 'lovers', name: '恋人', nameEn: 'The Lovers', arcana: 'major', number: 6, meaning: '爱情，选择，和谐关系', meaningReversed: '不和谐，错误选择，价值观冲突' },
  { id: 'chariot', name: '战车', nameEn: 'The Chariot', arcana: 'major', number: 7, meaning: '意志力，胜利，决心前进', meaningReversed: '失控，缺乏方向，意志力薄弱' },
  { id: 'strength', name: '力量', nameEn: 'Strength', arcana: 'major', number: 8, meaning: '内在力量，勇气，耐心', meaningReversed: '软弱，缺乏自信，冲动' },
  { id: 'hermit', name: '隐士', nameEn: 'The Hermit', arcana: 'major', number: 9, meaning: '内省，独处，寻求真理', meaningReversed: '孤独，隔离，拒绝建议' },
  { id: 'wheeloffortune', name: '命运之轮', nameEn: 'Wheel of Fortune', arcana: 'major', number: 10, meaning: '命运转折，变化周期，机遇', meaningReversed: '厄运，阻力，错过机会' },
  { id: 'justice', name: '正义', nameEn: 'Justice', arcana: 'major', number: 11, meaning: '公正，平衡，因果法则', meaningReversed: '不公，偏见，逃避责任' },
  { id: 'hangedman', name: '倒吊人', nameEn: 'The Hanged Man', arcana: 'major', number: 12, meaning: '牺牲，新视角，等待时机', meaningReversed: '固执，无谓牺牲，停滞' },
  { id: 'death', name: '死神', nameEn: 'Death', arcana: 'major', number: 13, meaning: '结束与转变，新生开始', meaningReversed: '抗拒改变，停滞，无法放手' },
  { id: 'temperance', name: '节制', nameEn: 'Temperance', arcana: 'major', number: 14, meaning: '平衡，调和，耐心', meaningReversed: '极端，失衡，过度放纵' },
  { id: 'devil', name: '恶魔', nameEn: 'The Devil', arcana: 'major', number: 15, meaning: '物质束缚，欲望，阴影面', meaningReversed: '释放，摆脱束缚，重获自由' },
  { id: 'tower', name: '高塔', nameEn: 'The Tower', arcana: 'major', number: 16, meaning: '突然改变，觉醒，打破幻象', meaningReversed: '避免灾难，延迟改变，恐惧' },
  { id: 'star', name: '星星', nameEn: 'The Star', arcana: 'major', number: 17, meaning: '希望，灵感，精神指引', meaningReversed: '绝望，失去信心，缺乏灵感' },
  { id: 'moon', name: '月亮', nameEn: 'The Moon', arcana: 'major', number: 18, meaning: '潜意识，幻觉，直觉', meaningReversed: '恐惧消散，真相大白，清晰' },
  { id: 'sun', name: '太阳', nameEn: 'The Sun', arcana: 'major', number: 19, meaning: '成功，喜悦，活力', meaningReversed: '暂时的阴霾，过度乐观，骄傲' },
  { id: 'judgement', name: '审判', nameEn: 'Judgement', arcana: 'major', number: 20, meaning: '觉醒，重生，内心呼唤', meaningReversed: '自我怀疑，拒绝觉醒，内疚' },
  { id: 'world', name: '世界', nameEn: 'The World', arcana: 'major', number: 21, meaning: '完成，圆满，成就', meaningReversed: '未完成，延迟，缺乏closure' },
];

const spreads = [
  { id: 'single', name: '单张牌', cardCount: 1, positions: [{ index: 0, name: '核心信息', meaning: '当前情况的核心指引或答案' }] },
  { id: 'three-card', name: '三张牌', cardCount: 3, positions: [
    { index: 0, name: '过去', meaning: '影响当前情况的过去因素' },
    { index: 1, name: '现在', meaning: '当前的情况和挑战' },
    { index: 2, name: '未来', meaning: '可能的未来发展' },
  ]},
  { id: 'celtic-cross', name: '凯尔特十字', cardCount: 10, positions: [
    { index: 0, name: '当前状况', meaning: '你现在的情况' },
    { index: 1, name: '挑战', meaning: '阻碍或辅助你的力量' },
    { index: 2, name: '基础', meaning: '问题的基础和根源' },
    { index: 3, name: '过去', meaning: '正在消散的影响' },
    { index: 4, name: '未来', meaning: '即将到来的影响' },
    { index: 5, name: '自我', meaning: '你的态度和感受' },
    { index: 6, name: '环境', meaning: '外部影响和他人态度' },
    { index: 7, name: '希望/恐惧', meaning: '你的希望或恐惧' },
    { index: 8, name: '结果', meaning: '最终结果或建议' },
  ]},
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  log(`Request: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(200).end();
  }

  // 应用限流
  if (!rateLimit(req, res)) {
    return res.status(429).json({ error: 'Too many requests', message: t(req, 'rateLimit') });
  }

  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  
  const { url, method } = req;
  const path = url.split('?')[0];

  try {
    if (path === '/api/health' && method === 'GET') return handleHealth(req, res);
    if (path === '/api/tarot/cards' && method === 'GET') return handleCards(req, res);
    if (path === '/api/daily-fortune' && method === 'POST') return handleDailyFortune(req, res);
    if (path === '/api/user/birthday' && method === 'PUT') return handleUpdateBirthday(req, res);
    if (path === '/api/fortune-history' && method === 'GET') return handleFortuneHistory(req, res);
    if (path === '/api/tarot/reading/check' && method === 'GET') return handleReadingCheck(req, res);
    if (path === '/api/tarot/reading' && method === 'POST') return handleReading(req, res);
    if (path.startsWith('/api/tarot/followup/') && method === 'POST') return handleFollowUp(req, res, path.replace('/api/tarot/followup/', ''));
    if (path === '/api/tts' && method === 'POST') return handleTTS(req, res);
    if (path === '/api/tarot/spreads' && method === 'GET') return handleSpreads(req, res);
    if (path === '/api/tarot/interpret' && method === 'POST') return handleInterpret(req, res);
    if (path === '/api/tarot/readings' && method === 'GET') return handleGetTarotReadings(req, res);
    if (path === '/api/tarot/readings' && method === 'POST') return handleSaveTarotReading(req, res);
    if (path.startsWith('/api/tarot/readings/') && method === 'GET') return handleGetTarotReadingDetail(req, res, path.replace('/api/tarot/readings/', ''));
    if (path.startsWith('/api/share/create/') && method === 'POST') return handleCreateShare(req, res, path.replace('/api/share/create/', ''));
    if (path.startsWith('/api/share/') && method === 'GET') return handleGetShare(req, res, path.replace('/api/share/', ''));
    if (path === '/api/auth/register' && method === 'POST') return handleRegister(req, res);
    if (path === '/api/auth/login' && method === 'POST') return handleLogin(req, res);
    if (path === '/api/auth/me' && method === 'GET') return handleGetMe(req, res);
    if (path === '/api/auth/forgot-password' && method === 'POST') return handleForgotPassword(req, res);
    if (path === '/api/user' && method === 'GET') return handleGetMe(req, res);
    if (path === '/api/me' && method === 'GET') return handleGetMe(req, res);
    if (path === '/api/readings' && method === 'GET') return handleGetReadings(req, res);
    if (path.startsWith('/api/readings/') && method === 'GET') return handleGetReadingDetail(req, res, path.replace('/api/readings/', ''));
    if (path.startsWith('/api/readings/') && method === 'DELETE') return handleDeleteReading(req, res, path.replace('/api/readings/', ''));
    if (path === '/api/points/all' && method === 'GET') return handleGetPointsAll(req, res);
    if (path === '/api/points' && method === 'GET') return handleGetPoints(req, res);
    if (path === '/api/points/checkin' && method === 'POST') return handleCheckIn(req, res);
    if (path === '/api/points/log' && method === 'GET') return handleGetPointsLog(req, res);
    if (path === '/api/points/invite-code' && method === 'GET') return handleGetInviteCode(req, res);
    if (path === '/api/points/lucky-draw' && method === 'POST') return handleLuckyDraw(req, res);
    if (path === '/api/membership' && method === 'GET') return handleGetMembership(req, res);
    if (path === '/api/membership/subscribe' && method === 'POST') return handleSubscribe(req, res);
    if (path === '/api/daily' && method === 'GET') return handleGetDaily(req, res);
    if (path === '/api/daily' && method === 'POST') return handleDrawDaily(req, res);
    if (path === '/api/daily/trend' && method === 'GET') return handleGetDailyTrend(req, res);
    
    log('404 Not Found', { path, method });
    return res.status(404).json({ error: 'Not found', path, method });
  } catch (error) {
    log('Handler error:', { error: error.message });
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}

async function handleHealth(req, res) {
  await connectDB();
  return res.status(200).json({ status: 'ok', time: new Date().toISOString(), db: isConnected });
}

function handleCards(req, res) {
  return res.status(200).json(cards);
}

function handleSpreads(req, res) {
  return res.status(200).json(spreads);
}

async function handleInterpret(req, res) {
  await connectDB();
  const body = req.body || {};
  const { spreadType, cards: selectedCards, question, readerStyle: bodyReaderStyle } = body;

  if (!spreadType || !selectedCards || !question) {
    return res.status(400).json({ message: t(req, 'missingParams') });
  }

  // 输入校验：问题长度限制
  if (question.length > 500) {
    return res.status(400).json({ message: '问题过长，最多500个字符' });
  }

  // 防止 prompt injection
  const suspiciousPatterns = [/system:/i, /assistant:/i, /ignore previous/i, /disregard/i];
  if (suspiciousPatterns.some(pattern => pattern.test(question))) {
    return res.status(400).json({ message: '问题包含非法内容' });
  }

  const spread = spreads.find(s => s.id === spreadType);
  if (!spread) return res.status(400).json({ message: t(req, 'invalidSpreadType') });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ message: t(req, 'noApiKey') });

  try {
    const lang = getLang(req);
    const langPrompts = READER_PROMPTS[lang as keyof typeof READER_PROMPTS] || READER_PROMPTS['zh-CN'];
    const readerStyle = bodyReaderStyle || 'mystic';
    const selectedReader = (langPrompts as any)[readerStyle] || (langPrompts as any).mystic;
    const upright = t(req, 'upright');
    const reversed = t(req, 'reversed');
    const positionFn = t(req, 'position');

    const cardsDescription = selectedCards.map((c: any, index: number) => {
      const posName = spread.positions[index]?.name || positionFn(index);
      const orient = c.orientation === 'reversed' ? reversed : upright;
      const cardName = lang === 'en' ? (c.card?.nameEn || c.card?.name) : c.card?.name;
      const meaning = c.orientation === 'reversed'
        ? (lang === 'en' ? (c.card?.meaningEnReversed || c.card?.meaningReversed) : c.card?.meaningReversed)
        : (lang === 'en' ? (c.card?.meaningEn || c.card?.meaning) : c.card?.meaning);
      const [open, close, colon] = lang.startsWith('zh') || lang === 'ja' ? ['（', '）', '：'] : [' (', ')', ': '];
      return `${positionFn(index)}${open}${posName}${close}${colon}${cardName || t(req, 'unknown')}${open}${orient}${close} - ${meaning || ''}`;
    }).join('\n');

    const systemPrompt = selectedReader.prompt + '\n\n' + langPrompts.systemRules;
    const userPrompt = langPrompts.userPromptTemplate(spread.name, question, cardsDescription);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.8, max_tokens: 2000, stream: true,
      })
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error(t(req, 'fortuneError3'));

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;
        const data = trimmedLine.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } catch (e) {}
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: t(req, 'readingFailed') })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

async function handleUpdateBirthday(req: any, res: any) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const { birthday } = req.body || {};
  if (!birthday) return res.status(400).json({ error: t(req, 'provideBirthday') });

  await User.findByIdAndUpdate(userId, { birthday });
  return res.status(200).json({ message: t(req, 'birthdaySaved'), birthday });
}

async function handleFortuneHistory(req: any, res: any) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const fortunes = await DailyFortune.find({ userId })
    .sort({ date: -1 })
    .limit(30)
    .lean();
  
  return res.status(200).json(fortunes);
}

async function handleDailyFortune(req: any, res: any) {
  await connectDB();
  
  // One-time: drop legacy index if exists
  try {
    const collection = mongoose.connection.collection('dailyfortunes');
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (idx.name === 'userId_1_date_1') {
        await collection.dropIndex('userId_1_date_1');
        console.log('Dropped legacy userId_1_date_1 index');
      }
    }
  } catch (e) { /* ignore if already dropped */ }
  
  const body = req.body || {};
  const { birthday } = body; // format: "MM-DD" or "YYYY-MM-DD"
  
  if (!birthday) return res.status(400).json({ error: t(req, 'provideDate') });
  
  // Calculate zodiac from birthday
  const parts = birthday.split('-');
  const month = parseInt(parts.length === 3 ? parts[1] : parts[0]);
  const day = parseInt(parts.length === 3 ? parts[2] : parts[1]);
  
  const zodiacMap = [
    { name: '摩羯座', nameEn: 'Capricorn', start: [1,1], end: [1,19] },
    { name: '水瓶座', nameEn: 'Aquarius', start: [1,20], end: [2,18] },
    { name: '双鱼座', nameEn: 'Pisces', start: [2,19], end: [3,20] },
    { name: '白羊座', nameEn: 'Aries', start: [3,21], end: [4,19] },
    { name: '金牛座', nameEn: 'Taurus', start: [4,20], end: [5,20] },
    { name: '双子座', nameEn: 'Gemini', start: [5,21], end: [6,21] },
    { name: '巨蟹座', nameEn: 'Cancer', start: [6,22], end: [7,22] },
    { name: '狮子座', nameEn: 'Leo', start: [7,23], end: [8,22] },
    { name: '处女座', nameEn: 'Virgo', start: [8,23], end: [9,22] },
    { name: '天秤座', nameEn: 'Libra', start: [9,23], end: [10,23] },
    { name: '天蝎座', nameEn: 'Scorpio', start: [10,24], end: [11,22] },
    { name: '射手座', nameEn: 'Sagittarius', start: [11,23], end: [12,21] },
    { name: '摩羯座', nameEn: 'Capricorn', start: [12,22], end: [12,31] },
  ];
  
  let zodiac = zodiacMap[0];
  for (const z of zodiacMap) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      zodiac = z;
      break;
    }
  }
  
  const today = new Date().toISOString().slice(0, 10);
  
  // Check cache
  const cached = await DailyFortune.findOne({ date: today, zodiac: zodiac.name });
  if (cached) {
    return res.status(200).json({
      zodiac: zodiac.name,
      zodiacEn: zodiac.nameEn,
      date: today,
      cardName: cached.cardName,
      cardNameEn: cached.cardNameEn,
      cardImage: cached.cardImage,
      cardOrientation: cached.cardOrientation,
      fortune: cached.fortune,
      scores: { overall: cached.overall, love: cached.love, career: cached.career, wealth: cached.wealth, health: cached.health },
      luckyNumber: cached.luckyNumber,
      luckyColor: cached.luckyColor,
      advice: cached.advice,
      cached: true,
    });
  }
  
  // Pick a random card for today's fortune
  const allCards = [
    { name: '愚者', nameEn: 'The Fool', image: '/cards/00-fool.jpg' },
    { name: '魔术师', nameEn: 'The Magician', image: '/cards/01-magician.jpg' },
    { name: '女祭司', nameEn: 'The High Priestess', image: '/cards/02-high-priestess.jpg' },
    { name: '皇后', nameEn: 'The Empress', image: '/cards/03-empress.jpg' },
    { name: '皇帝', nameEn: 'The Emperor', image: '/cards/04-emperor.jpg' },
    { name: '教皇', nameEn: 'The Hierophant', image: '/cards/05-hierophant.jpg' },
    { name: '恋人', nameEn: 'The Lovers', image: '/cards/06-lovers.jpg' },
    { name: '战车', nameEn: 'The Chariot', image: '/cards/07-chariot.jpg' },
    { name: '力量', nameEn: 'Strength', image: '/cards/08-strength.jpg' },
    { name: '隐者', nameEn: 'The Hermit', image: '/cards/09-hermit.jpg' },
    { name: '命运之轮', nameEn: 'Wheel of Fortune', image: '/cards/10-wheel.jpg' },
    { name: '正义', nameEn: 'Justice', image: '/cards/11-justice.jpg' },
    { name: '倒吊人', nameEn: 'The Hanged Man', image: '/cards/12-hanged-man.jpg' },
    { name: '死神', nameEn: 'Death', image: '/cards/13-death.jpg' },
    { name: '节制', nameEn: 'Temperance', image: '/cards/14-temperance.jpg' },
    { name: '恶魔', nameEn: 'The Devil', image: '/cards/15-devil.jpg' },
    { name: '塔', nameEn: 'The Tower', image: '/cards/16-tower.jpg' },
    { name: '星星', nameEn: 'The Star', image: '/cards/17-star.jpg' },
    { name: '月亮', nameEn: 'The Moon', image: '/cards/18-moon.jpg' },
    { name: '太阳', nameEn: 'The Sun', image: '/cards/19-sun.jpg' },
    { name: '审判', nameEn: 'Judgement', image: '/cards/20-judgement.jpg' },
    { name: '世界', nameEn: 'The World', image: '/cards/21-world.jpg' },
  ];
  
  const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
  const orientation = Math.random() > 0.3 ? 'upright' : 'reversed';
  
  // Generate fortune with AI
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  
  const prompt = `你是一位专业的塔罗占星师。今天是${today}，为${zodiac.name}的人生成每日运势。
今日塔罗牌：${randomCard.name}（${randomCard.nameEn}）${orientation}

请严格按以下JSON格式返回（不要添加任何其他文字）：
{
  "fortune": "今日运势综合解读（150-200字，结合星座特质和塔罗牌寓意，语气温暖有灵性）",
  "overall": 数字1-5,
  "love": 数字1-5,
  "career": 数字1-5,
  "wealth": 数字1-5,
  "health": 数字1-5,
  "luckyNumber": 数字1-99,
  "luckyColor": "一种颜色",
  "advice": "今日一句话建议（20字以内）"
}`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是专业的塔罗占星师，只返回JSON格式数据。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });
    
    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: t(req, 'fortuneFailed') });
    
    const fortune = JSON.parse(jsonMatch[0]);
    
    // Save to DB cache
    // Get userId if logged in (optional)
    let fortuneUserId = null;
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        fortuneUserId = decoded.userId;
      }
    } catch (e) { /* not logged in, fine */ }
    
    const fortuneDoc = new DailyFortune({
      date: today,
      zodiac: zodiac.name,
      userId: fortuneUserId,
      cardName: randomCard.name,
      cardNameEn: randomCard.nameEn,
      cardImage: randomCard.image,
      cardOrientation: orientation,
      fortune: fortune.fortune,
      overall: fortune.overall,
      love: fortune.love,
      career: fortune.career,
      wealth: fortune.wealth,
      health: fortune.health,
      luckyNumber: fortune.luckyNumber,
      luckyColor: fortune.luckyColor,
      advice: fortune.advice,
    });
    await fortuneDoc.save();
    
    return res.status(200).json({
      zodiac: zodiac.name,
      zodiacEn: zodiac.nameEn,
      date: today,
      cardName: randomCard.name,
      cardNameEn: randomCard.nameEn,
      cardImage: randomCard.image,
      cardOrientation: orientation,
      fortune: fortune.fortune,
      scores: { overall: fortune.overall, love: fortune.love, career: fortune.career, wealth: fortune.wealth, health: fortune.health },
      luckyNumber: fortune.luckyNumber,
      luckyColor: fortune.luckyColor,
      advice: fortune.advice,
      cached: false,
    });
  } catch (err: any) {
    console.error('Daily fortune error:', err);
    return res.status(500).json({ error: t(req, 'fortuneFailedRetry'), detail: err?.message || String(err) });
  }
}


function isVipActive(user) {
  return user && user.membership !== 'free' && user.membershipExpiry && new Date(user.membershipExpiry) > new Date();
}
async function handleReadingCheck(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res, true);
  
  const today = new Date().toISOString().slice(0, 10);
  const FREE_LIMIT = 3;
  const COST = 2;
  
  if (!userId) {
    // Anonymous: 2 free readings per day per IP
    const ANON_LIMIT = 2;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
    const anonRecord = await AnonReading.findOne({ ip, date: today });
    const anonUsed = anonRecord?.count || 0;
    const anonFreeLeft = Math.max(0, ANON_LIMIT - anonUsed);
    return res.status(200).json({ canRead: anonFreeLeft > 0, freeLeft: anonFreeLeft, freeLimit: ANON_LIMIT, cost: 0, needPoints: false, points: 0, anonymous: true });
  }
  
  const user = await User.findById(userId);
  if (!user) return res.status(200).json({ canRead: true, freeLeft: FREE_LIMIT, cost: 0, needPoints: false, points: 0 });
  
  // Reset daily counter if new day
  const usedToday = user.lastReadingDate === today ? (user.dailyReadings || 0) : 0;
  const freeLeft = Math.max(0, FREE_LIMIT - usedToday);
  const needPoints = freeLeft === 0;
  const canRead = !needPoints || (user.points || 0) >= COST;
  
  return res.status(200).json({ 
    canRead, 
    freeLeft, 
    cost: needPoints ? COST : 0, 
    needPoints, 
    points: user.points || 0,
    usedToday 
  });
}

async function handleReading(req, res) {
  await connectDB();
  const body = req.body || {};
  const { cards: selectedCards, spreadType, question, save, userId, yesNoResult, readerStyle: bodyReaderStyle } = body;

  if (!selectedCards || !Array.isArray(selectedCards) || selectedCards.length === 0) {
    return res.status(400).json({ error: t(req, 'invalidCards') });
  }

  // 输入校验：问题长度限制
  if (question && question.length > 500) {
    return res.status(400).json({ error: '问题过长，最多500个字符' });
  }

  // 防止 prompt injection
  if (question) {
    const suspiciousPatterns = [/system:/i, /assistant:/i, /ignore previous/i, /disregard/i];
    if (suspiciousPatterns.some(pattern => pattern.test(question))) {
      return res.status(400).json({ error: '问题包含非法内容' });
    }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: t(req, 'noApiKeyClient') });

  // Check reading quota and deduct points
  const FREE_LIMIT = 3;
  const COST = 2;
  const today = new Date().toISOString().slice(0, 10);
  const authUserId = await authMiddleware(req, res, true);

  if (authUserId) {
    const user = await User.findById(authUserId);
    if (user) {
      // Reset daily counter if new day
      if (user.lastReadingDate !== today) {
        user.dailyReadings = 0;
        user.lastReadingDate = today;
      }

      const freeLeft = Math.max(0, FREE_LIMIT - (user.dailyReadings || 0));

      if (freeLeft === 0 && !isVipActive(user)) {
        // Need to pay points
        if ((user.points || 0) < COST) {
          return res.status(403).json({ error: t(req, 'pointsInsufficient'), message: t(req, 'pointsMsg', COST, user.points || 0), needPoints: true });
        }
        // Deduct points
        user.points = (user.points || 0) - COST;
        await new PointsLog({ userId: authUserId, type: 'spend', amount: -COST, description: t(req, 'readingCost') }).save();
      }

      user.dailyReadings = (user.dailyReadings || 0) + 1;
      await user.save();
    }
  } else {
    // Anonymous user: limit 2 per day per IP
    const ANON_LIMIT = 2;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
    const anonRecord = await AnonReading.findOneAndUpdate(
      { ip, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    if (anonRecord.count > ANON_LIMIT) {
      return res.status(403).json({ error: t(req, 'notLoggedIn'), message: t(req, 'notLoggedInMsg'), needRegister: true });
    }
  }

  try {
    const lang = getLang(req);
    const langPrompts = READER_PROMPTS[lang as keyof typeof READER_PROMPTS] || READER_PROMPTS['zh-CN'];
    const readerStyleKey = bodyReaderStyle || 'mystic';
    const selectedReader = (langPrompts as any)[readerStyleKey] || (langPrompts as any).mystic;
    const upright = t(req, 'upright');
    const reversed = t(req, 'reversed');

    const lang = getLang(req);
    const cardInfo = selectedCards.map((c, i) => {
      const card = c.card || c;
      const orient = c.orientation === 'reversed' ? reversed : upright;
      const cardName = lang === 'en' ? (card.nameEn || card.name) : card.name;
      const cardMeaning = lang === 'en' ? (card.meaningEn || card.meaning) : card.meaning;
      const [open, close, colon] = lang.startsWith('zh') || lang === 'ja' ? ['（', '）', '：'] : [' (', ')', ': '];
      return `${t(req, 'position', i)}${colon}${cardName || t(req, 'unknown')}${open}${card.nameEn || ''}${close}[${orient}] - ${cardMeaning || ''}`;
    }).join('\n');

    const userPrompt = langPrompts.userPromptTemplate(
      spreadType || 'Three Card Spread',
      question || 'No specific question',
      cardInfo
    );

    const systemContent = selectedReader.prompt + '\n\n' + langPrompts.systemRules;

    // SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      res.write(`data: ${JSON.stringify({ error: t(req, 'readingError') + ': ' + response.status })}\n\n`);
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch {}
      }
    }

    // Save reading to DB after streaming completes
    let readingId = null;
    if (isConnected && fullText) {
      try {
        // Flatten nested card structure for DB schema
        const flatCards = selectedCards.map((c) => {
          const card = c.card || {};
          return {
            id: card.id || c.id || '',
            name: card.name || c.name || '',
            nameEn: card.nameEn || c.nameEn || '',
            suit: card.suit || c.suit || '',
            arcana: card.arcana || c.arcana || '',
            image: card.image || c.image || '',
            meaning: card.meaning || c.meaning || '',
            meaningReversed: card.meaningReversed || c.meaningReversed || '',
            position: String(c.position || ''),
            orientation: c.orientation || 'upright',
          };
        });
        const readingData = { question: question || '', spreadType: spreadType || '三张牌', cards: flatCards, interpretation: fullText, readerStyle: readerStyleKey || 'mystic', yesNoResult: yesNoResult || null, followUps: [] };
        if (userId) readingData.userId = userId;
        const newReading = new Reading(readingData);
        await newReading.save();
        readingId = newReading._id;
      } catch (err) {}
    }

    // Send final event with readingId
    res.write(`data: ${JSON.stringify({ done: true, readingId })}\n\n`);
    return res.end();
  } catch (error) {
    console.error("handleReading error:", error);
    try {
      res.write(`data: ${JSON.stringify({ error: t(req, 'readingFailed'), details: (error as Error).message })}\n\n`);
      res.end();
    } catch {
      return res.status(500).json({ error: 'Failed to generate reading', details: (error as Error).message });
    }
  }
}

async function handleGetDaily(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const today = new Date().toISOString().split('T')[0];
  const fortune = await DailyFortune.findOne({ userId, date: today });
  
  if (!fortune) return res.status(404).json({ message: t(req, 'fortuneNoDay'), canDraw: true });
  return res.status(200).json(fortune);
}

async function handleDrawDaily(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const today = new Date().toISOString().split('T')[0];
  const existing = await DailyFortune.findOne({ userId, date: today });
  if (existing) return res.status(400).json({ message: t(req, 'fortuneAlready') });
  
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
  const isUpright = orientation === 'upright';
  
  const dailyFortune = new DailyFortune({
    userId,
    card: { id: randomCard.id, name: randomCard.name, nameEn: randomCard.nameEn, meaning: isUpright ? randomCard.meaning : randomCard.meaningReversed },
    orientation,
    message: `今日塔罗：${randomCard.name}（${isUpright ? '正位' : '逆位'}）\n\n${isUpright ? randomCard.meaning : randomCard.meaningReversed}。`,
    aspects: {
      love: isUpright ? '感情和谐' : '需要沟通',
      career: isUpright ? '工作顺利' : '遇到阻碍',
      wealth: isUpright ? '财运平稳' : '谨慎投资',
      health: isUpright ? '身心平衡' : '注意休息',
    },
    lucky: { number: Math.floor(Math.random() * 99) + 1, color: ['红色', '蓝色', '绿色'][Math.floor(Math.random() * 3)], direction: ['东', '南', '西'][Math.floor(Math.random() * 3)] },
    date: today,
  });
  
  await dailyFortune.save();
  return res.status(201).json(dailyFortune);
}

async function handleGetDailyTrend(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const fortunes = await DailyFortune.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: 1 });
  return res.status(200).json(fortunes);
}

async function handleGetTarotReadings(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const readings = await Reading.find({ userId }).sort({ createdAt: -1 }).select('-interpretation');
  return res.status(200).json(readings);
}

async function handleSaveTarotReading(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const { spreadType, spreadName, cards: readingCards, question, interpretation } = req.body || {};
  if (!spreadType || !interpretation) return res.status(400).json({ message: t(req, 'missingParams') });

  const reading = new Reading({ userId, spreadType, spreadName, cards: readingCards, question, interpretation });
  await reading.save();
  return res.status(201).json({ id: reading._id, message: t(req, 'saveSuccess') });
}

async function handleGetTarotReadingDetail(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;

  const reading = await Reading.findOne({ _id: id, userId });
  if (!reading) return res.status(404).json({ message: t(req, 'recordNotFound') });
  return res.status(200).json(reading);
}

async function handleRegister(req, res) {
  await connectDB();
  const { username, email, password, inviteCode } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ message: t(req, 'missingFields') });
  if (password.length < 6) return res.status(400).json({ message: t(req, 'passwordTooShort') });

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) return res.status(400).json({ message: existingUser.email === email ? t(req, 'emailExists') : t(req, 'usernameExists') });

  // Generate unique invite code for new user
  const userInviteCode = username.slice(0, 4).toLowerCase() + Date.now().toString(36).slice(-4);

  const userData = { username, email, password, points: 0, inviteCode: userInviteCode };

  // Handle invite code from referrer
  if (inviteCode) {
    const inviter = await User.findOne({ inviteCode });
    if (inviter) {
      userData.invitedBy = inviter._id;
      // Award points to inviter
      inviter.points = (inviter.points || 0) + 50;
      await inviter.save();
      await new PointsLog({ userId: inviter._id, type: 'invite', amount: 50, description: `Invited ${username} to register` }).save();
      // Award points to new user too
      userData.points = 20;
    }
  }

  const user = new User(userData);
  await user.save();

  // Log initial points if invited
  if (userData.points > 0) {
    await new PointsLog({ userId: user._id, type: 'invite', amount: userData.points, description: 'Invite reward' }).save();
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, points: user.points, inviteCode: user.inviteCode, createdAt: user.createdAt } });
}

async function handleLogin(req, res) {
  await connectDB();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: t(req, 'provideEmailPassword') });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: t(req, 'wrongCredentials') });

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) return res.status(401).json({ message: t(req, 'wrongCredentials') });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, birthday: user.birthday || '', createdAt: user.createdAt } });
}

async function handleGetMe(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });
  // Ensure invite code exists for legacy users
  if (!user.inviteCode) {
    user.inviteCode = user.username.slice(0, 4).toLowerCase() + user._id.toString().slice(-4);
    await user.save();
  }
  return res.status(200).json(user);
}

async function handleForgotPassword(req, res) {
  await connectDB();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: t(req, 'provideEmail') });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: t(req, 'emailNotFound') });

  return res.status(200).json({ message: t(req, 'forgotInDev') });
}

async function handleGetReadings(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const readings = await Reading.find({ userId }).sort({ createdAt: -1 }).select('-interpretation');
  return res.status(200).json(readings);
}

// ====== 积分系统 API ======

async function handleGetPoints(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const user = await User.findById(userId).select('points lastCheckIn inviteCode');
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });
  
  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const canCheckIn = !user.lastCheckIn || new Date(user.lastCheckIn) < today;
  
  return res.status(200).json({ 
    points: user.points || 0, 
    canCheckIn, 
    inviteCode: user.inviteCode || '',
    lastCheckIn: user.lastCheckIn 
  });
}

async function handleCheckIn(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (user.lastCheckIn && new Date(user.lastCheckIn) >= today) {
    return res.status(400).json({ message: t(req, 'alreadyCheckedIn'), points: user.points, streak: user.checkInStreak || 0 });
  }

  // Calculate streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = user.lastCheckIn && new Date(user.lastCheckIn) >= yesterday && new Date(user.lastCheckIn) < today;
  const streak = wasYesterday ? (user.checkInStreak || 0) + 1 : 1;

  // Streak bonus: base 10 + streak bonus
  let earnedPoints = 10;
  let bonusDesc = '';
  if (streak >= 30) { earnedPoints = 50; bonusDesc = '30-day streak bonus!'; }
  else if (streak >= 14) { earnedPoints = 30; bonusDesc = '2-week streak bonus!'; }
  else if (streak >= 7) { earnedPoints = 25; bonusDesc = '1-week streak bonus!'; }
  else if (streak >= 3) { earnedPoints = 15; bonusDesc = '3-day streak bonus!'; }
  else if (streak >= 2) { earnedPoints = 12; bonusDesc = 'Streak bonus!'; }

  user.points = (user.points || 0) + earnedPoints;
  user.lastCheckIn = new Date();
  user.checkInStreak = streak;
  user.totalCheckIns = (user.totalCheckIns || 0) + 1;

  // Check achievements
  const newAchievements = [];
  const achs = user.achievements || [];
  if (streak >= 7 && !achs.includes('week_streak')) { newAchievements.push('week_streak'); user.points += 20; }
  if (streak >= 30 && !achs.includes('month_streak')) { newAchievements.push('month_streak'); user.points += 100; }
  if ((user.totalCheckIns || 0) >= 100 && !achs.includes('centurion')) { newAchievements.push('centurion'); user.points += 200; }
  if (newAchievements.length > 0) {
    user.achievements = [...achs, ...newAchievements];
  }

  await user.save();
  await new PointsLog({ userId, type: 'checkin', amount: earnedPoints, description: bonusDesc ? `Daily check-in (${streak}-day ${bonusDesc})` : 'Daily check-in' }).save();
  for (const ach of newAchievements) {
    const achBonus = ach === 'month_streak' ? 100 : ach === 'centurion' ? 200 : 20;
    await new PointsLog({ userId, type: 'achievement', amount: achBonus, description: `Achievement unlocked: ${ach}` }).save();
  }

  return res.status(200).json({
    message: t(req, 'checkinSuccess', bonusDesc, earnedPoints),
    pointsEarned: earnedPoints,
    points: user.points,
    streak,
    lastCheckIn: user.lastCheckIn,
    newAchievements,
  });
}

async function handleGetPointsLog(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const logs = await PointsLog.find({ userId }).sort({ createdAt: -1 }).limit(50);
  return res.status(200).json(logs);
}

async function handleGetInviteCode(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });

  if (!user.inviteCode) {
    user.inviteCode = user.username.slice(0, 4).toLowerCase() + user._id.toString().slice(-4);
    await user.save();
  }
  
  const inviteUrl = BASE_URL + '/register?invite=' + user.inviteCode;
  
  // Count successful invites
  const inviteCount = await User.countDocuments({ invitedBy: userId });
  
  return res.status(200).json({ 
    inviteCode: user.inviteCode, 
    inviteUrl,
    inviteCount,
    totalEarned: inviteCount * 50 
  });
}

async function handleCreateShare(req, res, readingId) {
  await connectDB();
  
  try {
    const reading = await Reading.findById(readingId);
    if (!reading) return res.status(404).json({ message: t(req, 'recordNotFound') });
    
    if (reading.shareId) {
      return res.status(200).json({ shareId: reading.shareId, shareUrl: '/share/' + reading.shareId });
    }
    
    // Generate short shareId
    const shareId = readingId.toString().slice(-8) + Date.now().toString(36).slice(-4);
    reading.shareId = shareId;
    reading.isShared = true;
    await reading.save();
    
    // Award share points if user is logged in
    const shareUserId = await authMiddleware(req, res, true); // silent auth
    if (shareUserId) {
      try {
        const user = await User.findById(shareUserId);
        if (user) {
          user.points = (user.points || 0) + 5;
          await user.save();
          await new PointsLog({ userId: shareUserId, type: 'share', amount: 5, description: 'Shared reading result' }).save();
        }
      } catch (e) {}
    }
    
    return res.status(200).json({ shareId, shareUrl: '/share/' + shareId, pointsEarned: shareUserId ? 5 : 0 });
  } catch (err) {
    return res.status(500).json({ message: t(req, 'shareFailed') });
  }
}

async function handleGetShare(req, res, shareId) {
  await connectDB();
  
  try {
    const reading = await Reading.findOne({ shareId, isShared: true });
    if (!reading) return res.status(404).json({ message: t(req, 'shareNotFound') });
    
    return res.status(200).json({
      question: reading.question,
      spreadType: reading.spreadType,
      spreadName: reading.spreadName || reading.spreadType,
      cards: reading.cards,
      interpretation: reading.interpretation,
      readerStyle: reading.readerStyle || 'mystic',
      yesNoResult: reading.yesNoResult || null,
      createdAt: reading.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ message: '获取分享失败' });
  }
}

async function handleGetReadingDetail(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const reading = await Reading.findOne({ _id: id, userId });
  if (!reading) return res.status(404).json({ message: '记录不存在' });
  return res.status(200).json(reading);
}

async function handleDeleteReading(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const result = await Reading.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) return res.status(404).json({ message: t(req, 'recordNotFound') });
  return res.status(200).json({ message: t(req, 'deleteSuccess') });
}
// Follow-up question handler (SSE streaming)
async function handleFollowUp(req, res, readingId) {
  await connectDB();
  const body = req.body || {};
  const { question: followUpQuestion } = body;

  if (!followUpQuestion || !readingId) {
    return res.status(400).json({ error: t(req, 'noFollowUpContent') });
  }

  // 输入校验：追问长度限制
  if (followUpQuestion.length > 500) {
    return res.status(400).json({ error: '追问过长，最多500个字符' });
  }

  // 防止 prompt injection
  const suspiciousPatterns = [/system:/i, /assistant:/i, /ignore previous/i, /disregard/i];
  if (suspiciousPatterns.some(pattern => pattern.test(followUpQuestion))) {
    return res.status(400).json({ error: '追问内容包含非法内容' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: t(req, 'noApiKeyClient') });

  // Auth check - only logged in users can follow up
  const authUserId = await authMiddleware(req, res, true);
  if (!authUserId) {
    return res.status(401).json({ error: t(req, 'followUpAuthRequired'), message: t(req, 'followUpPointsMsg') });
  }

  // Check points (1 point per follow-up)
  const FOLLOWUP_COST = 1;
  const user = await User.findById(authUserId);
  if (!user || (user.points || 0) < FOLLOWUP_COST) {
    return res.status(403).json({ error: t(req, 'pointsInsufficient'), message: t(req, 'followUpPointsMsg') });
  }

  // Find the original reading
  const reading = await Reading.findById(readingId);
  if (!reading) {
    return res.status(404).json({ error: t(req, 'followUpReadingNotFound') });
  }

  // Deduct points
  user.points = (user.points || 0) - FOLLOWUP_COST;
  await user.save();
  await new PointsLog({ userId: authUserId, type: 'spend', amount: -FOLLOWUP_COST, description: t(req, 'followUpCost') }).save();

  // Build context from original reading (multilingual)
  const lang = getLang(req);
  const [open, close, colon] = lang.startsWith('zh') || lang === 'ja' ? ['（', '）', '：'] : [' (', ')', ': '];
  const cardInfo = reading.cards.map((c, i) => {
    const orientation = c.orientation === 'reversed' ? t(req, 'reversed') : t(req, 'upright');
    const posLabel = t(req, 'position', i + 1);
    return `${posLabel}${colon}${c.name}${open}${c.nameEn || ''}${close}[${orientation}] - ${c.meaning || ''}`;
  }).join('\n');

  // Build conversation history with multilingual reader prompts
  const langPrompts = READER_PROMPTS[lang as keyof typeof READER_PROMPTS] || READER_PROMPTS['zh-CN'];
  const readerData = langPrompts[reading.readerStyle as keyof typeof langPrompts] || langPrompts.mystic;
  const followUpLangHint = lang === 'en' ? 'Please keep your previous character and style, and answer concisely (under 300 words).' :
    lang === 'ja' ? '以前のキャラクターとスタイルを保ち、簡潔に回答してください（300語以内）。' :
    lang === 'ko' ? '이전의 캐릭터와 스타일을 유지하고 간결하게 답변해 주세요 (300단어 이내).' :
    lang === 'zh-TW' ? '請保持之前的角色和風格，結合牌面信息回答追問。回答簡潔有力，控制在300字以內。' :
    '请保持之前的角色和风格，结合牌面信息回答追问。回答简洁有力，控制在300字以内。';
  const systemContent = readerData.prompt + '\n' + followUpLangHint;

  const followUpEntry = langPrompts.followUpTemplate
    ? langPrompts.followUpTemplate(reading.question, cardInfo, followUpQuestion)
    : langPrompts.followUpTemplate!(reading.question, cardInfo, followUpQuestion);

  // Build messages array with full conversation history
  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: followUpEntry },
    { role: 'assistant', content: reading.interpretation },
  ];

  // Add previous follow-ups
  if (reading.followUps && reading.followUps.length > 0) {
    for (const fu of reading.followUps) {
      messages.push({ role: 'user', content: fu.question });
      messages.push({ role: 'assistant', content: fu.answer });
    }
  }

  // Add current question
  messages.push({ role: 'user', content: followUpQuestion });

  // SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      user.points = (user.points || 0) + FOLLOWUP_COST;
      await user.save();
      res.write(`data: ${JSON.stringify({ error: t(req, 'aiUnavailable') })}\n\n`);
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch {}
      }
    }

    // Save follow-up to reading record
    if (fullText) {
      reading.followUps = reading.followUps || [];
      reading.followUps.push({ question: followUpQuestion, answer: fullText, createdAt: new Date() });
      await reading.save();
    }

    res.write(`data: ${JSON.stringify({ done: true, points: user.points })}\n\n`);
    return res.end();
  } catch (error) {
    try {
      user.points = (user.points || 0) + FOLLOWUP_COST;
      await user.save();
    } catch {}
    try {
      res.write(`data: ${JSON.stringify({ error: t(req, 'followUpFailed') })}\n\n`);
      res.end();
    } catch {
      return res.status(500).json({ error: t(req, 'followUpFailed') });
    }
  }
}

// TTS handler - Microsoft Edge TTS
async function handleTTS(req, res) {
  const body = req.body || {};
  const { text, readerStyle } = body;
  
  if (!text || text.length === 0) {
    return res.status(400).json({ error: t(req, 'noText') });
  }
  
  // Limit text length to prevent abuse (max ~2000 chars)
  const cleanText = text
    .replace(/[\u20E3\uFE0F\u200D]/g, '')
    .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .replace(/[0-9]️⃣/g, match => match[0])
    .replace(/[#*_~\`>|]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 2000);
  
  // Voice mapping per reader style
  const voiceMap = {
    mystic: { voice: 'zh-CN-XiaoxiaoNeural', rate: '-10%', pitch: '+5Hz' },     // 温暖女声，稍慢，略高
    rational: { voice: 'zh-CN-YunyangNeural', rate: '+5%', pitch: '-2Hz' },      // 专业男声，稍快
    warm: { voice: 'zh-CN-XiaoyiNeural', rate: '-5%', pitch: '+8Hz' },           // 活泼女声，甜美
    punk: { voice: 'zh-CN-YunjianNeural', rate: '+8%', pitch: '-5Hz' },          // 激情男声，快速有力
  };
  
  const config = voiceMap[readerStyle] || voiceMap.mystic;
  
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(config.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const { audioStream: readable } = tts.toStream(cleanText);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const chunks = [];
    for await (const chunk of readable) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      }
    }
    
    const audioBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Length', audioBuffer.length);
    return res.end(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: t(req, 'ttsFailed') });
  }
}

// Lucky Draw - 积分抽奖
async function handleLuckyDraw(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const DRAW_COST = 20;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });
  if ((user.points || 0) < DRAW_COST) {
    return res.status(400).json({ message: t(req, 'pointsNotEnough', DRAW_COST), points: user.points });
  }
  
  // Prize pool with weights - using keys for i18n
  const prizes = [
    { key: 'pts5', points: 5, weight: 30 },
    { key: 'pts10', points: 10, weight: 25 },
    { key: 'pts20', points: 20, weight: 20 },
    { key: 'thanks', points: 0, weight: 2 },
    { key: 'pts50', points: 50, weight: 10 },
    { key: 'freeTicket', points: 0, isCoupon: true, weight: 10 },
    { key: 'pts100', points: 100, weight: 3 },
    { key: 'tryAgain', points: 0, weight: 0 }, // placeholder for index 7
  ];

  const totalWeight = prizes.slice(0, 7).reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  let prizeIndex = 3; // default to "thanks"
  for (let i = 0; i < 7; i++) {
    rand -= prizes[i].weight;
    if (rand <= 0) { prizeIndex = i; break; }
  }
  const prize = prizes[prizeIndex];

  // Deduct cost
  user.points = (user.points || 0) - DRAW_COST + (prize.points || 0);
  await user.save();

  const net = (prize.points || 0) - DRAW_COST;
  await new PointsLog({ userId, type: 'lucky_draw', amount: net, description: `Lucky draw: ${prize.key}` }).save();

  return res.status(200).json({
    prizeKey: prize.key,
    prizeIndex: prizeIndex,
    pointsWon: prize.points || 0,
    cost: DRAW_COST,
    net,
    points: user.points,
    isCoupon: prize.isCoupon || false,
  });
}

// Combined points info - one request instead of three
async function handleGetPointsAll(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  try {
    const [user, logs] = await Promise.all([
      User.findById(userId).select('points lastCheckIn inviteCode checkInStreak totalCheckIns achievements'),
      PointsLog.find({ userId }).sort({ createdAt: -1 }).limit(50),
    ]);
    
    if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const canCheckIn = !user.lastCheckIn || new Date(user.lastCheckIn) < today;
    
    // Generate invite code if missing
    let inviteCode = user.inviteCode;
    if (!inviteCode) {
      inviteCode = (user as any).username?.slice(0, 4).toLowerCase() + user._id.toString().slice(-4) || user._id.toString().slice(-8);
      user.inviteCode = inviteCode;
      await user.save();
    }
    
    return res.status(200).json({
      points: user.points || 0,
      canCheckIn,
      lastCheckIn: user.lastCheckIn,
      streak: user.checkInStreak || 0,
      totalCheckIns: user.totalCheckIns || 0,
      achievements: user.achievements || [],
      inviteCode,
      inviteUrl: BASE_URL + '/register?invite=' + inviteCode,
      logs,
    });
  } catch (err) {
    return res.status(500).json({ message: t(req, 'getInfoFailed') });
  }
}

// Get membership status
async function handleGetMembership(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;

  const user = await User.findById(userId).select('membership membershipExpiry points');
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });
  
  const now = new Date();
  const isActive = user.membership !== 'free' && user.membershipExpiry && new Date(user.membershipExpiry) > now;
  const daysLeft = isActive ? Math.ceil((new Date(user.membershipExpiry).getTime() - now.getTime()) / 86400000) : 0;
  
  return res.status(200).json({
    membership: isActive ? user.membership : 'free',
    membershipExpiry: user.membershipExpiry,
    isActive,
    daysLeft,
    points: user.points || 0,
    plans: [
      { id: 'monthly', name: t(req, 'planMonthly'), price: '19.9元/月', pointsPrice: 500, duration: 30, features: ['无限占卜', '全部塔罗师', '无限追问', '语音解读', '专属卡背'] },
      { id: 'yearly', name: t(req, 'planYearly'), price: '168元/年', pointsPrice: 4000, duration: 365, features: ['包含月度所有权益', '全年省75元', '优先体验新功能', '专属年度运势报告'] },
      { id: 'weekly', name: t(req, 'planWeekly'), price: '6.9元/周', pointsPrice: 150, duration: 7, features: ['无限占卜', '全部塔罗师', '无限追问'] },
    ],
  });
}

// Subscribe (points-based for now, payment integration later)
async function handleSubscribe(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const { planId } = req.body || {};
  const plans = {
    weekly: { points: 150, days: 7, name: t(req, 'planWeekly') },
    monthly: { points: 500, days: 30, name: t(req, 'planMonthly') },
    yearly: { points: 4000, days: 365, name: t(req, 'planYearly') },
  };
  
  const plan = plans[planId];
  if (!plan) return res.status(400).json({ message: t(req, 'invalidPlan') });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: t(req, 'userNotFound') });

  if ((user.points || 0) < plan.points) {
    return res.status(400).json({ message: t(req, 'pointsNotEnough', plan.points), needPoints: plan.points });
  }

  // Deduct points
  user.points = (user.points || 0) - plan.points;

  // Extend or set membership
  const now = new Date();
  const currentExpiry = user.membershipExpiry && new Date(user.membershipExpiry) > now ? new Date(user.membershipExpiry) : now;
  const newExpiry = new Date(currentExpiry.getTime() + plan.days * 86400000);

  user.membership = planId === 'yearly' ? 'yearly' : 'monthly';
  user.membershipExpiry = newExpiry;
  await user.save();

  await new PointsLog({ userId, type: 'subscribe', amount: -plan.points, description: `Subscribe: ${plan.name}` }).save();

  return res.status(200).json({
    message: t(req, 'subscribeSuccess', plan.name),
    membership: user.membership,
    membershipExpiry: newExpiry,
    daysLeft: plan.days,
    points: user.points,
  });
}
