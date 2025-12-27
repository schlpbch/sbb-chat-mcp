/**
 * Result Compiler - Compiles plan results into structured summaries
 */

import type { ExecutionPlan, StepResults } from './types';

/**
 * Compile results into a structured summary
 */
export function compilePlanSummary(plan: ExecutionPlan, results: StepResults): any {
  const summary: any = {
    planName: plan.name,
    description: plan.description,
  };

  summary.trips = results.get('find-trips')?.data;
  summary.ecoComparison = results.get('eco-comparison')?.data;
  summary.origin = results.get('find-origin')?.data?.[0];
  summary.destination = results.get('find-destination')?.data?.[0];

  // Station events (departures/arrivals)
  summary.station = results.get('find-station')?.data?.[0];
  summary.events = results.get('get-events')?.data;

  return summary;
}
