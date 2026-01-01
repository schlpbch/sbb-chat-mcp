/**
 * Plan Coordinator Service
 *
 * Coordinates the creation and execution of multi-step plans.
 * Handles plan creation, execution, result formatting, and tool call extraction.
 */

import { createExecutionPlan } from '../planFactory';
import { executePlan } from '../planExecutor';
import { formatPlanResults } from '../resultFormatter';
import type { Intent } from '../../context/types';
import type { ConversationContext } from '../../context/types';
import type { ExecutionPlan, PlanExecutionResult, StepResult } from '../types';

export interface ToolCall {
  toolName: string;
  params: Record<string, any>;
  result: any;
}

export interface PlanCoordinationResult {
  plan: ExecutionPlan;
  planResult: PlanExecutionResult;
  formattedResults: string;
  toolCalls: ToolCall[];
}

export class PlanCoordinatorService {
  /**
   * Coordinate plan creation and execution for single or multiple intents
   *
   * @param intents - User's intents (array)
   * @param context - Conversation context
   * @param language - User's language preference
   * @returns Plan execution results or null if no plan created
   */
  async coordinatePlan(
    intents: Intent[],
    context: ConversationContext,
    language: string
  ): Promise<PlanCoordinationResult | null> {
    // For multi-intent, create and execute plans for each intent
    if (intents.length > 1) {
      console.log(
        `[PlanCoordinatorService] Multi-intent coordination (${intents.length} intents)`
      );

      const allToolCalls: ToolCall[] = [];
      const allResults: StepResult[] = [];
      const formattedResultsParts: string[] = [];

      // Execute plans for each intent in priority order
      for (const intent of intents) {
        console.log(
          `[PlanCoordinatorService] Processing intent ${intent.priority}: ${intent.type}`
        );

        const plan = createExecutionPlan(intent, context);

        if (!plan || plan.steps.length === 0) {
          console.log(
            `[PlanCoordinatorService] No plan for intent: ${intent.type}`
          );
          continue;
        }

        const planResult = await executePlan(plan, context);

        console.log(
          `[PlanCoordinatorService] Intent ${intent.priority} execution completed. Success: ${planResult.success}`
        );

        // Collect results
        allResults.push(...planResult.results);

        // Format results for this intent
        const formattedResult = formatPlanResults(planResult, language);
        formattedResultsParts.push(
          `## Intent ${intent.priority}: ${intent.type}\n${formattedResult}`
        );

        // Extract tool calls
        const toolCalls: ToolCall[] = planResult.results
          .filter((r: StepResult) => r.success && r.data)
          .map((r: StepResult) => ({
            toolName: r.toolName,
            params: r.params || {},
            result: r.data,
          }));

        allToolCalls.push(...toolCalls);
      }

      if (allToolCalls.length === 0) {
        console.log('[PlanCoordinatorService] No successful tool calls');
        return null;
      }

      // Create combined plan result
      const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);
      const combinedPlanResult: PlanExecutionResult = {
        planId: `multi-intent-${Date.now()}`,
        success: allResults.some((r) => r.success),
        results: allResults,
        summary: {
          steps: allResults.map((r) => ({
            stepId: r.stepId,
            toolName: r.toolName,
            success: r.success,
            duration: r.duration,
          })),
          totalDuration,
          successCount: allResults.filter((r) => r.success).length,
          failureCount: allResults.filter((r) => !r.success).length,
        },
        totalDuration,
      };

      // Get first valid plan for compatibility
      const firstPlan = createExecutionPlan(intents[0], context);
      if (!firstPlan) {
        console.log('[PlanCoordinatorService] Could not create plan for first intent');
        return null;
      }

      return {
        plan: firstPlan,
        planResult: combinedPlanResult,
        formattedResults: formattedResultsParts.join('\n\n'),
        toolCalls: allToolCalls,
      };
    }

    // Single intent - use existing logic
    const intent = intents[0];
    const plan = createExecutionPlan(intent, context);

    // Check if plan has steps
    if (!plan || plan.steps.length === 0) {
      console.log('[PlanCoordinatorService] No execution plan created');
      return null;
    }

    // Execute the plan
    const planResult = await executePlan(plan, context);

    console.log(
      '[PlanCoordinatorService] Plan execution completed. Success:',
      planResult.success
    );
    console.log(
      '[PlanCoordinatorService] Number of results:',
      planResult.results.length
    );

    // Format results for LLM
    const formattedResults = formatPlanResults(planResult, language);

    // Extract successful tool calls
    const toolCalls: ToolCall[] = planResult.results
      .filter((r: StepResult) => r.success && r.data)
      .map((r: StepResult) => ({
        toolName: r.toolName,
        params: r.params || {},
        result: r.data,
      }));

    console.log('[PlanCoordinatorService] Plan results:', planResult.results);
    console.log(
      '[PlanCoordinatorService] Filtered tool calls:',
      toolCalls.map((tc) => ({ name: tc.toolName, hasData: !!tc.result }))
    );

    return {
      plan,
      planResult,
      formattedResults,
      toolCalls,
    };
  }
}
