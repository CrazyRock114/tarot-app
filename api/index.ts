// Vercel原生Serverless Functions - 不使用Express
// 核心API：health、tarot/cards、tarot/reading、auth/*、readings/*

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
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  question: { type: String, default: '' },
  spreadType: { type: String, required: true },
  cards: [{ id: String, name: String, nameEn: String, meaning: String, position: String }],
  interpretation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Reading = mongoose.models.Reading || mongoose.model('Reading', ReadingSchema);

// Auth Middleware
const authMiddleware = async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '未提供认证令牌' });
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    res.status(401).json({ message: '无效的认证令牌' });
    return null;
  }
};

// 更详细的日志
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

// 塔罗牌数据
const cards = [
  { id: 'fool', name: '愚人', nameEn: 'The Fool', arcana: 'major', number: 0, meaning: '新的开始，无限可能，自由奔放' },
  { id: 'magician', name: '魔术师', nameEn: 'The Magician', arcana: 'major', number: 1, meaning: '创造力，意志力，显化能力' },
  { id: 'highpriestess', name: '女祭司', nameEn: 'The High Priestess', arcana: 'major', number: 2, meaning: '直觉，内在智慧，潜意识' },
  { id: 'empress', name: '皇后', nameEn: 'The Empress', arcana: 'major', number: 3, meaning: '丰饶，创造力，母性关怀' },
  { id: 'emperor', name: '皇帝', nameEn: 'The Emperor', arcana: 'major', number: 4, meaning: '权威，稳定，结构，控制' },
  { id: 'hierophant', name: '教皇', nameEn: 'The Hierophant', arcana: 'major', number: 5, meaning: '传统，信仰，精神指引' },
  { id: 'lovers', name: '恋人', nameEn: 'The Lovers', arcana: 'major', number: 6, meaning: '爱情，选择，和谐关系' },
  { id: 'chariot', name: '战车', nameEn: 'The Chariot', arcana: 'major', number: 7, meaning: '意志力，胜利，决心前进' },
  { id: 'strength', name: '力量', nameEn: 'Strength', arcana: 'major', number: 8, meaning: '内在力量，勇气，耐心' },
  { id: 'hermit', name: '隐士', nameEn: 'The Hermit', arcana: 'major', number: 9, meaning: '内省，独处，寻求真理' },
  { id: 'wheeloffortune', name: '命运之轮', nameEn: 'Wheel of Fortune', arcana: 'major', number: 10, meaning: '命运转折，变化周期，机遇' },
  { id: 'justice', name: '正义', nameEn: 'Justice', arcana: 'major', number: 11, meaning: '公正，平衡，因果法则' },
  { id: 'hangedman', name: '倒吊人', nameEn: 'The Hanged Man', arcana: 'major', number: 12, meaning: '牺牲，新视角，等待时机' },
  { id: 'death', name: '死神', nameEn: 'Death', arcana: 'major', number: 13, meaning: '结束与转变，新生开始' },
  { id: 'temperance', name: '节制', nameEn: 'Temperance', arcana: 'major', number: 14, meaning: '平衡，调和，耐心' },
  { id: 'devil', name: '恶魔', nameEn: 'The Devil', arcana: 'major', number: 15, meaning: '物质束缚，欲望，阴影面' },
  { id: 'tower', name: '高塔', nameEn: 'The Tower', arcana: 'major', number: 16, meaning: '突然改变，觉醒，打破幻象' },
  { id: 'star', name: '星星', nameEn: 'The Star', arcana: 'major', number: 17, meaning: '希望，灵感，精神指引' },
  { id: 'moon', name: '月亮', nameEn: 'The Moon', arcana: 'major', number: 18, meaning: '潜意识，幻觉，直觉' },
  { id: 'sun', name: '太阳', nameEn: 'The Sun', arcana: 'major', number: 19, meaning: '成功，喜悦，活力' },
  { id: 'judgement', name: '审判', nameEn: 'Judgement', arcana: 'major', number: 20, meaning: '觉醒，重生，内心呼唤' },
  { id: 'world', name: '世界', nameEn: 'The World', arcana: 'major', number: 21, meaning: '完成，圆满，成就' },
];

// CORS响应头 - 支持移动端
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// 主处理函数
export default async function handler(req, res) {
  log(`Request: ${req.method} ${req.url}`, { headers: req.headers });

  // 处理CORS预检
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  // 设置CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  const { url, method } = req;
  const path = url.split('?')[0];

  try {
    // 路由分发
    if (path === '/api/health' && method === 'GET') {
      return handleHealth(req, res);
    }
    
    if (path === '/api/tarot/cards' && method === 'GET') {
      return handleCards(req, res);
    }
    
    if (path === '/api/tarot/reading' && method === 'POST') {
      return handleReading(req, res);
    }

    // 用户认证路由
    if (path === '/api/auth/register' && method === 'POST') {
      return handleRegister(req, res);
    }

    if (path === '/api/auth/login' && method === 'POST') {
      return handleLogin(req, res);
    }

    if (path === '/api/auth/me' && method === 'GET') {
      return handleGetMe(req, res);
    }

    // 历史记录路由
    if (path === '/api/readings' && method === 'GET') {
      return handleGetReadings(req, res);
    }

    if (path.startsWith('/api/readings/') && method === 'GET') {
      const id = path.replace('/api/readings/', '');
      return handleGetReadingDetail(req, res, id);
    }

    if (path.startsWith('/api/readings/') && method === 'DELETE') {
      const id = path.replace('/api/readings/', '');
      return handleDeleteReading(req, res, id);
    }
    
    // 404
    log('404 Not Found', { path, method });
    return res.status(404).json({ error: 'Not found', path, method });
    
  } catch (error) {
    log('Handler error:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}

// 健康检查
async function handleHealth(req, res) {
  await connectDB();
  return res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    db: isConnected
  });
}

// 获取所有塔罗牌
function handleCards(req, res) {
  return res.status(200).json(cards);
}

// AI解读
async function handleReading(req, res) {
  await connectDB();
  log('handleReading called');
  
  // 解析请求体
  let body;
  try {
    body = req.body || {};
    log('Request body received', { bodyKeys: Object.keys(body) });
  } catch (parseError) {
    log('Failed to parse request body', { error: parseError.message });
    return res.status(400).json({ error: 'Invalid request body', message: parseError.message });
  }
  
  const { cards: selectedCards, spreadType, question, save, userId } = body;
  
  // 验证请求数据
  if (!selectedCards || !Array.isArray(selectedCards) || selectedCards.length === 0) {
    log('Invalid cards data', { selectedCards });
    return res.status(400).json({ error: 'Invalid cards data', message: 'Cards must be a non-empty array' });
  }
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    log('DeepSeek API key not configured');
    return res.status(500).json({ error: 'DeepSeek API key not configured' });
  }
  
  try {
    // 构建提示词
    const cardInfo = (selectedCards || []).map((c, i) => {
      // 支持多种数据格式：嵌套结构 {card: {...}} 和平坦结构 {...}
      const card = c.card || c;
      const name = card.name || '未知';
      const nameEn = card.nameEn || card.name_en || '';
      const meaning = card.meaning || card.meanings?.upright || '';
      return `第${i + 1}张：${name}（${nameEn}）- ${meaning}`;
    }).join('\n');
    
    const prompt = `你是一位专业的塔罗牌解读师。用户的问题是："${question || '无具体问题'}"

抽到的牌阵：${spreadType || '三张牌'}

${cardInfo}

请用温暖、专业、富有洞察力的中文进行解读。结合每张牌的位置和意义，给出整体分析和建议。语气要鼓励性，但也要诚实。`;

    log('Calling DeepSeek API', { promptLength: prompt.length });

    // 调用 DeepSeek API - 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是专业的塔罗牌解读师，擅长给出温暖而富有洞察力的解读。' },
            { role: 'user', content: prompt }
          ],
          stream: false,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        log('DeepSeek API error response', { status: response.status, error: errorText });
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const reading = data.choices?.[0]?.message?.content || '无法获取解读结果';
      
      log('Reading generated successfully', { readingLength: reading.length });

      // 如果请求保存且提供了userId，保存到历史记录
      let readingId = null;
      if (save && userId && isConnected) {
        try {
          const newReading = new Reading({
            userId,
            question: question || '',
            spreadType: spreadType || '三张牌',
            cards: selectedCards,
            interpretation: reading,
          });
          await newReading.save();
          readingId = newReading._id;
        } catch (err) {
          console.error('保存历史记录失败:', err);
        }
      }
      
      return res.status(200).json({ 
        reading,
        cards: selectedCards,
        question,
        spreadType,
        readingId,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    log('Reading error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      error: 'Failed to generate reading',
      message: error.message 
    });
  }
}

// ===== 用户认证处理函数 =====

// 注册
async function handleRegister(req, res) {
  await connectDB();
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请提供所有必填字段' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位字符' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? '该邮箱已注册' : '该用户名已被使用' 
      });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ message: '注册失败，请重试' });
  }
}

// 登录
async function handleLogin(req, res) {
  await connectDB();
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: '请提供邮箱和密码' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({ message: '登录失败，请重试' });
  }
}

// 获取当前用户信息
async function handleGetMe(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({ message: '获取用户信息失败' });
  }
}

// ===== 历史记录处理函数 =====

// 获取用户的所有解读记录
async function handleGetReadings(req, res) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  try {
    const readings = await Reading.find({ userId })
      .sort({ createdAt: -1 })
      .select('-interpretation');
    return res.status(200).json(readings);
  } catch (error) {
    console.error('获取历史记录错误:', error);
    return res.status(500).json({ message: '获取历史记录失败' });
  }
}

// 获取单个解读详情
async function handleGetReadingDetail(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  try {
    const reading = await Reading.findOne({ _id: id, userId });
    if (!reading) {
      return res.status(404).json({ message: '记录不存在' });
    }
    return res.status(200).json(reading);
  } catch (error) {
    console.error('获取解读详情错误:', error);
    return res.status(500).json({ message: '获取解读详情失败' });
  }
}

// 删除解读记录
async function handleDeleteReading(req, res, id) {
  await connectDB();
  const userId = await authMiddleware(req, res);
  if (!userId) return;
  
  try {
    const result = await Reading.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '记录不存在' });
    }
    return res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除记录错误:', error);
    return res.status(500).json({ message: '删除失败' });
  }
}
