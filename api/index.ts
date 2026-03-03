import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
  res.json({ status: 'ok from index', timestamp: new Date().toISOString() });
});

// Vercel Serverless handler
export default async (req: any, res: any) => {
  return app(req, res);
};
