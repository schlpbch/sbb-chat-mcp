/**
 * Plan Factory - Creates execution plans based on user intent
 */

import type { ConversationContext, Intent } from '../contextManager';
import type { ExecutionPlan } from './types';

/**
 * Create an execution plan based on user intent
 */
export function createExecutionPlan(
  intent: Intent,
  context: ConversationContext
): ExecutionPlan | null {
  // Check for specialized planning preferences
  if (context.preferences.travelStyle === 'eco') {
    return createEcoFriendlyPlan(context);
  }

  // Handle station search (departures/arrivals)
  if (intent.type === 'station_search') {
    return createStationEventsPlan(context);
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
        params: (results) => {
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
        params: (results) => {
          return {
            tripId: results.get('find-trips')?.data?.[0]?.id || '',
          };
        },
        dependsOn: ['find-trips'],
        optional: true,
        condition: (results) =>
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
 * Create a plan for station events (departures/arrivals)
 */
function createStationEventsPlan(context: ConversationContext): ExecutionPlan {
  // Try to find a location name from context or extract from message if possible (simplified here)
  // In a real scenario, we'd want robust entity extraction.
  // For now, we rely on the context having the location set via 'updateContextFromMessage'
  // OR we assume the Orchestrator is called after some entity extraction.

  // Actually, context.location.origin is often used as the "target" for single-location queries in our current logic
  const stationName = context.location.origin?.name || 'Switzerland';

  // Detect if user wants arrivals or departures
  // Check the current intent's extracted entities or fall back to keyword detection
  let eventType: 'arrivals' | 'departures' = 'departures';

  // If we have access to the original message through intent history, check it
  if (context.intentHistory.length > 0) {
    const latestIntent = context.intentHistory[context.intentHistory.length - 1];
    // Check if the intent has any metadata about event type
    if (latestIntent.extractedEntities?.eventType) {
      eventType = latestIntent.extractedEntities.eventType;
    }
  }

  return {
    id: `events-${Date.now()}`,
    name: 'Station Events',
    description: `Get ${eventType} for ${stationName}`,
    steps: [
      {
        id: 'find-station',
        toolName: 'findStopPlacesByName',
        params: { query: stationName, limit: 1 },
      },
      {
        id: 'get-events',
        toolName: 'getPlaceEvents',
        params: (results) => {
          const station = results.get('find-station')?.data?.[0];
          return {
            placeId: station?.id || '',
            eventType: eventType,
            limit: 10,
          };
        },
        dependsOn: ['find-station'],
      },
    ],
  };
}
