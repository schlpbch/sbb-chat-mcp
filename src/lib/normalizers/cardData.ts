/**
 * Data normalizers for card components
 * These functions validate and transform API responses into consistent formats
 * using Zod schemas for runtime validation
 */

import { logger } from '@/lib/logger';
import {
  boardDataSchema,
  compareDataSchema,
  weatherDataSchema,
  ecoDataSchema,
  stationDataSchema,
  tripDataSchema,
  type BoardData,
  type CompareData,
  type WeatherData,
  type EcoData,
  type StationData,
  type TripData,
  type Connection,
  type Route,
} from '@/lib/schemas/cardData';

// ============================================================================
// Board Data Normalizer (Departures/Arrivals)
// ============================================================================

export interface NormalizedBoardData {
  type: 'departures' | 'arrivals';
  station: string;
  connections: Connection[];
}

/**
 * Normalizes board data from various API response formats
 * Handles multiple possible data structures and extracts connections
 */
export function normalizeBoardData(raw: unknown): NormalizedBoardData {
  // Validate input
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid board data: expected object');
  }

  // ALWAYS log raw board data for debugging
  console.log('=== RAW BOARD DATA ===', JSON.stringify(raw, null, 2));
  logger.debug('normalizeBoardData', 'Input data', raw);

  // Try Zod validation but don't fail if it doesn't match
  const parseResult = boardDataSchema.safeParse(raw);

  if (!parseResult.success) {
    logger.warn('normalizeBoardData', 'Zod validation failed, proceeding with raw data', parseResult.error);
    // Continue with raw data instead of throwing
  }

  const data = (parseResult.success ? parseResult.data : raw) as any;

  // Determine type
  const type: 'departures' | 'arrivals' =
    data.type === 'arrivals' ? 'arrivals' : 'departures';

  // Log available fields for debugging
  console.log('=== BOARD DATA FIELDS ===', {
    hasStation: !!data.station,
    hasStationName: !!data.stationName,
    hasPlace: !!data.place,
    hasStopPlace: !!data.stopPlace,
    placeName: data.place?.name,
    stopPlaceName: data.stopPlace?.name,
    allKeys: Object.keys(data),
  });

  // Extract station name from multiple possible fields
  const station = data.station || 
                 data.stationName || 
                 data.place?.name ||
                 data.stopPlace?.name ||
                 data.location?.name ||
                 data.name ||
                 'Unknown Station';

  // Extract connections from various possible locations
  let connections: Connection[] = [];

  if (data.connections && Array.isArray(data.connections)) {
    connections = data.connections;
  } else if (data.departures && Array.isArray(data.departures)) {
    connections = data.departures;
  } else if (data.arrivals && Array.isArray(data.arrivals)) {
    connections = data.arrivals;
  } else if (data.events && Array.isArray(data.events)) {
    connections = data.events;
  } else if (data.stationboard && Array.isArray(data.stationboard)) {
    connections = data.stationboard;
  } else if (Array.isArray(data)) {
    // If the data itself is an array, use it
    connections = data;
  } else {
    logger.warn('normalizeBoardData', 'No connections found in data');
    connections = [];
  }

  console.log('=== NORMALIZED BOARD DATA ===', {
    type,
    station,
    connectionCount: connections.length,
    firstConnection: connections[0],
  });

  logger.debug('normalizeBoardData', 'Normalized result', {
    type,
    station,
    connectionCount: connections.length,
  });

  return {
    type,
    station,
    connections,
  };
}

// ============================================================================
// Compare Data Normalizer (Route Comparison)
// ============================================================================

export interface NormalizedCompareData {
  origin: string;
  destination: string;
  criteria: string;
  routes: Route[];
  analysis?: {
    tradeoffs?: string[];
  };
}

/**
 * Normalizes route comparison data
 * Transforms trip data into standardized route format
 */
export function normalizeCompareData(
  raw: unknown,
  params?: { origin?: string; destination?: string; criteria?: string }
): NormalizedCompareData {
  // ALWAYS log raw MCP response for debugging
  console.log('=== RAW MCP COMPARE RESPONSE ===', JSON.stringify(raw, null, 2));
  logger.debug('normalizeCompareData', 'Raw MCP response', raw);

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid compare data: expected object');
  }

  const data = raw as Record<string, any>;

  // Extract origin and destination
  const origin =
    data.origin ||
    data.from ||
    params?.origin ||
    'Unknown';

  const destination =
    data.destination ||
    data.to ||
    params?.destination ||
    'Unknown';

  const criteria =
    data.criteria ||
    params?.criteria ||
    'balanced';

  // Extract routes from various possible locations
  let rawRoutes = data.routes || data.trips || data.options || data.data || [];

  // If result itself is an array, use it
  if (Array.isArray(data) && !rawRoutes.length) {
    rawRoutes = data;
  }

  if (!Array.isArray(rawRoutes)) {
    logger.warn('normalizeCompareData', 'Routes is not an array', { rawRoutes });
    rawRoutes = [];
  }

  // Transform routes
  const routes: Route[] = rawRoutes.map((trip: any, idx: number) => {
    // Helper function to extract time from leg
    const extractTimeFromLeg = (leg: any, isStart: boolean): string | null => {
      if (!leg) return null;
      
      // For serviceJourney legs (train/bus)
      if (leg.serviceJourney?.stopPoints) {
        const points = leg.serviceJourney.stopPoints;
        const point = isStart ? points[0] : points[points.length - 1];
        const timeData = isStart ? point?.departure : point?.arrival;
        return timeData?.timeAimed || timeData?.timeRt || null;
      }
      
      // For walking legs or simple legs
      if (isStart) {
        return leg.start?.departure?.timeAimed || 
               leg.departure || 
               null;
      } else {
        return leg.end?.arrival?.timeAimed || 
               leg.arrival || 
               null;
      }
    };

    // Extract times from legs
    const firstLeg = trip.legs?.[0];
    const lastLeg = trip.legs?.[trip.legs?.length - 1];
    
    const departureTime = extractTimeFromLeg(firstLeg, true) ||
                         trip.departure ||
                         trip.departureTime ||
                         null;
    
    const arrivalTime = extractTimeFromLeg(lastLeg, false) ||
                       trip.arrival ||
                       trip.arrivalTime ||
                       null;

    // DEBUG: Log extracted times for first route
    if (idx === 0) {
      logger.debug('normalizeCompareData', 'Route extraction', {
        hasLegs: !!trip.legs,
        legsCount: trip.legs?.length,
        departureTime,
        arrivalTime,
        duration: trip.duration,
        firstLegType: firstLeg?.type,
        lastLegType: lastLeg?.type,
      });
    }

    return {
      id: trip.id || `route-${idx}`,
      name: trip.name || `Option ${idx + 1}`,
      duration: trip.duration || trip.summary?.duration || 'PT0M',
      transfers: trip.transfers !== undefined
        ? trip.transfers
        : (trip.legs?.length 
            ? (() => {
                const serviceLegs = trip.legs.filter((l: any) => l.serviceJourney).length;
                // If we have service journey legs, count those minus 1
                // Otherwise, use total legs minus 1
                return serviceLegs > 0 ? Math.max(0, serviceLegs - 1) : Math.max(0, trip.legs.length - 1);
              })()
            : 0),
      departure: departureTime || new Date().toISOString(),
      arrival: arrivalTime || new Date().toISOString(),
      price: trip.price,
      co2: trip.co2 || trip.trainCO2,
      occupancy: trip.occupancy,
      score: trip.score !== undefined ? trip.score : 100.0,
      legs: trip.legs || [],
    };
  });

  const normalized: NormalizedCompareData = {
    origin,
    destination,
    criteria,
    routes,
    analysis: Array.isArray(data) ? undefined : data.analysis,
  };

  logger.debug('normalizeCompareData', 'Normalized result', {
    origin,
    destination,
    routeCount: routes.length,
    firstRouteDeparture: routes[0]?.departure,
    firstRouteArrival: routes[0]?.arrival,
  });

  return normalized;
}

// ============================================================================
// Weather Data Normalizer
// ============================================================================

/**
 * Normalizes weather data
 * Validates structure and provides defaults for missing fields
 */
export function normalizeWeatherData(raw: unknown): WeatherData {
  logger.debug('normalizeWeatherData', 'Input data', raw);

  const parseResult = weatherDataSchema.safeParse(raw);

  if (!parseResult.success) {
    logger.error('normalizeWeatherData', 'Validation failed', parseResult.error);
    throw new Error('Invalid weather data: validation failed');
  }

  return parseResult.data;
}

// ============================================================================
// Eco Data Normalizer
// ============================================================================

/**
 * Normalizes eco comparison data
 * Validates required fields and structure
 */
export function normalizeEcoData(raw: unknown): EcoData {
  logger.debug('normalizeEcoData', 'Input data', raw);

  const parseResult = ecoDataSchema.safeParse(raw);

  if (!parseResult.success) {
    logger.error('normalizeEcoData', 'Validation failed', parseResult.error);
    throw new Error('Invalid eco data: validation failed');
  }

  return parseResult.data;
}

// ============================================================================
// Station Data Normalizer
// ============================================================================

/**
 * Normalizes station data
 * Handles different coordinate formats
 */
export function normalizeStationData(raw: unknown): StationData {
  logger.debug('normalizeStationData', 'Input data', raw);

  const parseResult = stationDataSchema.safeParse(raw);

  if (!parseResult.success) {
    logger.error('normalizeStationData', 'Validation failed', parseResult.error);
    throw new Error('Invalid station data: validation failed');
  }

  return parseResult.data;
}

// ============================================================================
// Trip Data Normalizer
// ============================================================================

/**
 * Normalizes trip data
 * Validates leg structure and types
 */
export function normalizeTripData(raw: unknown): TripData {
  logger.debug('normalizeTripData', 'Input data', raw);

  const parseResult = tripDataSchema.safeParse(raw);

  if (!parseResult.success) {
    logger.error('normalizeTripData', 'Validation failed', parseResult.error);
    throw new Error('Invalid trip data: validation failed');
  }

  return parseResult.data;
}
