/**
 * Orchestrated Chat Mode - Chat with multi-step orchestration support
 */

import { sendChatMessage } from './simpleChatMode';
import type { ChatMessage, ChatContext, ChatResponse } from './simpleChatMode';
import {
  ContextPreparationService,
  OrchestrationDecisionService,
  PlanCoordinatorService,
  ResponseSynthesisService,
} from '../orchestrator/services';

/**
 * Enhanced chat with orchestration support
 *
 * Coordinates multiple services to handle complex, multi-step queries:
 * 1. Context Preparation - Extract intent and update context
 * 2. Orchestration Decision - Determine if orchestration is needed
 * 3. Plan Coordination - Create and execute multi-step plans
 * 4. Response Synthesis - Generate final LLM response
 */
export async function sendOrchestratedChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' },
  parsedIntent?: unknown // Add parsed markdown intent
): Promise<ChatResponse> {
  // 1. Prepare context and extract intents
  const contextPrep = new ContextPreparationService();
  const { updatedContext, intents } = await contextPrep.prepareContext(
    message,
    sessionId,
    context.language,
    parsedIntent
  );

  // 2. Decide if orchestration is needed
  const decision = new OrchestrationDecisionService();
  const { shouldOrchestrate } = decision.shouldOrchestrate(message, intents);

  if (!shouldOrchestrate) {
    console.log(
      '[sendOrchestratedChatMessage] Orchestration not required, using simple chat'
    );
    return sendChatMessage(message, history, context, true);
  }

  // 3. Coordinate plan execution
  const coordinator = new PlanCoordinatorService();
  const planResult = await coordinator.coordinatePlan(
    intents,
    updatedContext,
    context.language
  );

  if (!planResult) {
    console.log(
      '[sendOrchestratedChatMessage] No plan created, falling back to simple chat'
    );
    return sendChatMessage(message, history, context, true);
  }

  // 4. Synthesize response
  const synthesis = new ResponseSynthesisService();
  const response = await synthesis.synthesizeResponse(
    message,
    planResult.formattedResults,
    planResult.planResult.summary,
    context.language,
    context.voiceEnabled || false
  );

  return {
    response,
    toolCalls:
      planResult.toolCalls.length > 0 ? planResult.toolCalls : undefined,
    debug: {
      intent: intents[0], // Primary intent for backward compatibility
      context: updatedContext,
    },
  };
}
