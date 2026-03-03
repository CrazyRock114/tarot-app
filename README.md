# 🔮 AI塔罗占卜平台

一个现代化的AI驱动塔罗牌占卜应用，复刻 https://tarotqa.com/ 的核心功能。

## ✨ 功能特性

### 核心占卜功能
- 🤖 **AI塔罗占卜** - 用户输入问题，系统推荐牌阵，AI进行深度解读
- 🎴 **传统随机抽牌** - 模拟真实抽牌过程，带动态翻牌效果
- 🔢 **幸运数字选牌** - 输入1-78数字关联选牌
- ✅ **Yes/No塔罗** - 针对简单问题快速决策
- 📅 **每日运势** - 24小时更新个人运势(预留接口)

### 个性化功能
- 🎭 **AI塔罗师选择** - 直觉系、逻辑系、治愈系、神秘系等不同风格
- 📚 **塔罗图鉴** - 78张塔罗牌(大阿尔克那22张+小阿尔克那56张)的正逆位含义
- 🔮 **牌阵教学** - 5种经典牌阵(单张牌、三张牌、凯尔特十字、关系牌阵、决策牌阵)
- 👤 **用户历史记录** - 保存和查看过往占卜记录

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Framer Motion |
| 后端 | Node.js + Express |
| 数据库 | MongoDB (预留接口) |
| AI解读 | 预留 OpenAI API 接口 |
| 构建工具 | Vite |

## 📁 项目结构

```
tarot-app/
├── client/                    # React前端
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── common/        # 通用组件
│   │   │   ├── tarot/         # 塔罗相关组件
│   │   │   │   ├── TarotCard.tsx      # 塔罗牌组件
│   │   │   │   ├── TarotGallery.tsx   # 塔罗图鉴
│   │   │   │   └── CardDrawing.tsx    # 抽牌功能
│   │   │   └── layout/        # 布局组件
│   │   ├── pages/             # 页面
│   │   ├── data/              # 塔罗牌数据
│   │   │   ├── majorArcana.ts # 大阿尔克那(22张)
│   │   │   ├── minorArcana.ts # 小阿尔克那(56张)
│   │   │   └── tarotData.ts   # 牌阵和AI塔罗师数据
│   │   ├── types/             # TypeScript类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── store/             # 状态管理(Zustand)
│   │   └── api/               # API请求
│   └── package.json
├── server/                    # Express后端
│   ├── src/
│   │   ├── routes/            # 路由
│   │   │   ├── auth.ts        # 认证路由
│   │   │   ├── readings.ts    # 占卜记录路由
│   │   │   └── tarot.ts       # 塔罗相关路由
│   │   └── index.ts           # 入口文件
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- MongoDB (可选，当前使用内存存储)

### 安装依赖

```bash
# 克隆项目后进入目录
cd tarot-app

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 启动开发服务器

**方式1: 使用启动脚本**
```bash
cd tarot-app
./start.sh           # 启动前后端
./start.sh client    # 仅启动前端
./start.sh server    # 仅启动后端
```

**方式2: 手动启动**
```bash
# 终端1 - 启动前端
cd client
npm run dev

# 终端2 - 启动后端
cd server
npm run dev
```

### 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:5000

## 📖 使用指南

### 1. 浏览塔罗图鉴
访问 `/gallery` 页面查看全部78张塔罗牌：
- 按牌组筛选(大阿尔克那/权杖/圣杯/宝剑/星币)
- 搜索牌名或关键词
- 点击卡片查看详细信息(正逆位含义、元素、星座等)

### 2. 开始抽牌
访问 `/draw` 页面：
- **随机抽牌**: 选择牌阵，模拟洗牌动画后抽牌
- **幸运数字**: 输入1-78的数字，抽取对应牌
- **Yes/No**: 针对简单问题快速获得是/否答案

### 3. 查看结果
- 牌阵位置说明
- 正逆位显示
- 关键词和详细解读
- AI深度解读(预留接口)

## 🔌 API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户

### 占卜记录
- `GET /api/readings` - 获取用户占卜历史
- `POST /api/readings` - 创建占卜记录
- `DELETE /api/readings/:id` - 删除占卜记录

### 塔罗
- `GET /api/tarot/cards` - 获取所有牌
- `GET /api/tarot/spreads` - 获取所有牌阵
- `POST /api/tarot/interpret` - AI解读(预留OpenAI接口)

## 🗓️ 工时评估

| 模块 | 功能点 | 工时(天) |
|------|--------|---------|
| 基础架构 | 项目初始化、目录结构、配置 | 0.5 |
| 塔罗数据层 | 78张牌数据录入、图鉴结构 | 1 |
| 抽牌核心 | 随机算法、翻牌动画、牌阵逻辑 | 1.5 |
| 图鉴系统 | 列表展示、详情页、筛选搜索 | 1 |
| AI占卜 | 问题输入、牌阵推荐、AI接口预留 | 1 |
| 用户系统 | 注册登录、历史记录 | 1 |
| UI/UX | 主题样式、动效优化 | 1 |
| 测试部署 | 功能测试、部署配置 | 1 |
| **合计** | | **8天** |

## 🔮 已实现功能

✅ 塔罗图鉴 - 78张牌完整数据
✅ 传统随机抽牌 - 5种牌阵
✅ 幸运数字选牌
✅ Yes/No快速决策
✅ 翻牌动画效果
✅ 响应式设计
✅ 后端API框架

## 📋 待实现功能

- [ ] AI深度解读(OpenAI接入)
- [ ] 每日运势
- [ ] 用户系统完善
- [ ] 历史记录持久化(MongoDB)
- [ ] 塔罗牌图片资源
- [ ] 部署配置

## 🔒 环境变量

### 后端 (.env)
```
PORT=5000
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/tarot-app
OPENAI_API_KEY=your-openai-api-key
```

### 前端 (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📄 许可证

MIT
