#!/bin/bash

# Tarot App Development Starter

echo "🔮 AI塔罗占卜平台"
echo "=================="
echo ""

# Function to start client
start_client() {
  echo "🚀 启动前端开发服务器..."
  cd client
  if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
  fi
  npm run dev &
  CLIENT_PID=$!
  cd ..
}

# Function to start server
start_server() {
  echo "🚀 启动后端开发服务器..."
  cd server
  if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
  fi
  npm run dev &
  SERVER_PID=$!
  cd ..
}

# Start both
case "$1" in
  client)
    start_client
    ;;
  server)
    start_server
    ;;
  *)
    start_client
    start_server
    echo ""
    echo "✅ 服务已启动:"
    echo "  前端: http://localhost:3000"
    echo "  后端: http://localhost:5000"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
    wait
    ;;
esac
