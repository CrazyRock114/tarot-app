# 快速入门指南

## 🚀 5分钟启动项目

### 1. 安装依赖
```bash
cd tarot-app/client
npm install

cd ../server
npm install
```

### 2. 启动开发服务器
```bash
# 在项目根目录执行
./start.sh
```

或者手动启动：
```bash
# 终端1: 启动前端 (端口3000)
cd client && npm run dev

# 终端2: 启动后端 (端口5000)
cd server && npm run dev
```

### 3. 访问应用
打开浏览器访问: http://localhost:3000

## 📱 功能导航

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 功能概览、AI塔罗师介绍 |
| 抽牌 | `/draw` | 随机抽牌/幸运数字/YesNo |
| 图鉴 | `/gallery` | 78张塔罗牌浏览和搜索 |
| 我的 | `/profile` | 用户中心(预留) |

## ✨ 已实现功能

✅ **塔罗图鉴** - 78张牌完整数据(22张大阿尔克那 + 56张小阿尔克那)
✅ **随机抽牌** - 5种牌阵选择，带洗牌动画
✅ **幸运数字选牌** - 输入1-78数字抽取对应牌
✅ **Yes/No决策** - 快速获得是/否答案
✅ **翻牌动画** - Framer Motion驱动的流畅动画
✅ **响应式设计** - 适配移动端和桌面端
✅ **后端API框架** - Express + TypeScript

## 📁 核心代码文件

```
client/src/
├── data/
│   ├── majorArcana.ts    # 大阿尔克那22张牌数据
│   ├── minorArcana.ts    # 小阿尔克那56张牌数据
│   └── tarotData.ts      # 牌阵和AI塔罗师数据
├── components/tarot/
│   ├── TarotCard.tsx     # 塔罗牌组件
│   ├── TarotGallery.tsx  # 图鉴页面
│   └── CardDrawing.tsx   # 抽牌功能
└── utils/tarotUtils.ts   # 抽牌算法工具

server/src/
└── routes/
    ├── auth.ts           # 用户认证
    ├── readings.ts       # 占卜记录
    └── tarot.ts          # 塔罗API
```

## 🔮 牌阵说明

1. **单张牌** - 最简洁的直接指引
2. **三张牌** - 过去、现在、未来
3. **凯尔特十字** - 10张牌全面解读
4. **关系牌阵** - 探索两人关系动态
5. **决策牌阵** - 帮助做出重要决定

## 🛠️ 技术亮点

- **类型安全**: 完整的TypeScript类型定义
- **状态管理**: Zustand轻量级状态管理
- **动画效果**: Framer Motion流畅动画
- **响应式**: Tailwind CSS移动优先设计
- **代码量**: 约2400行代码

## 📝 下一步

查看 `README.md` 获取完整项目文档
