/**
 * Plan Factory - Creates execution plans based on user intent
 */

import type { ConversationContext, Intent } from '../contextManager';
import type { ExecutionPlan } from './types';
import type { EventResult, TripResult, StationResult } from '../types/common';

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
    case 'train_formation':
      return createFormationPlan(context);
    case 'weather_check':
      return createWeatherPlan(context);
    default:
      return null;
  }
}

/**
 * Create a plan for weather check
 */
function createWeatherPlan(context: ConversationContext): ExecutionPlan {
    const location = context.location.origin?.name || 
                   context.intentHistory[context.intentHistory.length - 1]?.extractedEntities?.origin || 
                   'Switzerland';
    
    return {
        id: `weather-${Date.now()}`,
        name: 'Weather Check',
        description: `Get weather for ${location}`,
        steps: [
            {
                id: 'get-weather',
                toolName: 'getWeather',
                params: { location }
            }
        ]
    };
}

/**
 * Create a plan for train formation/composition
 */
function createFormationPlan(context: ConversationContext): ExecutionPlan | null {
  // Try to find a journeyId from recent tool results
  const eventsResult = context.recentToolResults.get('getPlaceEvents')?.result;
  const tripsResult = context.recentToolResults.get('findTrips')?.result;
  
  const latestIntent = context.intentHistory[context.intentHistory.length - 1];
  const messageText = latestIntent?.extractedEntities?.query || ''; // Fallback
  
  // Detect index (1st, 2nd, etc.)
  let index = 0;
  if (/second|2nd|#2/.test(messageText.toLowerCase())) index = 1;
  if (/third|3rd|#3/.test(messageText.toLowerCase())) index = 2;
  // Also check if user typed "2", "3" etc.
  const numMatch = messageText.match(/\b([1-5])\b/);
  if (numMatch) index = parseInt(numMatch[1]) - 1;

  let journeyId = '';
  let stopPlaceId = '';

  // 1. Try to find a journey from departures/arrivals board
  if (eventsResult && typeof eventsResult === 'object' && !Array.isArray(eventsResult)) {
    const typedEvents = eventsResult as EventResult;
    const list = typedEvents.departures || typedEvents.arrivals || [];
    if (list.length > index) {
      journeyId = list[index].journeyId;
      stopPlaceId = typedEvents.place || '';
    } else if (list.length > 0) {
      // Fallback to first if index out of range
      journeyId = list[0].journeyId;
      stopPlaceId = typedEvents.place || '';
    }
  }
  
  // 2. Try to find a journey from trip search if no board results
  if (!journeyId && tripsResult && Array.isArray(tripsResult)) {
    const typedTrips = tripsResult as TripResult[];
    if (typedTrips.length > index) {
      journeyId = (typedTrips[index] as TripResult).id || '';
      stopPlaceId = ((typedTrips[index] as TripResult).legs?.[0] as any)?.start?.place?.id || '';
    } else if (typedTrips.length > 0) {
      journeyId = (typedTrips[0] as TripResult).id || '';
      stopPlaceId = ((typedTrips[0] as TripResult).legs?.[0] as any)?.start?.place?.id || '';
    }
  }

  if (!journeyId) {
    return null; // Fallback to LLM if we can't find a candidate ID
  }

  return {
    id: `formation-${Date.now()}`,
    name: 'Train Formation',
    description: `Get composition for journey ${journeyId}`,
    steps: [
      {
        id: 'get-formation',
        toolName: 'getTrainFormation',
        params: {
          journeyId,
          stopPlaces: stopPlaceId ? [stopPlaceId] : []
        }
      }
    ]
  };
}

/**
 * Create a plan for trip search
 * Pattern: find stations -> find trips -> get eco comparison
 */

function createTripPlan(context: ConversationContext): ExecutionPlan {
  // Try to get location from context first, then fallback to latest intent extraction
  let origin = context.location.origin?.name;
  let destination = context.location.destination?.name;
  if (!origin || !destination) {
    const latest = context.intentHistory[context.intentHistory.length - 1];
    if (latest?.extractedEntities?.origin) origin = latest.extractedEntities.origin;
    if (latest?.extractedEntities?.destination) destination = latest.extractedEntities.destination;
  }

  // Fallback for "Departures from X" being misinterpreted as trip
  if (origin && !destination && !context.location.destination) {
     // If we only have origin, maybe we can accept it if we are just searching connections?
     // Or we return a "search destination" step? For now, we proceed to allow partial filling.
  }

  if (!origin && !destination) {
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
        id: 'find-trips',
        toolName: 'findTrips',
        params: {
          origin: origin,
          destination: destination,
          date: date,
          time: time,
          isArrivalTime: context.time.isArriveBy || false,
        },
      },
      {
        id: 'eco-comparison',
        toolName: 'getEcoComparison',
        params: (results) => {
          const tripsData = results.get('find-trips')?.data;
          const firstTrip = Array.isArray(tripsData) ? (tripsData[0] as TripResult) : undefined;
          return {
            tripId: firstTrip?.id || '',
          };
        },
        dependsOn: ['find-trips'],
        condition: (results) => {
          const tripsData = results.get('find-trips')?.data;
          return Array.isArray(tripsData) && tripsData.length > 0 && !!(tripsData[0] as TripResult)?.id;
        },
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
          const stationData = results.get('find-station')?.data;
          const station = Array.isArray(stationData) ? (stationData[0] as StationResult) : undefined;
          return {
            placeId: station?.id || '',
            eventType: eventType,
            dateTime: context.time.departureTime?.toISOString(),
            limit: 10,
          };
        },
        dependsOn: ['find-station'],
      },
    ],
  };
}
