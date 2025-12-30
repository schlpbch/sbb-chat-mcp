/**
 * Context Preparation Service
 *
 * Handles intent extraction, merging, and context updates for orchestrated chat.
 * Extracted from orchestratedChatMode.ts to improve testability and maintainability.
 */

import { getSessionContext, setSessionContext } from '../../sessionManager';
import { extractIntent, updateContextFromMessage } from '../../contextManager';
import type { ConversationContext, Intent } from '../../context/types';

export interface ContextPreparationResult {
  sessionContext: ConversationContext;
  mergedIntent: Intent;
  updatedContext: ConversationContext;
}

export class ContextPreparationService {
  /**
   * Prepare and update conversation context for orchestration
   *
   * @param message - User's message
   * @param sessionId - Session identifier
   * @param language - User's language preference
   * @param parsedIntent - Optional pre-parsed intent from markdown
   * @returns Prepared context and merged intent
   */
  async prepareContext(
    message: string,
    sessionId: string,
    language: string,
    parsedIntent?: any
  ): Promise<ContextPreparationResult> {
    // Get existing session context
    const sessionContext = getSessionContext(sessionId, language);

    // Extract intent from the message
    const extractedIntent = await extractIntent(message, language as any);

    // Merge parsed markdown intent with extracted intent
    const mergedIntent = parsedIntent?.hasMarkdown
      ? {
          ...extractedIntent,
          // Add markdown-parsed structured data (preferences, sub-queries)
          preferences: parsedIntent.structuredData?.preferences || [],
          subQueries: parsedIntent.subQueries || [],
        }
      : extractedIntent;

    console.log('[ContextPreparationService] Merged intent:', mergedIntent);

    // Update context with extracted entities
    const updatedContext = updateContextFromMessage(sessionContext, message, {
      intent: mergedIntent,
      origin: mergedIntent.extractedEntities?.origin,
      destination: mergedIntent.extractedEntities?.destination,
      date: mergedIntent.extractedEntities?.date,
      time: mergedIntent.extractedEntities?.time,
    });

    // Persist updated context to session
    setSessionContext(sessionId, updatedContext);

    return {
      sessionContext,
      mergedIntent,
      updatedContext,
    };
  }
}
