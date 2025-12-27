/**
 * Planning Orchestrator - Chains multiple MCP tools for complex queries
 * Handles multi-step execution plans for itineraries and trip planning
 */

import {
  executeTool,
  searchAttractions,
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
    // For bike transport, use eco-friendly plan with bike considerations
    return createEcoFriendlyPlan(context);
  }

  // Route based on intent type
  switch (intent.type) {
    case 'itinerary_creation':
      return createItineraryPlan(context);
    case 'trip_planning':
      return createTripPlan(context);
    case 'attraction_search':
      return createAttractionPlan(context);
    default:
      return null;
  }
}

/**
 * Create a plan for itinerary generation
 * Pattern: search attractions -> find trips -> get weather -> compile
 */
function createItineraryPlan(context: ConversationContext): ExecutionPlan {
  const destination = context.location.destination?.name || 'Zurich';
  const origin = context.location.origin?.name || 'Zurich HB';
  const date =
    context.time.date?.toISOString().split('T')[0] ||
    new Date().toISOString().split('T')[0];
  const time = context.time.departureTime
    ? context.time.departureTime.toTimeString().slice(0, 5)
    : '09:00';

  return {
    id: `itinerary-${Date.now()}`,
    name: 'Day Trip Itinerary',
    description: `Plan a day trip to ${destination}`,
    steps: [
      {
        id: 'find-destination-station',
        toolName: 'findStopPlacesByName',
        params: { query: destination, limit: 3 },
      },
      {
        id: 'find-origin-station',
        toolName: 'findStopPlacesByName',
        params: { query: origin, limit: 3 },
      },
      {
        id: 'search-attractions',
        toolName: 'searchAttractions',
        params: { region: destination, limit: 5 },
      },
      {
        id: 'find-outbound-trips',
        toolName: 'findTrips',
        params: (results: StepResults) => {
          const originStation = results.get('find-origin-station')?.data?.[0];
          const destStation = results.get('find-destination-station')
            ?.data?.[0];
          return {
            origin: originStation?.name || origin,
            destination: destStation?.name || destination,
            date,
            time,
            isArrivalTime: false,
          };
        },
        dependsOn: ['find-origin-station', 'find-destination-station'],
      },
      {
        id: 'get-weather',
        toolName: 'getWeather',
        params: (results: StepResults) => {
          const destStation = results.get('find-destination-station')
            ?.data?.[0];
          return {
            location: destStation?.name || destination,
            date,
          };
        },
        dependsOn: ['find-destination-station'],
        optional: true,
      },
      {
        id: 'find-return-trips',
        toolName: 'findTrips',
        params: (results: StepResults) => {
          const originStation = results.get('find-origin-station')?.data?.[0];
          const destStation = results.get('find-destination-station')
            ?.data?.[0];
          return {
            origin: destStation?.name || destination,
            destination: originStation?.name || origin,
            date,
            time: '18:00',
            isArrivalTime: false,
          };
        },
        dependsOn: ['find-origin-station', 'find-destination-station'],
        optional: true,
      },
    ],
  };
}

/**
 * Create a plan for trip search
 * Pattern: find stations -> find trips -> get eco comparison
 */
function createTripPlan(context: ConversationContext): ExecutionPlan {
  const origin = context.location.origin?.name;
  const destination = context.location.destination?.name;

  if (!origin || !destination) {
    // Not enough info for trip planning
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
          const originStation = results.get('find-origin')?.data?.[0];
          const destStation = results.get('find-destination')?.data?.[0];
          return {
            origin: originStation?.name || origin,
            destination: destStation?.name || destination,
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
        optional: true,
        condition: (results: StepResults) =>
          context.preferences.travelStyle === 'eco',
      },
    ],
  };
}

/**
 * Create a plan for attraction search
 * Pattern: search attractions -> find nearby stations -> get weather
 */
function createAttractionPlan(context: ConversationContext): ExecutionPlan {
  const region = context.location.destination?.name || 'Switzerland';

  return {
    id: `attractions-${Date.now()}`,
    name: 'Attraction Search',
    description: `Find attractions in ${region}`,
    steps: [
      {
        id: 'search-attractions',
        toolName: 'searchAttractions',
        params: { region, limit: 10 },
      },
      {
        id: 'find-nearby-station',
        toolName: 'findPlaces',
        params: (results: StepResults) => {
          const attractions = results.get('search-attractions')?.data;
          if (attractions && attractions.length > 0) {
            const first = attractions[0];
            return {
              query: first.location?.city || region,
              type: 'station',
              limit: 3,
            };
          }
          return { query: region, type: 'station', limit: 3 };
        },
        dependsOn: ['search-attractions'],
        optional: true,
      },
      {
        id: 'get-weather',
        toolName: 'getWeather',
        params: { location: region },
        optional: true,
      },
    ],
  };
}

/**
 * Create an eco-friendly trip plan
 * Prioritizes trains, shows CO2 savings, avoids unnecessary transfers
 */
export function createEcoFriendlyPlan(
  context: ConversationContext
): ExecutionPlan {
  const origin = context.location.origin?.name;
  const destination = context.location.destination?.name;

  if (!origin || !destination) {
    return {
      id: `eco-trip-${Date.now()}`,
      name: 'Eco-Friendly Trip',
      description: 'Find sustainable travel options',
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
    id: `eco-trip-${Date.now()}`,
    name: 'Eco-Friendly Trip',
    description: `Find sustainable connections from ${origin} to ${destination}`,
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
            isArrivalTime: false,
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
      },
      {
        id: 'eco-comparison',
        toolName: 'getEcoComparison',
        params: (results: StepResults) => {
          const originStation = results.get('find-origin')?.data?.[0];
          const destStation = results.get('find-destination')?.data?.[0];
          return {
            origin: originStation?.name || origin,
            destination: destStation?.name || destination,
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
      },
    ],
  };
}

/**
 * Create a family-friendly trip plan
 * Prefers direct routes, avoids long transfers, shorter travel times
 */
export function createFamilyFriendlyPlan(
  context: ConversationContext
): ExecutionPlan {
  const origin = context.location.origin?.name;
  const destination = context.location.destination?.name;

  if (!origin || !destination) {
    return {
      id: `family-trip-${Date.now()}`,
      name: 'Family-Friendly Trip',
      description: 'Find family-friendly travel options',
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
    id: `family-trip-${Date.now()}`,
    name: 'Family-Friendly Trip',
    description: `Find family-friendly connections from ${origin} to ${destination}`,
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
            isArrivalTime: false,
            // Note: We would filter for direct routes or minimal transfers
            // but the MCP API doesn't support this filter yet
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
      },
      {
        id: 'search-family-attractions',
        toolName: 'searchAttractions',
        params: { region: destination, limit: 5, category: 'family' },
        optional: true,
      },
    ],
  };
}

/**
 * Create an accessible trip plan
 * Filters for wheelchair-accessible stations and vehicles
 */
export function createAccessiblePlan(
  context: ConversationContext
): ExecutionPlan {
  const origin = context.location.origin?.name;
  const destination = context.location.destination?.name;

  if (!origin || !destination) {
    return {
      id: `accessible-trip-${Date.now()}`,
      name: 'Accessible Trip',
      description: 'Find wheelchair-accessible travel options',
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
    id: `accessible-trip-${Date.now()}`,
    name: 'Accessible Trip',
    description: `Find accessible connections from ${origin} to ${destination}`,
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
            isArrivalTime: false,
            // Note: Accessibility filtering would happen here
            // but needs MCP API support for wheelchair-accessible filter
          };
        },
        dependsOn: ['find-origin', 'find-destination'],
      },
    ],
  };
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

  // Build dependency graph
  const pending = new Set(plan.steps.map((s) => s.id));
  const completed = new Set<string>();

  while (pending.size > 0) {
    // Find steps that can be executed (all dependencies met)
    const executable = plan.steps.filter((step) => {
      if (!pending.has(step.id)) return false;
      if (!step.dependsOn) return true;
      return step.dependsOn.every((dep) => completed.has(dep));
    });

    if (executable.length === 0 && pending.size > 0) {
      // Circular dependency or missing dependency
      console.error(
        'Execution stalled - remaining steps:',
        Array.from(pending)
      );
      break;
    }

    // Execute all ready steps in parallel
    const execPromises = executable.map(async (step) => {
      // Check condition
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

      // Resolve params if it's a function
      const params =
        typeof step.params === 'function' ? step.params(results) : step.params;

      const stepStart = Date.now();
      let result: ToolExecutionResult;

      try {
        // Check cache first
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
          // Execute the tool
          if (step.toolName === 'searchAttractions') {
            result = await searchAttractions(params as any);
          } else {
            result = await executeTool(step.toolName, params);
          }

          // Cache the result
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

    // Process results
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

      // Check if non-optional step failed
      const step = plan.steps.find((s) => s.id === result.stepId);
      if (!result.success && !step?.optional) {
        console.error(`Required step ${result.stepId} failed:`, result.error);
        // Continue execution but mark plan as partially failed
      }
    }
  }

  // Compile summary
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

  // Extract key data based on plan type
  if (plan.name === 'Day Trip Itinerary') {
    summary.outboundTrips = results.get('find-outbound-trips')?.data;
    summary.returnTrips = results.get('find-return-trips')?.data;
    summary.attractions = results.get('search-attractions')?.data;
    summary.weather = results.get('get-weather')?.data;
    summary.destinationStation = results.get(
      'find-destination-station'
    )?.data?.[0];
  } else if (plan.name === 'Trip Search') {
    summary.trips = results.get('find-trips')?.data;
    summary.ecoComparison = results.get('eco-comparison')?.data;
    summary.origin = results.get('find-origin')?.data?.[0];
    summary.destination = results.get('find-destination')?.data?.[0];
  } else if (plan.name === 'Attraction Search') {
    summary.attractions = results.get('search-attractions')?.data;
    summary.nearbyStations = results.get('find-nearby-station')?.data;
    summary.weather = results.get('get-weather')?.data;
  }

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

  if (summary.planName === 'Day Trip Itinerary') {
    parts.push(
      `## Day Trip to ${summary.destinationStation?.name || 'destination'}`
    );

    if (summary.weather) {
      parts.push(
        `\n**Weather:** ${summary.weather.temperature}°C, ${summary.weather.condition}`
      );
    }

    if (summary.outboundTrips?.length > 0) {
      parts.push('\n### Getting There');
      const trip = summary.outboundTrips[0];
      parts.push(`- Departure: ${trip.departure || 'N/A'}`);
      parts.push(`- Duration: ${trip.duration || 'N/A'}`);
      parts.push(`- Transfers: ${trip.transfers ?? 0}`);
    }

    if (summary.attractions?.length > 0) {
      parts.push('\n### Things to See');
      summary.attractions.slice(0, 5).forEach((a: any, i: number) => {
        parts.push(
          `${i + 1}. **${a.name}** - ${
            a.description?.slice(0, 100) || 'A must-see attraction'
          }...`
        );
      });
    }

    if (summary.returnTrips?.length > 0) {
      parts.push('\n### Getting Back');
      const trip = summary.returnTrips[0];
      parts.push(`- Departure: ${trip.departure || '18:00'}`);
      parts.push(`- Duration: ${trip.duration || 'N/A'}`);
    }
  } else if (summary.planName === 'Trip Search') {
    if (summary.trips?.length > 0) {
      parts.push(
        `## Connections from ${summary.origin?.name} to ${summary.destination?.name}`
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
        `\n**Eco Impact:** ${
          summary.ecoComparison.co2Saved || 'N/A'
        } CO2 saved vs. car`
      );
    }
  } else if (summary.planName === 'Attraction Search') {
    if (summary.attractions?.length > 0) {
      parts.push(`## Attractions Found`);
      summary.attractions.slice(0, 5).forEach((a: any, i: number) => {
        parts.push(`${i + 1}. **${a.name}** (${a.category || 'attraction'})`);
      });
    }
  }

  return parts.join('\n');
}

/**
 * Detect if a message requires orchestration vs single tool
 */
export function requiresOrchestration(message: string): boolean {
  const orchestrationKeywords = [
    'plan',
    'itinerary',
    'day trip',
    'full day',
    'weekend',
    'schedule',
    'things to do',
    'what to see',
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

/**
 * Compile plan execution results into a structured itinerary
 */
export function compileItinerary(
  planResult: PlanExecutionResult,
  context: ConversationContext
): any {
  const destination = context.location.destination?.name || 'Unknown';
  const date = context.time.date?.toISOString() || new Date().toISOString();

  const activities: any[] = [];

  // Extract outbound trip
  const outboundTrip = planResult.results.find(
    (r) => r.stepId === 'find-outbound-trips'
  );
  if (outboundTrip?.data?.[0]) {
    const trip = outboundTrip.data[0];
    activities.push({
      time: trip.departure || '09:00',
      type: 'travel',
      title: `Depart to ${destination}`,
      location: trip.origin?.name || context.location.origin?.name,
      duration: trip.duration || '~1h',
      description: `${trip.transfers || 0} transfer(s)`,
    });
  }

  // Extract attractions
  const attractionsResult = planResult.results.find(
    (r) => r.stepId === 'search-attractions'
  );
  if (attractionsResult && attractionsResult.data?.length > 0) {
    const attractions = attractionsResult.data.slice(0, 3);
    let currentTime = 10; // Start at 10:00 AM

    attractions.forEach((attraction: any, index: number) => {
      const hour = Math.floor(currentTime);
      const minute = (currentTime % 1) * 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;

      activities.push({
        time: timeStr,
        type: 'attraction',
        title: attraction.name || `Attraction ${index + 1}`,
        location: attraction.location?.city || destination,
        duration: '~1.5h',
        description: attraction.description || attraction.category,
      });

      currentTime += 1.5; // 1.5 hours per attraction

      // Add meal break after 2nd attraction
      if (index === 1) {
        const mealHour = Math.floor(currentTime);
        const mealMinute = (currentTime % 1) * 60;
        const mealTime = `${mealHour.toString().padStart(2, '0')}:${mealMinute
          .toString()
          .padStart(2, '0')}`;

        activities.push({
          time: mealTime,
          type: 'meal',
          title: 'Lunch Break',
          location: destination,
          duration: '~1h',
          description: 'Enjoy local cuisine',
        });

        currentTime += 1;
      }
    });
  }

  // Extract return trip
  const returnTrip = planResult.results.find(
    (r) => r.stepId === 'find-return-trips'
  );
  if (returnTrip?.data?.[0]) {
    const trip = returnTrip.data[0];
    activities.push({
      time: trip.departure || '18:00',
      type: 'travel',
      title: 'Return Journey',
      location: destination,
      duration: trip.duration || '~1h',
      description: `${trip.transfers || 0} transfer(s)`,
    });
  }

  // Extract weather
  const weatherResult = planResult.results.find(
    (r) => r.stepId === 'get-weather'
  );
  let weatherOverview = 'Check weather forecast';
  if (weatherResult?.data) {
    const weather = weatherResult.data;
    weatherOverview = `${weather.current?.condition || 'Partly cloudy'}, ${
      weather.current?.temperature || 15
    }°C`;
  }

  // Calculate summary
  const totalTravelTime =
    outboundTrip?.data?.[0]?.duration && returnTrip?.data?.[0]?.duration
      ? `${outboundTrip.data[0].duration} + ${returnTrip.data[0].duration}`
      : 'N/A';

  return {
    destination,
    date,
    activities,
    summary: {
      totalTravelTime,
      totalCost: '50-80',
      weatherOverview,
    },
  };
}
