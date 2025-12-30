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

  if (summary.trips && summary.trips.length > 0) {
    parts.push(
      `## Connections from ${(summary as any).origin?.name || 'origin'} to ${(summary as any).destination?.name || 'destination'}`
    );
    summary.trips.slice(0, 3).forEach((trip, i: number) => {
      parts.push(
        `\n**Option ${i + 1}:** ${(trip as any).departure} → ${(trip as any).arrival} (${
          (trip as any).duration
        }, ${(trip as any).transfers ?? 0} transfers)`
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
    const eventType = summary.events.arrivals ? 'Arrivals' : 'Departures';
    const list = summary.events.arrivals || summary.events.departures || [];
    
    parts.push(
      `\n## ${summary.station?.name || 'Station'} - Live ${eventType}`
    );
    
    if (list.length > 0) {
      parts.push(`Showing next ${list.length} services:`);
      list.slice(0, 3).forEach((item: any, i: number) => {
        const line = item.serviceProduct?.sbbServiceProduct?.name || item.line || 'Train';
        const rawTime = item.departureTime || item.arrivalTime || item.departure?.timeAimed || item.arrival?.timeAimed;
        let timeStr = 'N/A';
        if (rawTime) {
          try {
            const date = new Date(rawTime);
            if (!isNaN(date.getTime())) {
              timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.warn('Error formatting time in resultFormatter', e);
          }
        }
        parts.push(
          `- **Service ${i + 1}:** ${timeStr} ${line} to ${item.destination || item.origin?.name || item.origin || 'Unknown'} (ID: ${item.journeyId})`
        );
      });
    } else {
      parts.push(`No upcoming ${eventType.toLowerCase()} found.`);
    }
  }

  return parts.join('\n');
}
