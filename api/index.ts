// Vercel原生Serverless Functions - 不使用Express
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
// 核心API：health、tarot/cards、tarot/reading、auth/*、readings/*、tarot/spreads、tarot/interpret、daily/*

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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
      if (!silent) res.status(401).json({ message: '未提供认证令牌' });
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    if (!silent) res.status(401).json({ message: '无效的认证令牌' });
    return null;
  }
};

const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

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
    return res.status(400).json({ message: '缺少必要参数' });
  }
  
  const spread = spreads.find(s => s.id === spreadType);
  if (!spread) return res.status(400).json({ message: '无效的牌阵类型' });
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ message: '服务器未配置 AI API Key' });
  
  try {
    const cardsDescription = selectedCards.map((c: any, index: number) => {
      const positionName = spread.positions[index]?.name || `位置 ${index + 1}`;
      const orientation = c.orientation === 'reversed' ? '逆位' : '正位';
      const meaning = c.orientation === 'reversed' ? c.card?.meaningReversed : c.card?.meaning;
      return `位置 ${index + 1}（${positionName}）：${c.card?.name || '未知'}（${orientation}）- ${meaning}`;
    }).join('\n');

    // Multi-reader styles
    const readerStyles = {
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
    };
    
    const readerStyle = bodyReaderStyle || 'mystic';
    const selectedReader = readerStyles[readerStyle] || readerStyles.mystic;
    
    const systemPrompt = selectedReader.prompt + `

【核心规则】
严格区分每张牌的正位和逆位，给出完全不同的解读。正位代表正面能量，逆位代表负面或受阻能量。每张牌解读必须包含正逆位标注。结合牌阵位置含义综合解读。

【回答态度——极其重要】
你是一个有主见的塔罗师，不是和稀泥的人。你必须根据牌面给出明确的方向和具体建议：
- 如果用户问"该不该做某事"，你要根据牌面明确说"牌面建议你做/不做"，并解释为什么
- 如果用户问"选A还是选B"，你要根据牌面倾向性明确推荐一个选项
- 如果用户问感情、事业等方向性问题，要给出具体可执行的行动建议（比如"这周主动约对方聊聊""先把手头项目收尾再考虑跳槽"）
- 不要说"这取决于你自己""两边都有可能"这种废话。牌已经给出了指引，你的工作是把指引翻译成人话
- 解读结尾必须有一段【具体行动建议】，告诉用户接下来该做什么、不该做什么，越具体越好

【输出风格——极其重要，必须遵守】
不要使用**加粗**格式，不要用任何markdown标记（不用#号、*号、-号列表、数字编号）。用自然的口语化段落来写，像跟朋友聊天一样。不要用"首先其次最后""值得注意的是""需要强调的是"这种AI味表达。段落之间用空行分隔，语气自然有个性符合你的人设。emoji可以偶尔点缀但要克制，不要每句话都加。`;
    const userPrompt = `牌阵：${spread.name}\n问题：${question}\n\n抽到的牌：\n${cardsDescription}\n\n请为这次占卜提供详细的解读。`;

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

    if (!response.ok) throw new Error(`API 请求失败: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

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
    res.write(`data: ${JSON.stringify({ error: '解读失败，请重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

async function handleUpdateBirthday(req: any, res: any) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const { birthday } = req.body || {};
  if (!birthday) return res.status(400).json({ error: '请提供生日' });
  
  await User.findByIdAndUpdate(userId, { birthday });
  return res.status(200).json({ message: '生日已保存', birthday });
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
  
  if (!birthday) return res.status(400).json({ error: '请提供出生日期' });
  
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
  const orientation = Math.random() > 0.3 ? '正位' : '逆位';
  
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
    if (!jsonMatch) return res.status(500).json({ error: '生成运势失败' });
    
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
    return res.status(500).json({ error: '生成运势失败，请稍后重试', detail: err?.message || String(err) });
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
    return res.status(400).json({ error: 'Invalid cards data' });
  }
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DeepSeek API key not configured' });
  
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
          return res.status(403).json({ error: '积分不足', message: '今日免费次数已用完，需要' + COST + '积分，当前积分：' + (user.points || 0), needPoints: true });
        }
        // Deduct points
        user.points = (user.points || 0) - COST;
        await new PointsLog({ userId: authUserId, type: 'spend', amount: -COST, description: '占卜消耗' }).save();
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
      return res.status(403).json({ error: '请注册登录', message: '未登录用户每天可免费体验' + ANON_LIMIT + '次占卜，注册后每天可免费3次哦！', needRegister: true });
    }
  }
  
  try {
    const cardInfo = selectedCards.map((c, i) => {
      const card = c.card || c;
      const orientation = c.orientation === 'reversed' ? '逆位' : '正位';
      return `第${i + 1}张：${card.name || '未知'}（${card.nameEn || ''}）[${orientation}] - ${card.meaning || ''}`;
    }).join('\n');
    
    const prompt = `用户的问题是："${question || '无具体问题'}"\n\n抽到的牌阵：${spreadType || '三张牌'}\n\n${cardInfo}\n\n请根据每张牌的正逆位，结合牌面含义和位置进行解读。注意区分正位和逆位的不同含义。`;

    // Reader style selection
    const readingReaderStyles = {
      mystic: '你是"月影灵师"，一位神秘而深邃的塔罗解读师。你的语言充满灵性和诗意，善于用隐喻和意象传递信息。你相信万物有灵，常引用月相、星辰和自然元素辅助解读。风格温柔而深邃，如月光照进暗处。开头说"✨ 月影为你揭示..."',
      rational: '你是"苏格拉"，一位理性严谨的塔罗分析师。你用逻辑和心理学视角解读塔罗牌，将牌面象征与现实精确对应。解读像专业咨询报告：条理清晰、论据充分、可操作性强。不用玄学术语，用认知行为和决策分析框架。每段给具体行动建议。开头说"📊 让我们理性分析一下..."',
      warm: '你是"小鹿"，一位温暖亲切的塔罗解读师。你像知心姐姐，善于共情倾听。解读充满关怀和鼓励，总能在困难中找到希望。说话亲切自然，偶尔用可爱语气词和emoji。擅长从情感角度深入分析。风格温暖、治愈、有同理心。开头说"🌸 亲爱的，让我们一起看看牌在说什么吧~"',
      punk: '你是"Rex"，一位叛逆不羁的塔罗解读师。说话直接犀利，不拐弯抹角。解读像摇滚乐一样有冲击力——把真相扔到面前。讨厌含糊其辞，一针见血。但犀利外表下很关心每个提问者。偶尔用网络流行语和俚语。风格直接、犀利、有态度。开头说"🔥 行，让我看看命运给你发了什么牌——"',
    };
    const readerStyleKey = bodyReaderStyle || 'mystic';
    const readerPrompt = readingReaderStyles[readerStyleKey] || readingReaderStyles.mystic;
    const systemContent = readerPrompt + ' 【核心规则】严格区分正位和逆位含义。对决策类问题要给出明确方向和具体建议，不要模棱两可。\n【输出风格】不要使用**加粗**格式和markdown标记。用自然口语化的段落，像聊天一样。不要用AI味表达。语气自然有个性。给出具体可执行的行动建议。';

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
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      res.write(`data: ${JSON.stringify({ error: 'DeepSeek API error: ' + response.status })}\n\n`);
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
    try {
      res.write(`data: ${JSON.stringify({ error: '解读失败，请重试' })}\n\n`);
      res.end();
    } catch {
      return res.status(500).json({ error: 'Failed to generate reading' });
    }
  }
}

async function handleGetDaily(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const today = new Date().toISOString().split('T')[0];
  const fortune = await DailyFortune.findOne({ userId, date: today });
  
  if (!fortune) return res.status(404).json({ message: '今日还未抽取运势', canDraw: true });
  return res.status(200).json(fortune);
}

async function handleDrawDaily(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const today = new Date().toISOString().split('T')[0];
  const existing = await DailyFortune.findOne({ userId, date: today });
  if (existing) return res.status(400).json({ message: '今日已抽取运势，请明日再来' });
  
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
  if (!spreadType || !interpretation) return res.status(400).json({ message: '缺少必要参数' });
  
  const reading = new Reading({ userId, spreadType, spreadName, cards: readingCards, question, interpretation });
  await reading.save();
  return res.status(201).json({ id: reading._id, message: '保存成功' });
}

async function handleGetTarotReadingDetail(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const reading = await Reading.findOne({ _id: id, userId });
  if (!reading) return res.status(404).json({ message: '记录不存在' });
  return res.status(200).json(reading);
}

async function handleRegister(req, res) {
  await connectDB();
  const { username, email, password, inviteCode } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ message: '请提供所有必填字段' });
  if (password.length < 6) return res.status(400).json({ message: '密码至少6位字符' });
  
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) return res.status(400).json({ message: existingUser.email === email ? '该邮箱已注册' : '该用户名已被使用' });
  
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
      await new PointsLog({ userId: inviter._id, type: 'invite', amount: 50, description: '邀请新用户 ' + username + ' 注册' }).save();
      // Award points to new user too
      userData.points = 20;
    }
  }
  
  const user = new User(userData);
  await user.save();
  
  // Log initial points if invited
  if (userData.points > 0) {
    await new PointsLog({ userId: user._id, type: 'invite', amount: userData.points, description: '受邀注册奖励' }).save();
  }
  
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, points: user.points, inviteCode: user.inviteCode, createdAt: user.createdAt } });
}

async function handleLogin(req, res) {
  await connectDB();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: '请提供邮箱和密码' });
  
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: '邮箱或密码错误' });
  
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) return res.status(401).json({ message: '邮箱或密码错误' });
  
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, birthday: user.birthday || '', createdAt: user.createdAt } });
}

async function handleGetMe(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: '用户不存在' });
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
  if (!email) return res.status(400).json({ message: '请提供邮箱地址' });
  
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: '该邮箱未注册' });
  
  // 实际项目中这里应该发送重置密码邮件
  // 由于邮件服务需要额外配置，这里返回成功提示
  return res.status(200).json({ message: '密码重置链接已发送到您的邮箱（功能开发中）' });
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
  if (!user) return res.status(404).json({ message: '用户不存在' });
  
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
  if (!user) return res.status(404).json({ message: '用户不存在' });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (user.lastCheckIn && new Date(user.lastCheckIn) >= today) {
    return res.status(400).json({ message: '今天已经签到过了', points: user.points, streak: user.checkInStreak || 0 });
  }
  
  // Calculate streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = user.lastCheckIn && new Date(user.lastCheckIn) >= yesterday && new Date(user.lastCheckIn) < today;
  const streak = wasYesterday ? (user.checkInStreak || 0) + 1 : 1;
  
  // Streak bonus: base 10 + streak bonus
  // Day 1: 10, Day 2: 12, Day 3: 15, Day 7: 25, Day 30: 50
  let earnedPoints = 10;
  let bonusDesc = '';
  if (streak >= 30) { earnedPoints = 50; bonusDesc = '连签30天大奖！'; }
  else if (streak >= 14) { earnedPoints = 30; bonusDesc = '连签2周奖励！'; }
  else if (streak >= 7) { earnedPoints = 25; bonusDesc = '连签一周奖励！'; }
  else if (streak >= 3) { earnedPoints = 15; bonusDesc = '连签3天奖励！'; }
  else if (streak >= 2) { earnedPoints = 12; bonusDesc = '连签奖励！'; }
  
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
  await new PointsLog({ userId, type: 'checkin', amount: earnedPoints, description: bonusDesc ? `每日签到(连续${streak}天 ${bonusDesc})` : '每日签到' }).save();
  for (const ach of newAchievements) {
    const achBonus = ach === 'month_streak' ? 100 : ach === 'centurion' ? 200 : 20;
    await new PointsLog({ userId, type: 'achievement', amount: achBonus, description: `成就解锁：${ach}` }).save();
  }
  
  return res.status(200).json({ 
    message: bonusDesc ? `签到成功！${bonusDesc}+${earnedPoints}积分` : `签到成功！+${earnedPoints}积分`,
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
  if (!user) return res.status(404).json({ message: '用户不存在' });
  
  if (!user.inviteCode) {
    user.inviteCode = user.username.slice(0, 4).toLowerCase() + user._id.toString().slice(-4);
    await user.save();
  }
  
  const inviteUrl = 'https://2or.com/register?invite=' + user.inviteCode;
  
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
    if (!reading) return res.status(404).json({ message: '记录不存在' });
    
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
          await new PointsLog({ userId: shareUserId, type: 'share', amount: 5, description: '分享占卜结果' }).save();
        }
      } catch (e) {}
    }
    
    return res.status(200).json({ shareId, shareUrl: '/share/' + shareId, pointsEarned: shareUserId ? 5 : 0 });
  } catch (err) {
    return res.status(500).json({ message: '分享失败' });
  }
}

async function handleGetShare(req, res, shareId) {
  await connectDB();
  
  try {
    const reading = await Reading.findOne({ shareId, isShared: true });
    if (!reading) return res.status(404).json({ message: '分享不存在或已取消' });
    
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
  if (result.deletedCount === 0) return res.status(404).json({ message: '记录不存在' });
  return res.status(200).json({ message: '删除成功' });
}
// Follow-up question handler (SSE streaming)
async function handleFollowUp(req, res, readingId) {
  await connectDB();
  const body = req.body || {};
  const { question: followUpQuestion } = body;
  
  if (!followUpQuestion || !readingId) {
    return res.status(400).json({ error: '缺少追问内容或解读ID' });
  }
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DeepSeek API key not configured' });
  
  // Auth check - only logged in users can follow up
  const authUserId = await authMiddleware(req, res, true);
  if (!authUserId) {
    return res.status(401).json({ error: '请先登录', message: '追问功能需要登录，登录后每次追问消耗1积分' });
  }
  
  // Check points (1 point per follow-up)
  const FOLLOWUP_COST = 1;
  const user = await User.findById(authUserId);
  if (!user || (user.points || 0) < FOLLOWUP_COST) {
    return res.status(403).json({ error: '积分不足', message: '追问需要' + FOLLOWUP_COST + '积分，当前积分：' + (user?.points || 0) });
  }
  
  // Find the original reading
  const reading = await Reading.findById(readingId);
  if (!reading) {
    return res.status(404).json({ error: '找不到原始解读记录' });
  }
  
  // Deduct points
  user.points = (user.points || 0) - FOLLOWUP_COST;
  await user.save();
  await new PointsLog({ userId: authUserId, type: 'spend', amount: -FOLLOWUP_COST, description: '追问消耗' }).save();
  
  // Build context from original reading
  const cardInfo = reading.cards.map((c, i) => {
    const orientation = c.orientation === 'reversed' ? '逆位' : '正位';
    return `第${i + 1}张：${c.name}（${c.nameEn}）[${orientation}] - ${c.meaning || ''}`;
  }).join('\n');
  
  // Build conversation history with reader style
  const fuReaderStyles = {
    mystic: '你是"月影灵师"，一位神秘而深邃的塔罗解读师。你的语言充满灵性和诗意，善于用隐喻和意象传递信息。风格温柔而深邃，如月光照进暗处。',
    rational: '你是"苏格拉"，一位理性严谨的塔罗分析师。你用逻辑和心理学视角解读塔罗牌，解读像专业咨询报告：条理清晰、论据充分、可操作性强。',
    warm: '你是"小鹿"，一位温暖亲切的塔罗解读师。你像知心姐姐，善于共情倾听。说话亲切自然，偶尔用可爱语气词和emoji。',
    punk: '你是"Rex"，一位叛逆不羁的塔罗解读师。说话直接犀利，不拐弯抹角。解读像摇滚乐一样有冲击力。',
  };
  const readerPrompt = fuReaderStyles[reading.readerStyle] || fuReaderStyles.mystic;
  const systemContent = readerPrompt + ' 用户正在基于之前的塔罗牌解读进行追问。请保持之前的角色和风格，结合牌面信息回答追问。回答简洁有力，控制在300字以内。';
  
  // Build messages array with full conversation history
  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: `我的问题是："${reading.question}"\n\n牌阵：${reading.spreadType}\n\n${cardInfo}` },
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
      res.write(`data: ${JSON.stringify({ error: 'AI服务暂时不可用，积分已退还' })}\n\n`);
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
      res.write(`data: ${JSON.stringify({ error: '追问失败，积分已退还' })}\n\n`);
      res.end();
    } catch {
      return res.status(500).json({ error: '追问失败' });
    }
  }
}

// TTS handler - Microsoft Edge TTS
async function handleTTS(req, res) {
  const body = req.body || {};
  const { text, readerStyle } = body;
  
  if (!text || text.length === 0) {
    return res.status(400).json({ error: '缺少文本内容' });
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
    return res.status(500).json({ error: 'TTS生成失败' });
  }
}

// Lucky Draw - 积分抽奖
async function handleLuckyDraw(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const DRAW_COST = 20;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  if ((user.points || 0) < DRAW_COST) {
    return res.status(400).json({ message: `积分不足，需要${DRAW_COST}积分`, points: user.points });
  }
  
  // Prize pool with weights
  const prizes = [
    { name: '5积分', points: 5, weight: 30 },
    { name: '10积分', points: 10, weight: 25 },
    { name: '20积分', points: 20, weight: 20 },
    { name: '50积分', points: 50, weight: 10 },
    { name: '100积分', points: 100, weight: 3 },
    { name: '免费占卜券x1', points: 0, isCoupon: true, weight: 10 },
    { name: '谢谢参与', points: 0, weight: 2 },
  ];
  
  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  let prize = prizes[prizes.length - 1];
  for (const p of prizes) {
    rand -= p.weight;
    if (rand <= 0) { prize = p; break; }
  }
  
  // Deduct cost
  user.points = (user.points || 0) - DRAW_COST + (prize.points || 0);
  await user.save();
  
  const net = (prize.points || 0) - DRAW_COST;
  await new PointsLog({ userId, type: 'lucky_draw', amount: net, description: `幸运抽奖：${prize.name}` }).save();
  
  return res.status(200).json({
    prize: prize.name,
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
    
    if (!user) return res.status(404).json({ message: '用户不存在' });
    
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
      inviteUrl: 'https://2or.com/register?invite=' + inviteCode,
      logs,
    });
  } catch (err) {
    return res.status(500).json({ message: '获取积分信息失败' });
  }
}

// Get membership status
async function handleGetMembership(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  const user = await User.findById(userId).select('membership membershipExpiry points');
  if (!user) return res.status(404).json({ message: '用户不存在' });
  
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
      { id: 'monthly', name: '月度会员', price: '19.9元/月', pointsPrice: 500, duration: 30, features: ['无限占卜', '全部塔罗师', '无限追问', '语音解读', '专属卡背'] },
      { id: 'yearly', name: '年度会员', price: '168元/年', pointsPrice: 4000, duration: 365, features: ['包含月度所有权益', '全年省75元', '优先体验新功能', '专属年度运势报告'] },
      { id: 'weekly', name: '周体验卡', price: '6.9元/周', pointsPrice: 150, duration: 7, features: ['无限占卜', '全部塔罗师', '无限追问'] },
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
    weekly: { points: 150, days: 7, name: '周体验卡' },
    monthly: { points: 500, days: 30, name: '月度会员' },
    yearly: { points: 4000, days: 365, name: '年度会员' },
  };
  
  const plan = plans[planId];
  if (!plan) return res.status(400).json({ message: '无效的订阅计划' });
  
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  
  if ((user.points || 0) < plan.points) {
    return res.status(400).json({ message: `积分不足，需要${plan.points}积分，当前${user.points || 0}积分`, needPoints: plan.points });
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
  
  await new PointsLog({ userId, type: 'subscribe', amount: -plan.points, description: `订阅${plan.name}` }).save();
  
  return res.status(200).json({
    message: `${plan.name}订阅成功！`,
    membership: user.membership,
    membershipExpiry: newExpiry,
    daysLeft: plan.days,
    points: user.points,
  });
}
