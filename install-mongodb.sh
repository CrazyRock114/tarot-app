#!/bin/bash
# MongoDB 安装脚本 for macOS

echo "🍃 MongoDB 安装脚本"
echo "===================="

# 检查 Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ 请先安装 Homebrew: https://brew.sh"
    exit 1
fi

# 添加 MongoDB 仓库
echo "📦 添加 MongoDB 仓库..."
brew tap mongodb/brew

# 安装 MongoDB
echo "📥 安装 MongoDB 7.0..."
brew install mongodb-community@7.0

if [ $? -ne 0 ]; then
    echo "❌ 安装失败，可能是网络问题"
    echo "建议:"
    echo "1. 重试安装"
    echo "2. 或使用 MongoDB Atlas (https://www.mongodb.com/cloud/atlas)"
    exit 1
fi

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p ~/data/mongodb

# 启动服务
echo "🚀 启动 MongoDB 服务..."
brew services start mongodb-community@7.0

# 验证安装
echo "✅ 验证安装..."
sleep 2

if command -v mongod &> /dev/null; then
    echo ""
    echo "🎉 MongoDB 安装成功!"
    echo ""
    echo "版本信息:"
    mongod --version | head -1
    echo ""
    echo "服务状态:"
    brew services list | grep mongodb
    echo ""
    echo "📖 使用指南:"
    echo "  - 启动服务: brew services start mongodb-community@7.0"
    echo "  - 停止服务: brew services stop mongodb-community@7.0"
    echo "  - 重启服务: brew services restart mongodb-community@7.0"
    echo "  - 进入Shell: mongosh"
    echo ""
    echo "🔗 连接字符串:"
    echo "  mongodb://localhost:27017/tarot"
else
    echo "⚠️ 安装可能未完成，请检查错误信息"
fi
