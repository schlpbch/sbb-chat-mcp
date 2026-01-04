/**
 * Orchestration Decision Service
 *
 * Determines whether a message should trigger orchestration based on
 * message content and intent confidence.
 */

import { requiresOrchestration } from '../detectionUtils';
import type { Intent } from '../../context/types';

export interface OrchestrationDecision {
  shouldOrchestrate: boolean;
  reason: string;
  confidence?: number;
}

export class OrchestrationDecisionService {
  /**
   * Determine if orchestration should be triggered
   *
   * @param message - User's message
   * @param intents - Extracted intents (array)
   * @param confidenceThreshold - Minimum confidence required (default: 0.7)
   * @returns Decision with reasoning
   */
  shouldOrchestrate(
    message: string,
    intents: Intent[],
    confidenceThreshold: number = 0.7
  ): OrchestrationDecision {
    // Multi-intent queries ALWAYS require orchestration
    if (intents.length > 1) {
      console.log(
        `[OrchestrationDecisionService] Multi-intent detected (${intents.length} intents) - orchestration required`
      );
      return {
        shouldOrchestrate: true,
        reason: `Multi-intent query detected (${intents.length} intents)`,
        confidence: Math.max(...intents.map((i) => i.confidence)),
      };
    }

    // Single intent - check if it's a type that always requires orchestration
    const intent = intents[0];
    const hasConfidence = intent.confidence >= confidenceThreshold;

    // Always orchestrate for these intent types if they have sufficient confidence
    const orchestrableIntents = [
      'trip_planning',
      'station_search',
      'train_formation',
      'eco_comparison',
    ];

    if (orchestrableIntents.includes(intent.type)) {
      if (!hasConfidence) {
        console.log(
          `[OrchestrationDecisionService] Intent "${intent.type}" below confidence threshold (${intent.confidence} < ${confidenceThreshold})`
        );
        return {
          shouldOrchestrate: false,
          reason: `Intent confidence (${intent.confidence}) below threshold (${confidenceThreshold})`,
          confidence: intent.confidence,
        };
      }

      console.log(
        `[OrchestrationDecisionService] Intent "${intent.type}" with sufficient confidence requires orchestration`
      );
      return {
        shouldOrchestrate: true,
        reason: `Intent type "${intent.type}" requires orchestration`,
        confidence: intent.confidence,
      };
    }

    // For other intents, use keyword-based detection
    const requiresOrch = requiresOrchestration(message);

    console.log(
      '[OrchestrationDecisionService] requiresOrchestration:',
      requiresOrch
    );
    console.log(
      '[OrchestrationDecisionService] intent.confidence:',
      intent.confidence
    );
    console.log(
      '[OrchestrationDecisionService] threshold:',
      confidenceThreshold
    );

    if (!requiresOrch) {
      return {
        shouldOrchestrate: false,
        reason: 'Message does not contain orchestration keywords',
        confidence: intent.confidence,
      };
    }

    if (!hasConfidence) {
      return {
        shouldOrchestrate: false,
        reason: `Intent confidence (${intent.confidence}) below threshold (${confidenceThreshold})`,
        confidence: intent.confidence,
      };
    }

    return {
      shouldOrchestrate: true,
      reason: 'Message requires orchestration and has sufficient confidence',
      confidence: intent.confidence,
    };
  }
}
