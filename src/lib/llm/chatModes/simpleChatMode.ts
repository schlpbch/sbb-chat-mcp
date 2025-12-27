/**
 * Simple Chat Mode - Basic chat with optional function calling
 */

import { executeTool } from '../toolExecutor';
import type { FunctionCallParams } from '../functionDefinitions';
import { createModel } from './modelFactory';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  language: string;
  currentLocation?: { lat: number; lon: number };
}

export interface ChatResponse {
  response: string;
  toolCalls?: Array<{
    toolName: string;
    params: any;
    result: any;
  }>;
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

    const systemPrompt = `You are a helpful Swiss travel assistant integrated into the SBB Chat MCP app.

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
- Always respond in ${
      context.language === 'de'
        ? 'German'
        : context.language === 'fr'
        ? 'French'
        : context.language === 'it'
        ? 'Italian'
        : 'English'
    }
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
    const toolCalls: Array<{ toolName: string; params: any; result: any }> = [];

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        const toolResult = await executeTool(
          call.name,
          call.args as FunctionCallParams
        );

        toolCalls.push({
          toolName: call.name,
          params: call.args,
          result: toolResult.data,
        });

        const functionResponse = {
          functionResponse: {
            name: call.name,
            response: {
              content: toolResult.success
                ? toolResult.data
                : { error: toolResult.error },
            },
          },
        };

        const followUpResult = await chat.sendMessage([
          functionResponse as any,
        ]);

        return {
          response: followUpResult.response.text(),
          toolCalls,
        };
      }
    }

    return {
      response: response.text(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get AI response. Please try again.');
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
