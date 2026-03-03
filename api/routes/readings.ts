import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Reading } from '../models/Reading.js';

const router = Router();

// 获取用户的所有解读记录
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const readings = await Reading.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-interpretation');
    res.json(readings);
  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({ message: '获取历史记录失败' });
  }
});

// 获取单个解读详情
router.get('/:id', authMiddleware, async (req: any, res) => {
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
    console.error('获取解读详情错误:', error);
    res.status(500).json({ message: '获取解读详情失败' });
  }
});

// 删除解读记录
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const result = await Reading.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '记录不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除记录错误:', error);
    res.status(500).json({ message: '删除失败' });
  }
});

export default router;
