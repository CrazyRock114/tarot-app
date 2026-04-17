// 本地开发服务器 - 将 Vercel Serverless Function 包装为 Express 服务器
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量 - 使用绝对路径确保正确加载
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 优先加载 .env.local，如果不存在则加载 .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || '5000';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 导入 Vercel handler
import handler from './index';

// 包装 Vercel handler 为 Express middleware
app.all('*', async (req, res) => {
  // 适配 request 对象
  const vercelReq = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
  };

  // 适配 response 对象
  const vercelRes = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      res.setHeader(key, value);
    },
    status(code: number) {
      this.statusCode = code;
      res.status(code);
      return this;
    },
    json(data: any) {
      res.json(data);
    },
    end(data?: any) {
      res.end(data);
    },
    write(data: any) {
      res.write(data);
    },
  };

  try {
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});
