/**
 * Streaming Chat Mode - SSE streaming chat with function calling
 */

import { getSessionContext } from '../sessionManager';
import { executeTool } from '../toolExecutor';
import type { FunctionCallParams } from '../functionDefinitions';
import { createModel } from './modelFactory';
import type { ChatMessage, ChatContext } from './simpleChatMode';
import { getLanguageName } from '../types/language';

/**
 * Streaming chat with SSE support
 */
export async function* sendStreamingChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' },
  useOrchestration: boolean = true
): AsyncGenerator<any, void, unknown> {
  try {
    const sessionContext = getSessionContext(sessionId, context.language);

    const model = createModel(useOrchestration);

    // Build voice-aware system prompt
    const voiceInstructions = context.voiceEnabled
      ? `\n\nVOICE OUTPUT ENABLED:
- The user has voice output enabled and will HEAR your response read aloud
- After using tools, provide a natural 2-4 sentence spoken summary
- Example: "I found 3 direct trains from Zurich to Bern. The fastest option takes 1 hour 16 minutes departing at 09:08."
- Keep it conversational and highlight key findings
- The visual cards will show all details, so don't list everything`
      : `\n\nVISUAL OUTPUT:
- The information will be displayed as visual cards
- Keep your text response extremely brief or empty
- The cards will show all the details`;

    const systemPrompt = `You are a helpful Swiss travel Companion.

CONTEXT:
- User's language: ${context.language}
- Current time: ${new Date().toISOString()}
${voiceInstructions}

GUIDELINES:
- **CRITICAL: You MUST respond in ${getLanguageName(
      context.language
    )}. This is non-negotiable.**
- **If the user writes in ${getLanguageName(
      context.language
    )}, respond in ${getLanguageName(context.language)}.**
- **Never respond in English unless the user's language is English.**
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
          parts: [{ text: 'Ready to help!' }],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessageStream(message);

    let fullText = '';
    const toolCalls: Array<{
      toolName: string;
      params: Record<string, unknown>;
      result: unknown;
    }> = [];

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

          const toolResult = await executeTool(
            call.name,
            call.args as FunctionCallParams
          );

          toolCalls.push({
            toolName: call.name,
            params: call.args as Record<string, unknown>,
            result: toolResult.data,
          });

          yield {
            type: 'tool_result',
            data: {
              toolName: call.name,
              result: toolResult.data,
              success: toolResult.success,
            },
          };
        }
      }
    }

    yield {
      type: 'complete',
      data: {
        fullText,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      },
    };
  } catch (error) {
    console.error('Streaming error:', error);
    yield {
      type: 'error',
      data: {
        error: error instanceof Error ? error.message : 'Streaming failed',
      },
    };
  }
}
