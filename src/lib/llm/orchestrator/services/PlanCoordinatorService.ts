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
   * Coordinate plan creation and execution
   *
   * @param intent - User's intent
   * @param context - Conversation context
   * @param language - User's language preference
   * @returns Plan execution results or null if no plan created
   */
  async coordinatePlan(
    intent: Intent,
    context: ConversationContext,
    language: string
  ): Promise<PlanCoordinationResult | null> {
    // Create execution plan
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
