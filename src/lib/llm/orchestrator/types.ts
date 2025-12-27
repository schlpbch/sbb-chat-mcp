/**
 * Planning Orchestrator Type Definitions
 */

// Use Record<string, any> for flexible params since tools have varying schemas
export type ToolParams = Record<string, any>;

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
  data?: any;
  error?: string;
  duration: number;
}

export type StepResults = Map<string, StepResult>;

export interface PlanExecutionResult {
  planId: string;
  success: boolean;
  results: StepResult[];
  summary: any;
  totalDuration: number;
}
