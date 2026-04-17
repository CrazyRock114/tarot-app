# MongoDB 安装指南

## 方案一：MongoDB Atlas（推荐，5分钟搞定）

### 1. 注册账号
访问 https://www.mongodb.com/cloud/atlas/register
- 使用 Google 账号或邮箱注册

### 2. 创建免费集群
```
1. 点击 "Create New Cluster"
2. 选择 "Shared" (免费)
3. 选择云服务商：推荐 AWS + 新加坡区域 (ap-southeast-1)
4. 点击 "Create Cluster" (等待 3-5 分钟)
```

### 3. 创建数据库用户
```
Database Access → Add New Database User
- 用户名: tarot_user
- 密码: [自动生成或自定义]
- 权限: Read and write to any database
```

### 4. 设置网络访问
```
Network Access → Add IP Address
- 选择 "Allow Access from Anywhere" (0.0.0.0/0)
```

### 5. 获取连接字符串
```
Database → Connect → Connect your application
选择 Node.js 4.1+

连接字符串格式：
mongodb+srv://tarot_user:<password>@cluster0.xxxxx.mongodb.net/tarot?retryWrites=true&w=majority
```

### 6. 配置项目
编辑 `tarot-app/.env.local`：
```env
MONGODB_URI=mongodb+srv://tarot_user:你的密码@cluster0.xxxxx.mongodb.net/tarot?retryWrites=true&w=majority
```

---

## 方案二：本地 MongoDB（需要稳定网络）

### macOS (Homebrew)

```bash
# 1. 添加 MongoDB 仓库
brew tap mongodb/brew

# 2. 安装 MongoDB 7.0
brew install mongodb-community@7.0

# 3. 启动服务
brew services start mongodb-community@7.0

# 4. 验证安装
mongod --version

# 5. 进入 MongoDB shell
mongosh
```

### 配置数据目录

```bash
# 创建数据目录
mkdir -p ~/data/mongodb

# 手动启动（如需自定义端口）
mongod --dbpath ~/data/mongodb --port 27017
```

### 连接字符串

```env
# 本地默认连接
MONGODB_URI=mongodb://localhost:27017/tarot

# 带认证（如设置了用户名密码）
MONGODB_URI=mongodb://username:password@localhost:27017/tarot?authSource=admin
```

---

## 方案三：Docker（推荐有 Docker 基础的用户）

```bash
# 安装 Docker 后执行

# 1. 运行 MongoDB 容器
docker run -d \
  --name tarot-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -v ~/mongodb_data:/data/db \
  --restart unless-stopped \
  mongo:7.0

# 2. 查看运行状态
docker ps

# 3. 进入容器
docker exec -it tarot-mongo mongosh

# 4. 创建数据库和用户
use tarot
db.createUser({
  user: "tarot_user",
  pwd: "your_password",
  roles: [{ role: "readWrite", db: "tarot" }]
})
```

连接字符串：
```env
MONGODB_URI=mongodb://tarot_user:your_password@localhost:27017/tarot
```

---

## 验证连接

安装完成后，测试连接：

```bash
# 进入项目目录
cd /Users/crazyrock/Documents/tarot/tarot-app

# 安装依赖
npm install

# 创建环境文件
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 MONGODB_URI

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 测试功能。

---

## 常见问题

### Q: MongoDB 启动失败
```bash
# 检查端口占用
lsof -i :27017

# 查看日志
brew services list
cat /opt/homebrew/var/log/mongodb/mongo.log
```

### Q: 连接超时
- 检查 MongoDB 服务是否运行: `brew services list`
- 检查防火墙设置
- Atlas 用户检查 IP 白名单

### Q: 权限错误
```bash
# 修复数据目录权限
sudo chown -R $(whoami) ~/data/mongodb
```

---

## 推荐选择

| 场景 | 推荐方案 |
|------|---------|
| 快速开始 | MongoDB Atlas |
| 长期使用/生产 | 本地 MongoDB |
| 团队协作 | Docker |
| 国内网络差 | MongoDB Atlas (AWS 新加坡) |
