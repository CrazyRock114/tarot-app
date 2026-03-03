import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route without MongoDB
const spreads = [
  { id: 'single', name: '单张牌', cardCount: 1 },
  { id: 'three-card', name: '三张牌', cardCount: 3 },
];

app.get('/api/tarot/spreads', (req, res) => {
  res.json(spreads);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Export wrapped handler for Vercel
export default serverless(app);
