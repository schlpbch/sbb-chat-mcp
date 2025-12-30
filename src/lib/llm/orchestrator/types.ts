/**
 * Planning Orchestrator Type Definitions
 */

import type { ToolResultData, PlanSummary } from '../types/common';
import type { FunctionCallParams } from '../functionDefinitions';

// Tool params are flexible but constrained to known function parameters
export type ToolParams = Partial<FunctionCallParams> | Record<string, unknown>;

export interface ExecutionStep {
  id: string;
  toolName: string;
  params: ToolParams | ((results: StepResults) => ToolParams);
  dependsOn?: string[]; // IDs of steps that must complete first
  optional?: boolean; // If true, failure doesn't stop execution
  condition?: (results: StepResults) => boolean; // Only execute if condition is met
}

export interface ExecutionPlan {
  id: string;
  name: string;
  description: string;
  steps: ExecutionStep[];
}

export interface StepResult {
  stepId: string;
  toolName: string;
  success: boolean;
  data?: ToolResultData;
  error?: string;
  params?: ToolParams;
  duration: number;
  skipped?: boolean; // Added to avoid type assertions
}

export type StepResults = Map<string, StepResult>;

export interface PlanExecutionResult {
  planId: string;
  success: boolean;
  results: StepResult[];
  summary: PlanSummary;
  totalDuration: number;
}
