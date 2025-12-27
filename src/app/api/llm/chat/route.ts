import { NextRequest, NextResponse } from 'next/server';
import {
  sendChatMessage,
  ChatMessage,
  ChatContext,
  ChatResponse,
} from '@/lib/llm/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history,
      context,
      enableFunctionCalling = true,
    } = body as {
      message: string;
      history?: ChatMessage[];
      context?: ChatContext;
      enableFunctionCalling?: boolean;
    };

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Log environment check for debugging
    console.log('Environment check:', {
      hasKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length,
      allEnvKeys: Object.keys(process.env).filter((k) => k.includes('GEMINI')),
    });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local',
        },
        { status: 500 }
      );
    }

    // Call Gemini API with function calling support
    const result: ChatResponse = await sendChatMessage(
      message,
      history,
      context,
      enableFunctionCalling
    );

    return NextResponse.json({
      response: result.response,
      toolCalls: result.toolCalls,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
