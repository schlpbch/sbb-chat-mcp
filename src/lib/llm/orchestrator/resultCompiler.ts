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

  const trips = results.get('find-trips')?.data;
  const ecoComparison = results.get('eco-comparison')?.data;
  
  // Merge eco comparison data into the first trip if available
  if (trips && Array.isArray(trips) && trips.length > 0 && ecoComparison) {
    trips[0] = {
      ...trips[0],
      trainCO2: ecoComparison.trainCO2,
      carCO2: ecoComparison.carCO2,
      planeCO2: ecoComparison.planeCO2,
      savings: ecoComparison.savings,
      co2Savings: ecoComparison.savings,
      comparedTo: ecoComparison.planeCO2 ? 'plane' : ecoComparison.carCO2 ? 'car' : undefined,
    };
  }
  
  summary.trips = trips;
  summary.ecoComparison = ecoComparison;
  summary.origin = results.get('find-origin')?.data?.[0];
  summary.destination = results.get('find-destination')?.data?.[0];

  // Station events (departures/arrivals)
  const stationInfo = results.get('find-station')?.data?.[0];
  const events = results.get('get-events')?.data;
  
  if (events && stationInfo?.name) {
    // Inject station name so cards can display it
    events.stationName = stationInfo.name;
    events.stationId = stationInfo.id;
  }

  summary.station = stationInfo;
  summary.events = events;

  return summary;
}
