import { NextRequest, NextResponse } from 'next/server';
import { sendOrchestratedChatMessage } from '@/lib/llm/geminiService';
import type { Language } from '@/lib/i18n';

/**
 * REST API Query Endpoint
 *
 * GET /api/v1/query
 *
 * Query Parameters:
 * - q (required): The query string
 * - format (optional): Response format - 'text' | 'markdown' (default: 'text')
 * - lang (optional): Language code - 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi' (default: 'en')
 *
 * Example:
 * GET /api/v1/query?q=trains from Zurich to Bern&format=markdown&lang=en
 */

const SUPPORTED_LANGUAGES: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
const SUPPORTED_FORMATS = ['text', 'markdown'] as const;
type ResponseFormat = (typeof SUPPORTED_FORMATS)[number];

/**
 * Format response as plain text (strip markdown)
 */
function formatAsPlainText(response: string): string {
  return (
    response
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove code blocks
      .replace(/```[^`]*```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Format response as markdown (keep as-is)
 */
function formatAsMarkdown(response: string): string {
  return response.trim();
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const format = (searchParams.get('format') || 'text') as ResponseFormat;
    const lang = (searchParams.get('lang') || 'en') as Language;

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate format
    if (!SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid format '${format}'. Supported formats: ${SUPPORTED_FORMATS.join(
            ', '
          )}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid language '${lang}'. Supported languages: ${SUPPORTED_LANGUAGES.join(
            ', '
          )}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(
      `[API /v1/query] Query: "${query}", Format: ${format}, Language: ${lang}`
    );

    // Call orchestrated chat (text-only mode for API)
    const result = await sendOrchestratedChatMessage(
      query,
      `api-${Date.now()}`, // Unique session ID for each request
      [], // No history for stateless API
      { language: lang, voiceEnabled: false }
    );

    // Format response based on requested format
    const formattedResponse =
      format === 'markdown'
        ? formatAsMarkdown(result.response)
        : formatAsPlainText(result.response);

    const duration = Date.now() - startTime;
    console.log(`[API /v1/query] Completed in ${duration}ms`);

    // Return successful response
    return NextResponse.json({
      success: true,
      query,
      response: formattedResponse,
      format,
      language: lang,
      timestamp: new Date().toISOString(),
      processingTime: `${duration}ms`,
    });
  } catch (error) {
    console.error('[API /v1/query] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
