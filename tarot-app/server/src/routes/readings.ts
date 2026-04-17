import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Reading } from '../models/Reading';

const router = Router();

// Get all readings for user
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const readings = await Reading.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-interpretation');
    res.json(readings);
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({ message: 'Failed to get reading history' });
  }
});

// Get single reading detail
router.get('/:id', authMiddleware, async (req: any, res) => {
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
    console.error('Get reading detail error:', error);
    res.status(500).json({ message: 'Failed to get reading detail' });
  }
});

// Delete reading
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const result = await Reading.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({ message: 'Failed to delete reading' });
  }
});

export default router;
