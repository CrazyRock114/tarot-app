#!/bin/bash

# Vercel 部署脚本
# 使用方法：
# 1. 确保已安装 Vercel CLI: npm i -g vercel
# 2. 登录 Vercel: vercel login
# 3. 运行此脚本: ./deploy.sh

echo "🚀 开始部署 AI 塔罗应用到 Vercel..."

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，请先运行: npm i -g vercel"
    exit 1
fi

# 检查是否登录
if ! vercel whoami &> /dev/null; then
    echo "❌ 请先登录 Vercel: vercel login"
    exit 1
fi

# 部署
echo "📦 正在部署..."
vercel --prod

echo "✅ 部署完成！"
