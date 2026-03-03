import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes from server/src
import authRoutes from '../server/src/routes/auth';
import readingRoutes from '../server/src/routes/readings';
import tarotRoutes from '../server/src/routes/tarot';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB 连接 (延迟连接，避免冷启动问题)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI 未设置');
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB 连接成功');
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err);
  }
};

// 所有路由前连接数据库
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes - 注意：在Vercel中，/api前缀已经被函数路径处理
app.use('/auth', authRoutes);
app.use('/readings', readingRoutes);
app.use('/tarot', tarotRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbConnected: isConnected,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Vercel Serverless 模式：导出 handler
export default app;
