import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Reading } from '../models/Reading.js';

const router = Router();

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 牌阵定义
const spreads = [
  {
    id: 'single',
    name: '单张牌',
    cardCount: 1,
    positions: [{ index: 0, name: '核心信息', meaning: '当前情况的核心指引或答案' }],
  },
  {
    id: 'three-card',
    name: '三张牌',
    cardCount: 3,
    positions: [
      { index: 0, name: '过去', meaning: '影响当前情况的过去因素' },
      { index: 1, name: '现在', meaning: '当前的情况和挑战' },
      { index: 2, name: '未来', meaning: '可能的未来发展' },
    ],
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    cardCount: 10,
    positions: [
      { index: 0, name: '当前状况', meaning: '你现在的情况' },
      { index: 1, name: '挑战', meaning: '阻碍或辅助你的力量' },
      { index: 2, name: '基础', meaning: '问题的基础和根源' },
      { index: 3, name: '过去', meaning: '正在消散的影响' },
      { index: 4, name: '未来', meaning: '即将到来的影响' },
      { index: 5, name: '自我', meaning: '你的态度和感受' },
      { index: 6, name: '环境', meaning: '外部影响和他人态度' },
      { index: 7, name: '希望/恐惧', meaning: '你的希望或恐惧' },
      { index: 8, name: '结果', meaning: '最终结果或建议' },
    ],
  },
  {
    id: 'relationship',
    name: '关系牌阵',
    cardCount: 5,
    positions: [
      { index: 0, name: '你的立场', meaning: '你在关系中的状态和感受' },
      { index: 1, name: '对方的立场', meaning: '对方在关系中的状态和感受' },
      { index: 2, name: '关系动态', meaning: '你们之间的能量流动' },
      { index: 3, name: '挑战', meaning: '关系面临的困难或障碍' },
      { index: 4, name: '潜力', meaning: '关系的可能发展方向' },
    ],
  },
  {
    id: 'decision',
    name: '决策牌阵',
    cardCount: 4,
    positions: [
      { index: 0, name: '现状', meaning: '当前情况的全面图景' },
      { index: 1, name: '选择A', meaning: '选择第一条路的结果' },
      { index: 2, name: '选择B', meaning: '选择第二条路的结果' },
      { index: 3, name: '建议', meaning: '帮助你决策的指引' },
    ],
  },
];

// 获取所有牌阵
router.get('/spreads', (req, res) => {
  res.json(spreads);
});

// AI 解读 - 流式输出
router.post('/interpret', async (req, res) => {
  try {
    const { spreadType, cards, question } = req.body;

    if (!spreadType || !cards || !question) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    const spread = spreads.find(s => s.id === spreadType);
    if (!spread) {
      return res.status(400).json({ message: '无效的牌阵类型' });
    }

    // 检查 API Key
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ message: '服务器未配置 AI API Key' });
    }

    // 构建牌阵描述
    const cardsDescription = cards.map((c: any, index: number) => {
      const positionName = spread.positions[index]?.name || `位置 ${index + 1}`;
      const orientation = c.orientation === 'reversed' ? '逆位' : '正位';
      const meaning = c.orientation === 'reversed'
        ? c.card?.meanings?.reversed || c.meaningReversed
        : c.card?.meanings?.upright || c.meaning;
      const cardName = c.card?.name || c.cardName || '未知';
      return `位置 ${index + 1}（${positionName}）：${cardName}（${orientation}）- ${meaning}`;
    }).join('\n');

    // 构建系统提示词
    const systemPrompt = `你是一位专业的塔罗牌解读师，拥有深厚的塔罗知识和丰富的解读经验。

你的解读风格：
- 温和而深刻，富有洞察力
- 结合现代心理学和传统塔罗智慧
- 提供具体可行的建议
- 尊重求问者的自由意志

解读时请注意：
1. 先简要说明牌阵的整体能量
2. 逐张解读每张牌在其位置上的含义
3. 分析牌与牌之间的关联
4. 最后给出综合建议和指引`;

    // 构建用户提示词
    const userPrompt = `牌阵：${spread.name}
问题：${question}

抽到的牌：
${cardsDescription}

请为这次占卜提供详细的解读。`;

    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        stream: true,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API 错误:', errorData);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

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
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('解读错误:', error);
    res.write(`data: ${JSON.stringify({ error: '解读失败，请重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// 保存解读记录（需要登录）
router.post('/readings', authMiddleware, async (req: any, res) => {
  try {
    const { spreadType, spreadName, cards, question, interpretation } = req.body;

    const reading = new Reading({
      userId: req.userId,
      spreadType,
      spreadName,
      cards,
      question,
      interpretation,
    });

    await reading.save();
    res.status(201).json({ id: reading._id, message: '保存成功' });
  } catch (error) {
    console.error('保存记录错误:', error);
    res.status(500).json({ message: '保存失败' });
  }
});

// 获取用户的解读历史
router.get('/readings', authMiddleware, async (req: any, res) => {
  try {
    const readings = await Reading.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-interpretation');
    res.json(readings);
  } catch (error) {
    console.error('获取历史错误:', error);
    res.status(500).json({ message: '获取历史记录失败' });
  }
});

// 获取单个解读详情
router.get('/readings/:id', authMiddleware, async (req: any, res) => {
  try {
    const reading = await Reading.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reading) {
      return res.status(404).json({ message: '记录不存在' });
    }

    res.json(reading);
  } catch (error) {
    console.error('获取详情错误:', error);
    res.status(500).json({ message: '获取记录失败' });
  }
});

export default router;
