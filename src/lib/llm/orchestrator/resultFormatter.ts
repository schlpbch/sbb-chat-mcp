/**
 * Result Formatter - Generates human-readable summaries of plan results
 */

import type { PlanExecutionResult } from './types';

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

  // Station events (departures/arrivals)
  if (summary.events) {
    parts.push(
      `\n## ${summary.station?.name || 'Station'} - Live Board`
    );
    parts.push(
      `\nShowing live departure/arrival information.`
    );
  }

  return parts.join('\n');
}
