/**
 * Plan Executor - Executes plans with dependency resolution
 */

import type { ConversationContext } from '../contextManager';
import { getCachedResult, cacheToolResult } from '../contextManager';
import { executeTool, type ToolExecutionResult } from '../toolExecutor';
import type { ExecutionPlan, PlanExecutionResult, StepResult, StepResults } from './types';
import { compilePlanSummary } from './resultCompiler';

/**
 * Execute a plan with dependency resolution
 */
export async function executePlan(
  plan: ExecutionPlan,
  context: ConversationContext
): Promise<PlanExecutionResult> {
  const startTime = Date.now();
  const results: StepResults = new Map();
  const stepResults: StepResult[] = [];

  const pending = new Set(plan.steps.map((s) => s.id));
  const completed = new Set<string>();

  while (pending.size > 0) {
    const executable = plan.steps.filter((step) => {
      if (!pending.has(step.id)) return false;
      if (!step.dependsOn) return true;
      return step.dependsOn.every((dep) => completed.has(dep));
    });

    if (executable.length === 0 && pending.size > 0) break;

    const execPromises = executable.map(async (step) => {
      if (step.condition && !step.condition(results)) {
        return {
          stepId: step.id,
          toolName: step.toolName,
          success: true,
          data: null,
          duration: 0,
          skipped: true,
        };
      }

      const params =
        typeof step.params === 'function' ? step.params(results) : step.params;

      const stepStart = Date.now();
      let result: ToolExecutionResult;

      try {
        const cached = getCachedResult(context, step.toolName);
        if (
          cached &&
          JSON.stringify(cached.params) === JSON.stringify(params)
        ) {
          result = {
            success: true,
            data: cached.result,
            toolName: step.toolName,
            params,
          };
        } else {
          result = await executeTool(step.toolName, params);
          if (result.success) {
            cacheToolResult(context, step.toolName, params, result.data);
          }
        }

        return {
          stepId: step.id,
          toolName: step.toolName,
          success: result.success,
          data: result.data,
          error: result.error,
          duration: Date.now() - stepStart,
        };
      } catch (error) {
        return {
          stepId: step.id,
          toolName: step.toolName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - stepStart,
        };
      }
    });

    const batchResults = await Promise.all(execPromises);

    for (const result of batchResults) {
      if ((result as any).skipped) {
        pending.delete(result.stepId);
        completed.add(result.stepId);
        continue;
      }

      results.set(result.stepId, result);
      stepResults.push(result);
      pending.delete(result.stepId);
      completed.add(result.stepId);
    }
  }

  const summary = compilePlanSummary(plan, results);

  return {
    planId: plan.id,
    success: stepResults.every(
      (r) => r.success || plan.steps.find((s) => s.id === r.stepId)?.optional
    ),
    results: stepResults,
    summary,
    totalDuration: Date.now() - startTime,
  };
}
