# AI 塔罗占卜平台

基于 DeepSeek AI 的智能塔罗牌解读平台，支持多种牌阵、流式 AI 解读、用户系统和历史记录。

**在线演示**: [https://tarot-app-demo.vercel.app](https://tarot-app-demo.vercel.app)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCrazyRock114%2Ftarot-app&env=DEEPSEEK_API_KEY,MONGODB_URI,JWT_SECRET&envDescription=API%20Keys%20needed%20for%20the%20application&envLink=https%3A%2F%2Fgithub.com%2FCrazyRock114%2Ftarot-app%23environment-variables)

## 功能特性

- 🔮 **多种抽牌模式**：随机抽牌、幸运数字、Yes/No
- 🎴 **5种经典牌阵**：单张牌、三张牌、凯尔特十字、关系牌阵、决策牌阵
- 🤖 **AI 深度解读**：基于 DeepSeek API 的流式智能解读
- 👤 **用户系统**：注册/登录、JWT 认证
- 📜 **历史记录**：保存和查看过往占卜记录
- 📱 **响应式设计**：支持桌面和移动端
- ✨ **精美动画**：翻牌动画、流畅过渡效果

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **后端**: Express + TypeScript + MongoDB
- **AI**: DeepSeek API (流式输出)
- **部署**: Vercel Serverless

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/CrazyRock114/tarot-app.git
cd tarot-app
```

### 2. 安装依赖

```bash
npm run install:all
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
# DeepSeek API Key (必填)
# 获取地址: https://platform.deepseek.com/
DEEPSEEK_API_KEY=sk-your-api-key

# MongoDB 连接字符串 (必填)
# 获取地址: https://www.mongodb.com/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tarot?retryWrites=true&w=majority

# JWT 密钥 (必填，用于用户认证)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

### 4. 本地开发

```bash
# 同时启动前端和后端
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:5000

## Vercel 部署

### 方法一：使用 Vercel CLI (推荐)

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   # 首次部署，会引导你创建项目
   vercel
   
   # 后续部署到生产环境
   vercel --prod
   ```

4. **配置环境变量**
   
   在 Vercel Dashboard → Project Settings → Environment Variables 中添加：
   - `DEEPSEEK_API_KEY`
   - `MONGODB_URI`
   - `JWT_SECRET`

### 方法二：Git 集成自动部署

1. 将代码推送到 GitHub
2. 在 Vercel Dashboard 中导入 GitHub 项目
3. 配置环境变量（同上）
4. 每次推送到 main 分支会自动部署

### 方法三：GitHub Actions 自动部署

1. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
   - `VERCEL_TOKEN` (从 https://vercel.com/account/tokens 获取)
   - `DEEPSEEK_API_KEY`
   - `MONGODB_URI`
   - `JWT_SECRET`

2. 推送到 main 分支会自动触发部署

## 环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | [DeepSeek Platform](https://platform.deepseek.com/) |
| `MONGODB_URI` | MongoDB 连接字符串 | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| `JWT_SECRET` | JWT 签名密钥 | 随机生成，至少32位 |

## 项目结构

```
tarot-app/
├── api/                    # Vercel Serverless Functions
│   └── index.ts            # API 入口点
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── api/            # API 调用封装
│   │   ├── components/     # 可复用组件
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── data/           # 塔罗牌数据
│   │   ├── pages/          # 页面组件
│   │   │   ├── Home.tsx
│   │   │   ├── Draw.tsx           # 抽牌页面
│   │   │   ├── Gallery.tsx        # 图鉴页面
│   │   │   ├── Login.tsx          # 登录
│   │   │   ├── Register.tsx       # 注册
│   │   │   ├── History.tsx        # 历史记录
│   │   │   ├── Interpretation.tsx # AI解读结果
│   │   │   └── Profile.tsx
│   │   └── utils/          # 工具函数
├── server/                 # 后端 (本地开发)
│   └── src/
│       ├── models/         # MongoDB 模型
│       │   ├── User.ts
│       │   └── Reading.ts
│       ├── routes/         # API 路由
│       │   ├── auth.ts     # 认证路由
│       │   ├── tarot.ts    # 塔罗API
│       │   └── readings.ts # 历史记录
│       └── middleware/     # 中间件
│           └── auth.ts     # JWT 认证
├── .env.example            # 环境变量示例
├── vercel.json             # Vercel 配置
└── README.md
```

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 塔罗
- `GET /api/tarot/spreads` - 获取牌阵列表
- `POST /api/tarot/interpret` - AI 解读 (SSE 流式)
- `POST /api/tarot/readings` - 保存解读记录
- `GET /api/tarot/readings` - 获取历史记录
- `GET /api/tarot/readings/:id` - 获取单条记录

## 功能演示

### 抽牌流程
1. 选择抽牌模式（随机/数字/YesNo）
2. 输入您的问题
3. 选择牌阵（单张/三张/凯尔特十字等）
4. 点击抽牌，观看翻牌动画
5. 查看AI深度解读
6. 登录后可保存记录

### 流式AI解读
AI解读使用 Server-Sent Events (SSE) 实现实时流式输出，您可以逐字看到解读内容的生成过程。

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT License

## 致谢

- 塔罗牌数据基于 Rider-Waite 牌组
- AI 解读由 DeepSeek API 提供支持
