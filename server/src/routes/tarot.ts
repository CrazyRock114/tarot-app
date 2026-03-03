import { Router } from 'express';

const router = Router();

// Get all cards (will import from data in production)
router.get('/cards', (req, res) => {
  res.json({ message: 'Cards endpoint - import from client data' });
});

// Get single card
router.get('/cards/:id', (req, res) => {
  res.json({ message: `Card ${req.params.id}` });
});

// Get all spreads
router.get('/spreads', (req, res) => {
  const spreads = [
    {
      id: 'single',
      name: '单张牌',
      nameEn: 'Single Card',
      description: '最简洁直接的占卜方式',
      cardCount: 1,
    },
    {
      id: 'three-card',
      name: '三张牌',
      nameEn: 'Three Card Spread',
      description: '过去、现在、未来',
      cardCount: 3,
    },
    {
      id: 'celtic-cross',
      name: '凯尔特十字',
      nameEn: 'Celtic Cross',
      description: '最全面的经典牌阵',
      cardCount: 10,
    },
  ];
  res.json(spreads);
});

// AI interpretation endpoint
router.post('/interpret', async (req, res) => {
  const { question, cards, readerStyle } = req.body;
  
  // This is a placeholder - in production, this would call OpenAI API
  res.json({
    interpretation: `AI解读示例：\n\n关于"${question}"的问题，从抽到的牌来看...\n\n[这里将调用OpenAI API生成详细解读]`,
    readerStyle,
  });
});

export default router;
