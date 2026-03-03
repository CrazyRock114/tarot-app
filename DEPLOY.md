# 部署指南

## ✅ 已完成的工作

### 1. 后端集成
- ✅ MongoDB 用户模型 (User.ts)
- ✅ MongoDB 解读记录模型 (Reading.ts)
- ✅ JWT 认证中间件
- ✅ 用户认证路由 (注册/登录/获取用户信息)
- ✅ 塔罗牌 API 路由
- ✅ DeepSeek AI 流式解读功能
- ✅ 历史记录保存和查询

### 2. 前端集成
- ✅ API 层封装 (api/tarot.ts)
- ✅ AuthContext 认证上下文
- ✅ 登录页面 (Login.tsx)
- ✅ 注册页面 (Register.tsx)
- ✅ 历史记录页面 (History.tsx)
- ✅ AI解读结果页面 (Interpretation.tsx)
- ✅ 更新抽牌页面 (添加问题输入和AI解读按钮)
- ✅ 更新导航栏 (用户菜单/登录状态)
- ✅ 更新个人中心页面

### 3. 配置文件
- ✅ vercel.json - Vercel 配置
- ✅ api/index.ts - Serverless 入口
- ✅ package.json 更新
- ✅ .env.example - 环境变量模板
- ✅ README.md - 完整文档

### 4. GitHub
- ✅ 代码已推送到 https://github.com/CrazyRock114/tarot-app

---

## 🚀 部署步骤

### 前提条件
- 安装 Node.js 20+
- 安装 Vercel CLI: `npm i -g vercel`
- 有 Vercel 账号

### 步骤 1: 登录 Vercel
```bash
vercel login
```

### 步骤 2: 部署
```bash
cd /home/ecs-user/.openclaw/workspace/tarot-app
vercel
```

首次部署会询问：
- Set up "~/tarot-app"? [Y/n] → 输入 Y
- Which scope do you want to deploy to? → 选择你的账号
- Link to existing project? [y/N] → 输入 N (创建新项目)
- What's your project name? [tarot-app] → 按 Enter 或输入自定义名称
- In which directory is your code located? [./] → 按 Enter

### 步骤 3: 配置环境变量
在 Vercel Dashboard 中：
1. 进入你的项目
2. 点击 Settings → Environment Variables
3. 添加以下变量：

```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tarot?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters
```

### 步骤 4: 重新部署
```bash
vercel --prod
```

---

## 🔧 获取必要密钥

### DeepSeek API Key
1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key

### MongoDB URI
1. 访问 https://www.mongodb.com/atlas
2. 创建免费集群
3. 在 Database Access 创建用户
4. 在 Network Access 添加 IP: 0.0.0.0/0 (允许所有)
5. 点击 Connect → Drivers → Node.js
6. 复制连接字符串，替换密码

### JWT Secret
生成随机字符串：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 功能测试清单

### 基础功能
- [ ] 首页正常显示
- [ ] 抽牌页面可以进入
- [ ] 选择牌阵并输入问题
- [ ] 抽牌动画正常
- [ ] 点击"AI深度解读"跳转到解读页面

### 用户系统
- [ ] 注册页面可访问
- [ ] 可以注册新用户
- [ ] 可以登录已有用户
- [ ] 登录后显示用户名
- [ ] 可以退出登录

### AI解读
- [ ] 流式解读正常显示
- [ ] 解读内容有逐字输出效果
- [ ] 解读完成后可以保存记录

### 历史记录
- [ ] 登录后可以查看历史记录
- [ ] 历史记录列表显示正常
- [ ] 可以查看单条历史详情
- [ ] 可以删除历史记录

---

## 📁 项目文件变更汇总

```
tarot-app/
├── api/index.ts                    [更新] 添加 MongoDB 连接
├── server/src/models/User.ts       [新增] 用户模型
├── server/src/models/Reading.ts    [新增] 记录模型
├── server/src/middleware/auth.ts   [新增] 认证中间件
├── server/src/routes/auth.ts       [更新] MongoDB 认证
├── server/src/routes/tarot.ts      [更新] DeepSeek AI 解读
├── server/src/routes/readings.ts   [更新] 历史记录
├── server/src/index.ts             [更新] MongoDB 连接
├── client/src/api/tarot.ts         [新增] API 封装
├── client/src/contexts/AuthContext.tsx [新增] 认证上下文
├── client/src/pages/Login.tsx      [新增] 登录页面
├── client/src/pages/Register.tsx   [新增] 注册页面
├── client/src/pages/History.tsx    [新增] 历史记录
├── client/src/pages/Interpretation.tsx [新增] AI解读页面
├── client/src/pages/Profile.tsx    [更新] 用户信息展示
├── client/src/components/layout/Layout.tsx [更新] 用户菜单
├── client/src/components/tarot/CardDrawing.tsx [更新] AI解读按钮
├── client/src/App.tsx              [更新] 添加新路由
└── README.md                       [更新] 完整文档
```

---

## 🎉 完成！

集成工作已全部完成！项目包含：
- 完整的 DeepSeek AI 塔罗解读功能
- 用户注册/登录系统
- 历史记录保存
- 响应式精美UI
- 流式AI解读输出

只需按照上方部署步骤配置环境变量并部署即可使用！
