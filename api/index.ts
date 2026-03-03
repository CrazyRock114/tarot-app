import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes from server/src
import authRoutes from '../server/src/routes/auth';
import readingRoutes from '../server/src/routes/readings';
import tarotRoutes from '../server/src/routes/tarot';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - 注意：在Vercel中，/api前缀已经被函数路径处理
app.use('/auth', authRoutes);
app.use('/readings', readingRoutes);
app.use('/tarot', tarotRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Vercel Serverless 模式：导出 handler
export default app;
