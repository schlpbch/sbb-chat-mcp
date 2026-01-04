/**
 * Context Preparation Service
 *
 * Handles intent extraction, merging, and context updates for orchestrated chat.
 * Supports both single and multi-intent extraction.
 * Extracted from orchestratedChatMode.ts to improve testability and maintainability.
 */

import { getSessionContext, setSessionContext } from '../../sessionManager';
import { updateContextFromMessage } from '../../contextManager';
import { extractMultipleIntents } from '../../context/multiIntentExtractor';
import type { ConversationContext, Intent } from '../../context/types';

export interface ContextPreparationResult {
  sessionContext: ConversationContext;
  intents: Intent[]; // Changed from mergedIntent to intents array
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
   * @param chatContext - Chat context with location info
   * @returns Prepared context and merged intent
   */
  async prepareContext(
    message: string,
    sessionId: string,
    language: string,
    parsedIntent?: any,
    chatContext?: any
  ): Promise<ContextPreparationResult> {
    // Get existing session context
    const sessionContext = getSessionContext(sessionId, language);

    // Extract multiple intents from the message
    const extractedIntents = await extractMultipleIntents(
      message,
      language as any
    );

    // Merge parsed markdown intent with extracted intents
    const intents = parsedIntent?.hasMarkdown
      ? extractedIntents.map((intent) => ({
          ...intent,
          // Add markdown-parsed structured data (preferences, sub-queries)
          preferences: parsedIntent.structuredData?.preferences || [],
          subQueries: parsedIntent.subQueries || [],
        }))
      : extractedIntents;

    console.log(
      `[ContextPreparationService] Extracted ${intents.length} intent(s):`
    );
    intents.forEach((intent, idx) => {
      console.log(
        `  [${idx + 1}] ${intent.type} (priority: ${
          intent.priority
        }, confidence: ${(intent.confidence * 100).toFixed(0)}%)`
      );
    });

    // Update context with extracted entities from primary intent (first one)
    const primaryIntent = intents[0];

    // Replace USER_LOCATION marker with nearest station if available
    let origin = primaryIntent.extractedEntities?.origin;
    let destination = primaryIntent.extractedEntities?.destination;

    console.log('[ContextPreparationService] Before replacement:', {
      origin,
      destination,
      hasNearestStation: !!chatContext?.nearestStation,
      nearestStationName: chatContext?.nearestStation?.name,
    });

    if (chatContext?.nearestStation) {
      const nearestStationName = chatContext.nearestStation.name;
      console.log(
        `[ContextPreparationService] Nearest station available: ${nearestStationName}`
      );

      if (origin === 'USER_LOCATION') {
        console.log(
          `[ContextPreparationService] ✅ Replacing origin USER_LOCATION with ${nearestStationName}`
        );
        origin = nearestStationName;
      }
      if (destination === 'USER_LOCATION') {
        console.log(
          `[ContextPreparationService] ✅ Replacing destination USER_LOCATION with ${nearestStationName}`
        );
        destination = nearestStationName;
      }
    } else {
      console.warn(
        '[ContextPreparationService] ⚠️ No nearest station in chatContext!'
      );
    }

    console.log('[ContextPreparationService] After replacement:', {
      origin,
      destination,
    });

    // Update the intent's extractedEntities with the replaced values
    // This is important because planFactory reads from intent.extractedEntities
    if (origin !== primaryIntent.extractedEntities?.origin) {
      primaryIntent.extractedEntities = {
        ...primaryIntent.extractedEntities,
        origin,
      };
    }
    if (destination !== primaryIntent.extractedEntities?.destination) {
      primaryIntent.extractedEntities = {
        ...primaryIntent.extractedEntities,
        destination,
      };
    }

    // Update context with extracted entities from primary intent (first one)
    const updatedContext = updateContextFromMessage(sessionContext, message, {
      intent: primaryIntent,
      origin,
      destination,
      date: primaryIntent.extractedEntities?.date,
      time: primaryIntent.extractedEntities?.time,
    });

    // Persist updated context to session
    setSessionContext(sessionId, updatedContext);

    return {
      sessionContext,
      intents,
      updatedContext,
    };
  }
}
