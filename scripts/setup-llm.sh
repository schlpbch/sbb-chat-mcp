#!/bin/bash
# Quick Setup Script for LLM Integration

echo "🚀 Setting up LLM Integration for Swiss Travel Companion"
echo "================================================"
echo ""

# Check if .env exists and has GEMINI_API_KEY
if [ -f ".env" ] && grep -q "GEMINI_API_KEY=" .env; then
    echo "✅ Found GEMINI_API_KEY in .env"
    
    # Copy to .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo "📝 Creating .env.local from .env..."
        cp .env .env.local
        echo "✅ Created .env.local"
    else
        echo "✅ .env.local already exists"
    fi
else
    echo "⚠️  No GEMINI_API_KEY found in .env"
    
    if [ ! -f ".env.local" ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo ""
        echo "⚠️  IMPORTANT: You need to add your Gemini API key!"
        echo "   1. Get your key from: https://makersuite.google.com/app/apikey"
        echo "   2. Edit .env.local and replace 'your_gemini_api_key_here'"
        echo "   3. Run this script again"
        exit 1
    fi
fi

echo ""
echo "🔍 Verifying setup..."
echo ""

# Run verification
./scripts/verify-llm-setup.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your dev server if it's running:"
echo "   - Press Ctrl+C in the terminal where 'pnpm dev' is running"
echo "   - Run: pnpm dev"
echo ""
echo "2. Open http://localhost:3000"
echo "3. Click the 💬 chat icon in the navbar"
echo "4. Start chatting with the AI Companion!"
echo ""
