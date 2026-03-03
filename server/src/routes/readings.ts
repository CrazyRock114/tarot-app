import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock readings database
const readings: any[] = [];

// Middleware to verify token
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user readings
router.get('/', authenticate, (req: any, res) => {
  const userReadings = readings.filter(r => r.userId === req.userId);
  res.json(userReadings);
});

// Create reading
router.post('/', authenticate, (req: any, res) => {
  const { question, spreadId, cards, interpretation } = req.body;

  const reading = {
    id: Date.now().toString(),
    userId: req.userId,
    question,
    spreadId,
    cards,
    interpretation,
    createdAt: new Date(),
  };

  readings.push(reading);
  res.status(201).json(reading);
});

// Get single reading
router.get('/:id', authenticate, (req: any, res) => {
  const reading = readings.find(r => r.id === req.params.id && r.userId === req.userId);
  if (!reading) {
    return res.status(404).json({ error: 'Reading not found' });
  }
  res.json(reading);
});

// Delete reading
router.delete('/:id', authenticate, (req: any, res) => {
  const index = readings.findIndex(r => r.id === req.params.id && r.userId === req.userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Reading not found' });
  }
  readings.splice(index, 1);
  res.json({ success: true });
});

export default router;
