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
   * @param intent - Extracted intent
   * @param confidenceThreshold - Minimum confidence required (default: 0.7)
   * @returns Decision with reasoning
   */
  shouldOrchestrate(
    message: string,
    intent: Intent,
    confidenceThreshold: number = 0.7
  ): OrchestrationDecision {
    const requiresOrch = requiresOrchestration(message);
    const hasConfidence = intent.confidence >= confidenceThreshold;

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
