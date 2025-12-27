import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCP_FUNCTION_DEFINITIONS } from './functionDefinitions';
import {
  executeTool,
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

// Session contexts
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
    
    const modelConfig: any = {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    };

    if (enableFunctionCalling) {
      modelConfig.tools = [
        {
          functionDeclarations: MCP_FUNCTION_DEFINITIONS,
        },
      ];
    }

    const model = genAI.getGenerativeModel(modelConfig);

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

/**
 * Enhanced chat with orchestration support
 */
export async function sendOrchestratedChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' }
): Promise<ChatResponse> {
  const sessionContext = getSessionContext(sessionId, context.language);
  const intent = extractIntent(message);
  
  const updatedContext = updateContextFromMessage(sessionContext, message, {
    intent,
    origin: intent.extractedEntities?.origin,
    destination: intent.extractedEntities?.destination,
  });
  sessionContexts.set(sessionId, updatedContext);

  console.log("[sendOrchestratedChatMessage] requiresOrchestration:", requiresOrchestration(message));
  console.log("[sendOrchestratedChatMessage] intent.confidence:", intent.confidence);
  console.log("[sendOrchestratedChatMessage] Checking orchestration conditions...");
  if (requiresOrchestration(message) && intent.confidence >= 0.7) {
    const plan = createExecutionPlan(intent, updatedContext);
      console.log("[sendOrchestratedChatMessage] Plan execution completed. Success:", planResult.success);
      console.log("[sendOrchestratedChatMessage] Number of results:", planResult.results.length);

    if (plan && plan.steps.length > 0) {
      const planResult = await executePlan(plan, updatedContext);
      const formattedResults = formatPlanResults(planResult, context.language);

      const toolCalls = planResult.results
        .filter((r) => r.success && r.data)
        .map((r) => ({
          toolName: r.toolName,
          params: {},
          result: r.data,
        }));
      console.log("[sendOrchestratedChatMessage] Plan results:", planResult.results);
      console.log("[sendOrchestratedChatMessage] Filtered tool calls:", toolCalls.map(tc => ({ name: tc.toolName, hasData: !!tc.result })));
      console.log("[sendOrchestratedChatMessage] Tool calls to return:", toolCalls);

      const modelConfig: any = {
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      };
      const model = genAI.getGenerativeModel(modelConfig);

      const summaryPrompt = `You are a Swiss travel assistant. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planResult.summary, null, 2)}

Please provide a helpful, conversational response that summarizes the key information clearly and provides transport recommendations. Responds in ${context.language === 'de' ? 'German' : context.language === 'fr' ? 'French' : context.language === 'it' ? 'Italian' : 'English'}.`;

      const result = await model.generateContent(summaryPrompt);
      const response = result.response.text();

      return {
        response,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    }
  }

  return sendChatMessage(message, history, context, true);
}

/**
 * Streaming chat with SSE support
 */
export async function* sendStreamingChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' }
): AsyncGenerator<any, void, unknown> {
  try {
    const sessionContext = getSessionContext(sessionId, context.language);
    
    const modelConfig: any = {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      tools: [
        {
          functionDeclarations: MCP_FUNCTION_DEFINITIONS,
        },
      ],
    };

    const model = genAI.getGenerativeModel(modelConfig);

    const systemPrompt = `You are a helpful Swiss travel assistant.

CONTEXT:
- User's language: ${context.language}
- Current time: ${new Date().toISOString()}

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
- Be concise and professional`;

    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        {
          role: 'model',
          parts: [{ text: "Ready to help!" }],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessageStream(message);

    let fullText = '';
    const toolCalls: Array<{ toolName: string; params: any; result: any }> = [];

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      
      if (chunkText) {
        fullText += chunkText;
        yield {
          type: 'chunk',
          data: { text: chunkText },
        };
      }

      const functionCalls = chunk.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          yield {
            type: 'tool_call',
            data: { toolName: call.name, params: call.args },
          };

          const toolResult = await executeTool(call.name, call.args as FunctionCallParams);

          toolCalls.push({
            toolName: call.name,
            params: call.args,
            result: toolResult.data,
          });

          yield {
            type: 'tool_result',
            data: { toolName: call.name, result: toolResult.data, success: toolResult.success },
          };
        }
      }
    }

    yield {
      type: 'complete',
      data: { fullText, toolCalls: toolCalls.length > 0 ? toolCalls : undefined },
    };
  } catch (error) {
    console.error('Streaming error:', error);
    yield {
      type: 'error',
      data: { error: error instanceof Error ? error.message : 'Streaming failed' },
    };
  }
}
