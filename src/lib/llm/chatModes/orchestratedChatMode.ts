/**
 * Orchestrated Chat Mode - Chat with multi-step orchestration support
 */

import { getSessionContext, setSessionContext } from '../sessionManager';
import { extractIntent, updateContextFromMessage } from '../contextManager';
import {
  createExecutionPlan,
  executePlan,
  formatPlanResults,
  requiresOrchestration,
} from '../orchestrator';
import { sendChatMessage } from './simpleChatMode';
import { createModel } from './modelFactory';
import type { ChatMessage, ChatContext, ChatResponse } from './simpleChatMode';

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
  setSessionContext(sessionId, updatedContext);

  console.log(
    '[sendOrchestratedChatMessage] requiresOrchestration:',
    requiresOrchestration(message)
  );
  console.log(
    '[sendOrchestratedChatMessage] intent.confidence:',
    intent.confidence
  );
  console.log(
    '[sendOrchestratedChatMessage] Checking orchestration conditions...'
  );
  if (requiresOrchestration(message) && intent.confidence >= 0.7) {
    const plan = createExecutionPlan(intent, updatedContext);

    if (plan && plan.steps.length > 0) {
      const planResult = await executePlan(plan, updatedContext);
      console.log(
        '[sendOrchestratedChatMessage] Plan execution completed. Success:',
        planResult.success
      );
      console.log(
        '[sendOrchestratedChatMessage] Number of results:',
        planResult.results.length
      );
      const formattedResults = formatPlanResults(planResult, context.language);

      const toolCalls = planResult.results
        .filter((r) => r.success && r.data)
        .map((r) => ({
          toolName: r.toolName,
          params: {},
          result: r.data,
        }));
      console.log(
        '[sendOrchestratedChatMessage] Plan results:',
        planResult.results
      );
      console.log(
        '[sendOrchestratedChatMessage] Filtered tool calls:',
        toolCalls.map((tc) => ({ name: tc.toolName, hasData: !!tc.result }))
      );
      console.log(
        '[sendOrchestratedChatMessage] Tool calls to return:',
        toolCalls
      );

      const model = createModel(false);

      const summaryPrompt = `You are a Swiss travel assistant. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planResult.summary, null, 2)}

Please provide a helpful, conversational response that summarizes the key information clearly and provides transport recommendations. Responds in ${
        context.language === 'de'
          ? 'German'
          : context.language === 'fr'
          ? 'French'
          : context.language === 'it'
          ? 'Italian'
          : 'English'
      }.`;

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
