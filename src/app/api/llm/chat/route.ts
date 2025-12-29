import { NextRequest, NextResponse } from 'next/server';
import {
  sendChatMessage,
  sendOrchestratedChatMessage,
  ChatMessage,
  ChatContext,
  ChatResponse,
} from '@/lib/llm/geminiService';
import { checkRateLimit } from '@/lib/llm/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const userId =
      request.headers.get('x-session-id') ||
      request.headers.get('x-forwarded-for') ||
      'anonymous';

    const rateLimit = checkRateLimit(userId);

    if (!rateLimit.allowed) {
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', '10');
      headers.set('X-RateLimit-Remaining', '0');
      headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
      headers.set('Retry-After', (rateLimit.retryAfter || 60).toString());
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const {
      message,
      intent, // Add intent
      history,
      context,
      enableFunctionCalling = true,
      sessionId,
      useOrchestration = true,
    } = body as {
      message: string;
      intent?: unknown;
      history?: ChatMessage[];
      context?: ChatContext;
      enableFunctionCalling?: boolean;
      sessionId?: string;
      useOrchestration?: boolean;
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
    // Use orchestrated chat for complex queries when sessionId is provided
    let result: ChatResponse;

    console.log('[chat/route] useOrchestration:', useOrchestration, 'sessionId:', sessionId);
    if (useOrchestration && sessionId) {
      console.log('[chat/route] Using orchestrated chat with session:', sessionId);
      if (intent) {
        console.log('[chat/route] Parsed intent:', intent);
      }
      result = await sendOrchestratedChatMessage(
        message,
        sessionId,
        history,
        context,
        intent // Add intent parameter
      );
    } else {
      console.log('[chat/route] Using standard chat');
      result = await sendChatMessage(
        message,
        history,
        context,
        enableFunctionCalling
      );
    }

    return NextResponse.json({
      response: result.response,
      toolCalls: result.toolCalls,
      timestamp: new Date().toISOString(),
      debug: {
        receivedIntent: result.debug?.intent || intent,
        finalContext: result.debug?.context || context,
      }
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
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        requestId: request.headers.get('x-request-id') || 'unknown'
      },
      { status: 500 }
    );
  }
}
