import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCP_FUNCTION_DEFINITIONS } from './functionDefinitions';
import {
  executeTool,
  searchAttractions,
  formatToolResult,
} from './toolExecutor';
import type { FunctionCallParams } from './functionDefinitions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  language: string;
  currentLocation?: { lat: number; lon: number };
  visibleAttractions?: number;
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
    console.log('[geminiService] Message:', message);
    console.log(
      '[geminiService] Function calling enabled:',
      enableFunctionCalling
    );

    const modelConfig: any = {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    };

    // Add function declarations if enabled
    if (enableFunctionCalling) {
      modelConfig.tools = [
        {
          functionDeclarations: MCP_FUNCTION_DEFINITIONS,
        },
      ];
    }

    const model = genAI.getGenerativeModel(modelConfig);

    // Build enhanced system prompt
    const systemPrompt = `You are a helpful Swiss travel assistant integrated into the SBB Chat MCP app.

CONTEXT:
- User's language: ${context.language}
- Current time: ${new Date().toISOString()} (${new Date().toLocaleString()})
- Current location: ${
      context.currentLocation
        ? `${context.currentLocation.lat}, ${context.currentLocation.lon}`
        : 'Unknown'
    }
- Attractions visible on map: ${context.visibleAttractions || 0}

CAPABILITIES:
- You can search for tourist attractions, ski resorts, and landmarks
- You can find public transport connections using SBB data
- You can check weather and snow conditions
- You can help plan complete itineraries

AVAILABLE TOOLS:
${
  enableFunctionCalling
    ? '- findStopPlacesByName: Search for train stations and stops\n- findPlaces: Search for places and POIs\n- findTrips: Find public transport connections\n- getWeather: Get weather forecasts\n- getSnowConditions: Get ski resort conditions\n- searchAttractions: Filter attractions by category/region'
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
- Be concise and helpful
- Use tools when you need real-time data
- Provide specific, actionable recommendations
- Prioritize sustainable travel options`;

    // Build conversation history
    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        {
          role: 'model',
          parts: [
            {
              text: "Understood. I'm ready to help with Swiss travel planning!",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    // Send message and get response
    console.log('[geminiService] Sending message to Gemini...');
    const result = await chat.sendMessage(message);
    const response = result.response;

    console.log('[geminiService] Gemini response received');
    console.log(
      '[geminiService] Response candidates:',
      JSON.stringify(response.candidates, null, 2)
    );

    // Check for function calls
    const functionCalls = response.functionCalls();
    console.log(
      '[geminiService] Function calls detected:',
      functionCalls ? functionCalls.length : 0
    );
    if (functionCalls && functionCalls.length > 0) {
      console.log(
        '[geminiService] Function calls:',
        JSON.stringify(functionCalls, null, 2)
      );
    }
    const toolCalls: Array<{ toolName: string; params: any; result: any }> = [];

    if (functionCalls && functionCalls.length > 0) {
      // The new logs already cover this: console.log('Function calls requested:', functionCalls);

      // Execute each function call
      for (const call of functionCalls) {
        let toolResult;

        if (call.name === 'searchAttractions') {
          toolResult = await searchAttractions(call.args as any);
        } else {
          toolResult = await executeTool(
            call.name,
            call.args as FunctionCallParams
          );
        }

        toolCalls.push({
          toolName: call.name,
          params: call.args,
          result: toolResult.data,
        });

        // Send function response back to the model
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

        // Continue the conversation with the function result
        const followUpResult = await chat.sendMessage([
          functionResponse as any,
        ]);

        // Return the final response after processing function results
        return {
          response: followUpResult.response.text(),
          toolCalls,
        };
      }
    }

    // No function calls, return the direct response
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
 * Simple chat without function calling (for basic queries)
 */
export async function sendSimpleChatMessage(
  message: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' }
): Promise<string> {
  const result = await sendChatMessage(message, history, context, false);
  return result.response;
}
