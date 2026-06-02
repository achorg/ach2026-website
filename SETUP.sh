#!/bin/bash
# Quick Setup Guide for ConfTool Integration
# Run this after cloning the repository
# Usage: ./SETUP.sh

echo "🚀 ACH 2026 Website - ConfTool Integration Setup"
echo ""
echo "1️⃣  Installing dependencies..."
npm install

echo ""
echo "2️⃣  Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file"
  echo "   👉 Edit .env and add your CONFTOOL_API_KEY"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "3️⃣  Next steps:"
echo "   - Edit .env with your ConfTool API key"
echo "   - Run: npm run build"
echo "   - Schedule pages: /en/schedule/ and /es/cronograma/"
echo ""
echo "📚 For detailed setup: see CONFTOOL_SETUP.md"
