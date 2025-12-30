import { NextRequest } from 'next/server';
import {
  sendStreamingChatMessage,
  ChatMessage,
  ChatContext,
} from '@/lib/llm/geminiService';
import { checkRateLimit } from '@/lib/llm/rateLimiter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting check
  const userId =
    request.headers.get('x-session-id') ||
    request.headers.get('x-forwarded-for') ||
    'anonymous';

  const rateLimit = checkRateLimit(userId);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`,
        retryAfter: rateLimit.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          'Retry-After': (rateLimit.retryAfter || 60).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { message, history, context, sessionId } = body as {
      message: string;
      history?: ChatMessage[];
      context?: ChatContext;
      sessionId?: string;
    };

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.GOOGLE_CLOUD_KEY) {
      return new Response(
        JSON.stringify({
          error:
            'Google Cloud API key not configured. Please add GOOGLE_CLOUD_KEY to .env.local',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send start event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'start',
                data: { sessionId },
              })}\n\n`
            )
          );

          // Stream the response
          const generator = sendStreamingChatMessage(
            message,
            sessionId || 'default',
            history,
            context
          );

          for await (const chunk of generator) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
          }

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'done', data: {} })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);

          // Send error event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                data: {
                  error:
                    error instanceof Error ? error.message : 'Streaming failed',
                },
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
