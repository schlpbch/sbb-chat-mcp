/**
 * Result Compiler - Compiles plan results into structured summaries
 */

import type { ExecutionPlan, StepResults } from './types';
import type { PlanSummary, TripResult, EventResult, StationResult } from '../types/common';

/**
 * Compile results into a structured summary
 */
export function compilePlanSummary(plan: ExecutionPlan, results: StepResults): PlanSummary {
  const summary: Partial<PlanSummary> = {
    steps: Array.from(results.values()).map(r => ({
      stepId: r.stepId,
      toolName: r.toolName,
      success: r.success,
      duration: r.duration,
    })),
    totalDuration: Array.from(results.values()).reduce((sum, r) => sum + r.duration, 0),
    successCount: Array.from(results.values()).filter(r => r.success).length,
    failureCount: Array.from(results.values()).filter(r => !r.success).length,
  };

  const tripsData = results.get('find-trips')?.data;
  const ecoComparisonData = results.get('eco-comparison')?.data;

  // Type-safe trips handling
  let trips: TripResult[] | undefined;
  if (Array.isArray(tripsData)) {
    trips = tripsData as TripResult[];

    // Merge eco comparison data into the first trip if available
    if (trips.length > 0 && ecoComparisonData && typeof ecoComparisonData === 'object') {
      trips[0] = {
        ...trips[0],
        ...(ecoComparisonData as Record<string, unknown>),
      };
    }
  }

  summary.trips = trips;
  summary.ecoComparison = ecoComparisonData;
  
  // Station events (departures/arrivals)
  const findStationRes = results.get('find-station');
  const getEventsRes = results.get('get-events');
  const stationData = findStationRes?.data;
  const eventsData = getEventsRes?.data;

  let stations: StationResult[] | undefined;
  if (Array.isArray(stationData)) {
    stations = stationData as StationResult[];
  }

  let events: EventResult | undefined;
  if (eventsData && typeof eventsData === 'object' && !Array.isArray(eventsData)) {
    events = {
      ...(eventsData as EventResult),
      stationName: stations?.[0]?.name,
      stationId: stations?.[0]?.id,
    } as EventResult;
  }

  summary.stations = stations;
  summary.events = events;

  // Weather data
  const weatherData = results.get('get-weather')?.data;
  if (weatherData && typeof weatherData === 'object' && !Array.isArray(weatherData)) {
    summary.weather = weatherData as PlanSummary['weather'];
  }

  // Formation data
  const formationData = results.get('get-formation')?.data;
  if (formationData) {
    summary.formation = formationData;
  }

  // Snow conditions
  const snowData = results.get('get-snow')?.data;
  if (snowData) {
    summary.snowConditions = snowData;
  }

  return summary as PlanSummary;
}
