#!/bin/bash
# Vercel 部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署 tarot-app 到 Vercel..."

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔑 请先登录 Vercel:"
    echo "   vercel login"
    exit 1
fi

# 部署
echo "📦 正在部署..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "⚠️  重要：请在 Vercel Dashboard 中配置以下环境变量："
echo "   - DEEPSEEK_API_KEY"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo ""
echo "📖 详细部署指南请查看 DEPLOY.md"
