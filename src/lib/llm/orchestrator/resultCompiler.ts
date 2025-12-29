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
  
  // If we skipped explicit station finding, try to infer proper names from the trip result
  let originInfo = results.get('find-origin')?.data?.[0];
  let destInfo = results.get('find-destination')?.data?.[0];
  
  if (!originInfo && trips && trips.length > 0) {
      originInfo = { name: trips[0].legs[0].start.place.name };
  }
  if (!destInfo && trips && trips.length > 0) {
      const lastLeg = trips[0].legs[trips[0].legs.length - 1];
      destInfo = { name: lastLeg.end.place.name };
  }

  summary.origin = originInfo;
  summary.destination = destInfo;

  // Station events (departures/arrivals)
  const findStationRes = results.get('find-station');
  const getEventsRes = results.get('get-events');
  const stationInfo = findStationRes?.data?.[0];
  const events = getEventsRes?.data;
  
  if (events && typeof events === 'object' && stationInfo?.name) {
    // Inject station name so cards can display it
    try {
      (events as any).stationName = stationInfo.name;
      (events as any).stationId = stationInfo.id;
    } catch (e) {
      console.warn('Could not inject station info into events', e);
    }
  }

  summary.station = stationInfo;
  summary.events = (events && typeof events === 'object') ? events : null;

  return summary;
}
