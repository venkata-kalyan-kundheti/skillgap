#!/bin/bash

# SkillGap AI - Start Script
# This script helps you start both backend and frontend servers

echo "🚀 Starting SkillGap AI..."
echo ""

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo ""
fi

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies ready!"
echo ""
echo "=========================================="
echo "  IMPORTANT: You need TWO terminals"
echo "=========================================="
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "=========================================="
