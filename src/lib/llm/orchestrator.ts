/**
 * Planning Orchestrator - Chains multiple MCP tools for complex queries
 * Handles multi-step execution plans for trip planning
 */

import {
  executeTool,
  ToolExecutionResult,
} from './toolExecutor';
import {
  ConversationContext,
  cacheToolResult,
  getCachedResult,
  extractIntent,
} from './contextManager';

// Use Record<string, any> for flexible params since tools have varying schemas
type ToolParams = Record<string, any>;

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

/**
 * Create an execution plan based on user intent
 */
export function createExecutionPlan(
  intent: ReturnType<typeof extractIntent>,
  context: ConversationContext
): ExecutionPlan | null {
  // Check for specialized planning preferences
  if (context.preferences.travelStyle === 'eco') {
    return createEcoFriendlyPlan(context);
  }

  if (context.preferences.accessibility?.wheelchair) {
    return createAccessiblePlan(context);
  }

  if (context.preferences.transport?.bikeTransport) {
    return createEcoFriendlyPlan(context);
  }

  // Route based on intent type
  switch (intent.type) {
    case 'trip_planning':
      return createTripPlan(context);
    default:
      return null;
  }
}

/**
 * Create a plan for trip search
 * Pattern: find stations -> find trips -> get eco comparison
 */
function createTripPlan(context: ConversationContext): ExecutionPlan {
  const origin = context.location.origin?.name;
  const destination = context.location.destination?.name;

  if (!origin || !destination) {
    return {
      id: `trip-${Date.now()}`,
      name: 'Trip Search',
      description: 'Find public transport connections',
      steps: [],
    };
  }

  const date =
    context.time.date?.toISOString().split('T')[0] ||
    new Date().toISOString().split('T')[0];
  const time = context.time.departureTime
    ? context.time.departureTime.toTimeString().slice(0, 5)
    : new Date().toTimeString().slice(0, 5);

  return {
    id: `trip-${Date.now()}`,
    name: 'Trip Search',
    description: `Find connections from ${origin} to ${destination}`,
    steps: [
      {
        id: 'find-origin',
        toolName: 'findStopPlacesByName',
        params: { query: origin, limit: 1 },
      },
      {
        id: 'find-destination',
        toolName: 'findStopPlacesByName',
        params: { query: destination, limit: 1 },
      },
      {
        id: 'find-trips',
        toolName: 'findTrips',
        params: (results: StepResults) => {
          const originStation = results.get('find-origin')?.data?.[0];
          const destStation = results.get('find-destination')?.data?.[0];
          return {
            origin: originStation?.name || origin,
            destination: destStation?.name || destination,
            date,
            time,
            isArrivalTime: context.time.isArriveBy || false,
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
      },
      {
        id: 'eco-comparison',
        toolName: 'getEcoComparison',
        params: (results: StepResults) => {
          return {
            tripId: results.get('find-trips')?.data?.[0]?.id || '',
          };
        },
        dependsOn: ['find-trips'],
        optional: true,
        condition: (results: StepResults) =>
          context.preferences.travelStyle === 'eco' || !!results.get('find-trips')?.data?.[0],
      },
    ],
  };
}

/**
 * Create an eco-friendly trip plan
 */
export function createEcoFriendlyPlan(
  context: ConversationContext
): ExecutionPlan {
  return createTripPlan(context);
}

/**
 * Create an accessible trip plan
 */
export function createAccessiblePlan(
  context: ConversationContext
): ExecutionPlan {
  return createTripPlan(context);
}

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

/**
 * Compile results into a structured summary
 */
function compilePlanSummary(plan: ExecutionPlan, results: StepResults): any {
  const summary: any = {
    planName: plan.name,
    description: plan.description,
  };

  summary.trips = results.get('find-trips')?.data;
  summary.ecoComparison = results.get('eco-comparison')?.data;
  summary.origin = results.get('find-origin')?.data?.[0];
  summary.destination = results.get('find-destination')?.data?.[0];

  return summary;
}

/**
 * Generate a human-readable summary of plan results
 */
export function formatPlanResults(
  result: PlanExecutionResult,
  language: string = 'en'
): string {
  const parts: string[] = [];
  const summary = result.summary;

  if (summary.trips?.length > 0) {
    parts.push(
      `## Connections from ${summary.origin?.name || 'origin'} to ${summary.destination?.name || 'destination'}`
    );
    summary.trips.slice(0, 3).forEach((trip: any, i: number) => {
      parts.push(
        `\n**Option ${i + 1}:** ${trip.departure} → ${trip.arrival} (${
          trip.duration
        }, ${trip.transfers ?? 0} transfers)`
      );
    });
  }

  if (summary.ecoComparison) {
    parts.push(
      `\n**Eco Impact:** Sustainability data included in the response.`
    );
  }

  return parts.join('\n');
}

/**
 * Detect if a message requires orchestration
 */
export function requiresOrchestration(message: string): boolean {
  const orchestrationKeywords = [
    'plan',
    'schedule',
    'how to get',
    'recommend',
    'suggest',
    'best way',
    'complete',
    'entire',
  ];

  const lowerMessage = message.toLowerCase();
  return orchestrationKeywords.some((k) => lowerMessage.includes(k));
}
