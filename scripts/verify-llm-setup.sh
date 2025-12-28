#!/bin/bash
# LLM Integration Verification Script

echo "🔍 SBB Chat MCP LLM Integration - Verification"
echo "================================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check for GEMINI_API_KEY
    if grep -q "GEMINI_API_KEY=" .env.local; then
        # Check if it's not the placeholder
        if grep -q "GEMINI_API_KEY=your_" .env.local; then
            echo "⚠️  GEMINI_API_KEY is set to placeholder value"
            echo "   → Please replace with your actual API key"
        else
            echo "✅ GEMINI_API_KEY is configured"
        fi
    else
        echo "❌ GEMINI_API_KEY not found in .env.local"
        echo "   → Add: GEMINI_API_KEY=your_key_here"
    fi
    
    # Check for GEMINI_MODEL
    if grep -q "GEMINI_MODEL=" .env.local; then
        echo "✅ GEMINI_MODEL is configured"
    else
        echo "⚠️  GEMINI_MODEL not found (optional, will use default)"
    fi
else
    echo "❌ .env.local file not found"
    echo "   → Create it by copying .env.example:"
    echo "   → cp .env.example .env.local"
fi

echo ""
echo "📦 Checking Dependencies"
echo "------------------------"

# Check if @google/generative-ai is installed
if [ -d "node_modules/@google/generative-ai" ]; then
    echo "✅ @google/generative-ai is installed"
else
    echo "❌ @google/generative-ai not found"
    echo "   → Run: pnpm add @google/generative-ai"
fi

echo ""
echo "📁 Checking Files"
echo "-----------------"

# Check if all required files exist
files=(
    "src/lib/llm/geminiService.ts"
    "src/app/api/llm/chat/route.ts"
    "src/components/chat/ChatPanel.tsx"
    "src/components/chat/ChatMessage.tsx"
    "src/components/chat/ChatInput.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING!"
    fi
done

echo ""
echo "🚀 Next Steps"
echo "-------------"

if [ ! -f ".env.local" ] || grep -q "GEMINI_API_KEY=your_" .env.local 2>/dev/null; then
    echo "1. Get your Gemini API key from:"
    echo "   https://makersuite.google.com/app/apikey"
    echo ""
    echo "2. Add it to .env.local:"
    echo "   GEMINI_API_KEY=your_actual_key_here"
    echo ""
    echo "3. Restart the dev server:"
    echo "   pnpm dev"
else
    echo "✅ Configuration looks good!"
    echo ""
    echo "To test the chat feature:"
    echo "1. Open http://localhost:3000"
    echo "2. Click the 💬 chat icon in the navbar"
    echo "3. Type a message and press Enter"
fi

echo ""
echo "================================================"
