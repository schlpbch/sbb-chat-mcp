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
import { detectMessageLanguage } from '../services/LanguageDetectionService';

/**
 * Enhanced chat with orchestration support
 *
 * Coordinates multiple services to handle complex, multi-step queries:
 * 1. Language Detection - Detect message language (auto-detect from content)
 * 2. Context Preparation - Extract intent and update context
 * 3. Orchestration Decision - Determine if orchestration is needed
 * 4. Plan Coordination - Create and execute multi-step plans
 * 5. Response Synthesis - Generate final LLM response in detected language
 */
export async function sendOrchestratedChatMessage(
  message: string,
  sessionId: string,
  history: ChatMessage[] = [],
  context: ChatContext = { language: 'en' },
  parsedIntent?: unknown // Add parsed markdown intent
): Promise<ChatResponse> {
  // 1. Detect message language (prioritize message content over UI setting)
  const messageLanguage = await detectMessageLanguage(
    message,
    context.language
  );
  console.log(
    `[Orchestration] UI Language: ${context.language}, Message Language: ${messageLanguage}`
  );

  // 2. Prepare context and extract intents
  const contextPrep = new ContextPreparationService();
  const { updatedContext, intents } = await contextPrep.prepareContext(
    message,
    sessionId,
    messageLanguage, // Use detected language instead of UI language
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
    messageLanguage // Use detected language
  );

  if (!planResult) {
    console.log(
      '[sendOrchestratedChatMessage] No plan created, falling back to simple chat'
    );
    return sendChatMessage(message, history, context, true);
  }

  // 4. Synthesize response in detected language
  const synthesis = new ResponseSynthesisService();
  const response = await synthesis.synthesizeResponse(
    message,
    planResult.formattedResults,
    planResult.planResult.summary,
    messageLanguage, // Use detected language for response
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
