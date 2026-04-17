import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Reading } from '../models/Reading';

const router = Router();

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Get all spreads
router.get('/spreads', (req, res) => {
  res.json(spreads);
});

// AI interpretation - streaming output
router.post('/interpret', async (req, res) => {
  try {
    const { spreadType, cards, question } = req.body;

    if (!spreadType || !cards || !question) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const spread = spreads.find(s => s.id === spreadType);
    if (!spread) {
      return res.status(400).json({ message: 'Invalid spread type' });
    }

    // Check API Key
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ message: 'AI API Key not configured on server' });
    }

    // Build cards description
    const cardsDescription = cards.map((c: any, index: number) => {
      const positionName = spread.positions[index]?.name || `Position ${index + 1}`;
      const orientation = c.orientation === 'reversed' ? 'Reversed' : 'Upright';
      const meaning = c.orientation === 'reversed'
        ? c.card?.meanings?.reversed || c.meaningReversed
        : c.card?.meanings?.upright || c.meaning;
      const cardName = c.card?.name || c.cardName || 'Unknown';
      return `Position ${index + 1}（${positionName}）：${cardName}（${orientation}）- ${meaning}`;
    }).join('\n');

    // System prompt
    const systemPrompt = `You are a professional tarot reader with deep tarot knowledge and rich reading experience.

Your reading style:
- Warm and insightful, full of wisdom
- Combines modern psychology with traditional tarot wisdom
- Provides specific and actionable advice
- Respects the questioner's free will

When interpreting:
1. Briefly explain the overall energy of the spread
2. Interpret each card in its position
3. Analyze connections between cards
4. Give a comprehensive summary and guidance`;

    // User prompt
    const userPrompt = `Spread: ${spread.name}
Question: ${question}

Cards drawn:
${cardsDescription}

Please provide a detailed reading for this tarot session.`;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call DeepSeek API
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
      console.error('DeepSeek API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    // Process streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream');
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
          // Ignore parse errors
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Interpretation error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Reading failed, please try again' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Save reading (requires login)
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
    res.status(201).json({ id: reading._id, message: 'Saved successfully' });
  } catch (error) {
    console.error('Save reading error:', error);
    res.status(500).json({ message: 'Failed to save reading' });
  }
});

// Get reading history
router.get('/readings', authMiddleware, async (req: any, res) => {
  try {
    const readings = await Reading.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-interpretation');
    res.json(readings);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to get reading history' });
  }
});

// Get single reading detail
router.get('/readings/:id', authMiddleware, async (req: any, res) => {
  try {
    const reading = await Reading.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reading) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(reading);
  } catch (error) {
    console.error('Get detail error:', error);
    res.status(500).json({ message: 'Failed to get reading' });
  }
});

// Spreads data
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

export default router;
