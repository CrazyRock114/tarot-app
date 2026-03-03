# Vercel 部署指南

## 📝 总裁需要做的（5分钟）

### 1. 在 Vercel 官网导入项目
1. 访问 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择 `tarot-app` 项目
4. 点击 **Deploy**

### 2. 配置环境变量（必需）
部署完成后，进入项目设置：

| 变量名 | 说明 | 建议值 |
|--------|------|--------|
| `JWT_SECRET` | 用户登录加密密钥 | 随机字符串（20位以上） |
| `OPENAI_API_KEY` | AI解读功能（可选） | 你的 OpenAI API Key |

**设置路径**：
Project Settings → Environment Variables → Add New

### 3. 重新部署（让环境变量生效）
Settings → General → Redeploy

---

## 🔧 技术架构说明

### 项目结构适配
```
tarot-app/
├── client/          # React 前端 (Vite)
├── server/          # Express 后端 (Serverless)
├── vercel.json      # Vercel 路由配置 ← 已创建
└── package.json     # 根目录依赖
```

### 访问地址
部署成功后，Vercel 会分配域名：
- **正式环境**: `https://tarot-app-xxx.vercel.app`
- 可在 Vercel 设置中绑定自定义域名

---

## ⚠️ 注意事项

### 限制说明
1. **Serverless 冷启动**: 首次访问可能有1-2秒延迟
2. **无持久化存储**: 用户数据目前存储在内存，重启后清空
3. **如需数据库**: 建议后续接入 MongoDB Atlas（云端免费版）

### 可选升级
| 功能 | 方案 | 复杂度 |
|------|------|--------|
| 数据库持久化 | MongoDB Atlas | 低 |
| 自定义域名 | Vercel Pro 或绑定自有域名 | 低 |
| AI解读 | 配置 OPENAI_API_KEY | 低 |

---

## 📞 问题排查

**部署失败？**
1. 检查 Vercel 日志：Deployments → 点击失败的部署 → Build Logs
2. 常见原因：依赖安装失败 → 尝试 redeploy

**API 404？**
1. 检查 `vercel.json` 是否已提交到 Git
2. 检查环境变量是否正确设置

**前端白屏？**
1. 可能是 `dist` 目录未生成 → 检查 build 脚本
2. 浏览器 F12 查看 console 错误
