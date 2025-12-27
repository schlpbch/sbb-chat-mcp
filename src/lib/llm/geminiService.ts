import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCP_FUNCTION_DEFINITIONS } from './functionDefinitions';
import {
  executeTool,
  searchAttractions,
  formatToolResult,
} from './toolExecutor';
import {
  ConversationContext,
  createContext,
  updateContextFromMessage,
  extractIntent,
  buildContextualPrompt,
  cacheToolResult,
} from './contextManager';
import {
  createExecutionPlan,
  executePlan,
  formatPlanResults,
  requiresOrchestration,
} from './orchestrator';
import type { FunctionCallParams } from './functionDefinitions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Session contexts (in production, use Redis or database)
const sessionContexts = new Map<string, ConversationContext>();

/**
 * Get or create a conversation context for a session
 */
export function getSessionContext(
  sessionId: string,
  language: string = 'en'
): ConversationContext {
  if (!sessionContexts.has(sessionId)) {
    sessionContexts.set(sessionId, createContext(sessionId, language));
  }
  const ctx = sessionContexts.get(sessionId)!;
  ctx.language = language;
  return ctx;
}

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

/**
 * Enhanced chat with orchestration support for complex queries
 * Automatically uses multi-tool planning for itinerary requests
 */
export async function sendOrchestratedChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' }
): Promise<ChatResponse> {
  console.log('[geminiService] === ORCHESTRATED CHAT START ===');

  // Get or create session context
  const sessionContext = getSessionContext(sessionId, context.language);

  // Extract intent from message
  const intent = extractIntent(message);
  console.log('[geminiService] Detected intent:', intent.type, 'confidence:', intent.confidence);

  // Update context with any extracted information
  const updatedContext = updateContextFromMessage(sessionContext, message, {
    intent,
  });
  sessionContexts.set(sessionId, updatedContext);

  // Check if this requires orchestration
  if (requiresOrchestration(message) && intent.confidence >= 0.7) {
    console.log('[geminiService] Using orchestrated execution');

    // Create and execute a multi-step plan
    const plan = createExecutionPlan(intent, updatedContext);

    if (plan && plan.steps.length > 0) {
      console.log('[geminiService] Executing plan:', plan.name, 'with', plan.steps.length, 'steps');

      const planResult = await executePlan(plan, updatedContext);
      console.log('[geminiService] Plan execution complete:', planResult.success);

      // Format the results
      const formattedResults = formatPlanResults(planResult, context.language);

      // Build tool calls array from plan results
      const toolCalls = planResult.results
        .filter((r) => r.success && r.data)
        .map((r) => ({
          toolName: r.toolName,
          params: {},
          result: r.data,
        }));

      // Send to Gemini with the gathered context for natural language response
      const modelConfig: any = {
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      };
      const model = genAI.getGenerativeModel(modelConfig);

      const summaryPrompt = `You are a Swiss travel assistant. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planResult.summary, null, 2)}

Please provide a helpful, conversational response that:
1. Summarizes the key information clearly
2. Provides specific recommendations
3. Mentions any important details like weather or timing
4. Responds in ${context.language === 'de' ? 'German' : context.language === 'fr' ? 'French' : context.language === 'it' ? 'Italian' : 'English'}

Be concise but complete.`;

      const result = await model.generateContent(summaryPrompt);
      const response = result.response.text();

      return {
        response,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    }
  }

  // Fall back to standard function-calling flow
  console.log('[geminiService] Using standard function calling');
  return sendChatMessage(message, history, context, true);
}
