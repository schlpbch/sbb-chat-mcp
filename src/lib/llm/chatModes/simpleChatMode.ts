/**
 * Simple Chat Mode - Basic chat with optional function calling
 */

import { executeTool } from '../toolExecutor';
import type { FunctionCallParams } from '../functionDefinitions';
import type { ToolResultData } from '../types/common';
import { createModel } from './modelFactory';
import { getLanguageName } from '../types/language';
import type { Language } from '@/lib/i18n';
import type { Intent, ConversationContext } from '../context/types';

export interface ChatMessage {
  role: 'user' | 'Companion';
  content: string;
}

export interface ChatContext {
  language: Language | string;
  currentLocation?: { lat: number; lon: number };
}

export interface ChatResponse {
  response: string;
  toolCalls?: Array<{
    toolName: string;
    params: Partial<FunctionCallParams>;
    result: ToolResultData;
  }>;
  debug?: {
    intent?: Intent;
    context?: ConversationContext;
  };
}

/**
 * Send a chat message with optional function calling support
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' },
  enableFunctionCalling: boolean = true
): Promise<ChatResponse> {
  try {
    console.log('[geminiService] === CHAT REQUEST START ===');

    const model = createModel(enableFunctionCalling);

    const systemPrompt = `You are a helpful Swiss Travel Companion.

CONTEXT:
- User's language: ${context.language}
- Current time: ${new Date().toISOString()} (${new Date().toLocaleString()})
- Current location: ${
      context.currentLocation
        ? `${context.currentLocation.lat}, ${context.currentLocation.lon}`
        : 'Unknown'
    }

CAPABILITIES:
- You can find public transport connections using SBB data (including international connections)
- You can check station details, arrivals, and departures
- You can check weather conditions **for any location in Europe**
- You can help plan travel routes across Switzerland and Europe

AVAILABLE TOOLS:
${
  enableFunctionCalling
    ? '- findStopPlacesByName: Search for train stations and stops\n- findPlaces: Search for places and POIs\n- findTrips: Find public transport connections\n- getPlaceEvents: Get arrivals/departures (needs station ID)\n- getWeather: Get weather forecasts\n- getSnowConditions: Get ski resort conditions\n\nSTATION IDS: Zurich HB=8503000, Bern=8507000, Geneva=8501008, Basel=8500010, Lausanne=8501120, Lucerne=8505000, Thun=8507100, Interlaken=8507492\n\nFor arrivals/departures use: getPlaceEvents({placeId: "8507100", eventType: "arrivals"})'
    : 'No tools available in this mode'
}

GUIDELINES:
- Always respond in ${getLanguageName(context.language)}
- Be concise and professional
- Use tools when you need real-time data
- Prioritize sustainable travel options`;

    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        {
          role: 'model',
          parts: [
            {
              text: "Understood. I'm ready to help with Swiss public transport planning!",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;

    const functionCalls = response.functionCalls();
    const toolCalls: Array<{
      toolName: string;
      params: Record<string, unknown>;
      result: unknown;
    }> = [];

    if (functionCalls && functionCalls.length > 0) {
      // Execute all function calls
      const functionResponses = [];

      for (const call of functionCalls) {
        const toolResult = await executeTool(
          call.name,
          call.args as FunctionCallParams
        );

        toolCalls.push({
          toolName: call.name,
          params: call.args as Record<string, unknown>,
          result: toolResult.data,
        });

        // Build function response part
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: toolResult.success
              ? (toolResult.data as object)
              : ({
                  error: toolResult.error || 'Tool execution failed',
                  success: false,
                } as object),
          },
        });
      }

      // Send ALL function responses back to Gemini at once
      const followUpResult = await chat.sendMessage(functionResponses);

      return {
        response: followUpResult.response.text(),
        toolCalls: toolCalls as Array<{
          toolName: string;
          params: Partial<FunctionCallParams>;
          result: ToolResultData;
        }>,
      };
    }

    return {
      response: response.text(),
      toolCalls:
        toolCalls.length > 0
          ? (toolCalls as Array<{
              toolName: string;
              params: Partial<FunctionCallParams>;
              result: ToolResultData;
            }>)
          : undefined,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get AI response: ${errorMessage}`);
  }
}

/**
 * Simple chat without function calling
 */
export async function sendSimpleChatMessage(
  message: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' }
): Promise<string> {
  const result = await sendChatMessage(message, history, context, false);
  return result.response;
}
