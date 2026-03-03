# AI 塔罗占卜平台

基于 DeepSeek AI 的智能塔罗牌解读平台，支持多种牌阵、流式 AI 解读、用户系统和历史记录。

## 功能特性

- 🔮 多种抽牌模式：随机抽牌、幸运数字、Yes/No
- 🎴 5种经典牌阵：单张牌、三张牌、凯尔特十字、关系牌阵、决策牌阵
- 🤖 AI 深度解读：基于 DeepSeek API 的流式智能解读
- 👤 用户系统：注册/登录、JWT 认证
- 📜 历史记录：保存和查看过往占卜记录
- 📱 响应式设计：支持桌面和移动端

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Framer Motion
- **后端**: Express + TypeScript + MongoDB
- **AI**: DeepSeek API
- **部署**: Vercel

## 本地开发

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
DEEPSEEK_API_KEY=your-api-key
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

### 3. 启动开发服务器

```bash
npm run dev
```

前端运行在 http://localhost:5173
后端运行在 http://localhost:5000

## Vercel 部署

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/tarot-app.git
git push -u origin main
```

### 2. Vercel 配置

1. 在 Vercel 导入项目
2. 添加环境变量：
   - `DEEPSEEK_API_KEY`
   - `MONGODB_URI`
   - `JWT_SECRET`
3. 部署

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |
| `MONGODB_URI` | MongoDB 连接字符串 | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | ✅ |

## 项目结构

```
tarot-app/
├── api/              # Vercel Serverless Functions
│   └── index.ts      # API 入口
├── client/           # 前端 React 应用
│   ├── src/
│   │   ├── api/      # API 调用
│   │   ├── components/
│   │   ├── contexts/ # React Context
│   │   ├── pages/    # 页面组件
│   │   └── ...
├── server/           # 后端 (本地开发)
│   └── src/
│       ├── models/   # MongoDB 模型
│       ├── routes/   # API 路由
│       └── ...
└── vercel.json       # Vercel 配置
```

## License

MIT
