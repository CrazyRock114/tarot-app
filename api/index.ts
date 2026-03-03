// Vercel原生Serverless Functions - 不使用Express
// 核心API：health、tarot/cards、tarot/reading

// 更详细的日志
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

// 塔罗牌数据（内存存储）
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
    
    // 404
    log('404 Not Found', { path, method });
    return res.status(404).json({ error: 'Not found', path, method });
    
  } catch (error) {
    log('Handler error:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}

// 健康检查
function handleHealth(req, res) {
  return res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString() 
  });
}

// 获取所有塔罗牌
function handleCards(req, res) {
  return res.status(200).json(cards);
}

// AI解读
async function handleReading(req, res) {
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
  
  const { cards: selectedCards, spreadType, question } = body;
  
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
      
      return res.status(200).json({ 
        reading,
        cards: selectedCards,
        question,
        spreadType,
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
