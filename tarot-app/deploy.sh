#!/bin/bash
# Vercel 部署脚本 - 使用 Token
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 tarot-app 到 Vercel..."

# Token
TOKEN="$VERCEL_TOKEN"

# 构建前端
echo "📦 构建前端..."
cd client
npm run build
cd ..

# 复制构建文件到 dist
echo "📂 复制构建文件..."
rm -rf dist
cp -r client/dist dist

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
npx vercel@latest --token=$TOKEN --prod --yes

echo "✅ 部署完成！"
