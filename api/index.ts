import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import readingRoutes from './routes/readings';
import tarotRoutes from './routes/tarot';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (with caching for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
};

// Connect DB before all routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes - NOTE: In Vercel, /api prefix is already handled by the function path
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
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Vercel Serverless handler - must export a function
export default async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};
