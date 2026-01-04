/**
 * TypeScript interfaces for MCP (Model Context Protocol) tool responses
 *
 * This file contains type-safe definitions for all MCP tool responses,
 * eliminating the need for `any` types throughout the codebase.
 *
 * Tools are organized by category:
 * - Transport Functions (findTrips, findStopPlaces, etc.)
 * - Weather Functions (getWeather, getSnowConditions)
 * - Station Functions (getPlaceEvents, getTrainFormation)
 * - Analytics Functions (compareRoutes, getEcoComparison, etc.)
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface TimeInfo {
  timeAimed: string; // ISO 8601 timestamp
  delayText?: string; // e.g., "+5'"
}

// ============================================================================
// Transport Functions
// ============================================================================

/**
 * Response from findStopPlacesByName tool
 * Searches for train stations/stops by name
 */
export interface FindStopPlacesResponse {
  places: Array<{
    id: string;
    name: string;
    coordinates?: Coordinates;
    type?: string; // e.g., "Station", "Stop"
    canton?: string;
  }>;
}

/**
 * Response from findPlaces tool
 * Searches for places, addresses, POIs
 */
export interface FindPlacesResponse {
  places: Array<{
    id: string;
    name: string;
    type: 'address' | 'poi' | 'station';
    coordinates?: Coordinates;
    address?: string;
  }>;
}

/**
 * Response from findPlacesByLocation tool
 * Find stations/places near geographic coordinates
 */
export interface FindPlacesByLocationResponse {
  places: Array<{
    id: string;
    name: string;
    distance?: number; // meters
    coordinates: Coordinates;
    type?: string;
  }>;
}

/**
 * Leg types in a journey
 */
export interface ServiceLeg {
  type?: 'ServiceLeg';
  serviceJourney: {
    serviceProducts: Array<{
      name: string; // e.g., "IC 1"
      number?: string;
      vehicleMode?: { name: string }; // e.g., "train"
      corporateIdentity?: { name: string }; // e.g., "SBB"
    }>;
    stopPoints: Array<{
      place: { name: string };
      departure?: TimeInfo;
      arrival?: TimeInfo;
      platform?: string;
    }>;
  };
  duration?: string; // ISO 8601 duration (e.g., "PT57M")
}

export interface WalkLeg {
  type: 'WalkLeg';
  duration?: string; // ISO 8601 duration
  distance?: number; // meters
}

export type Leg = ServiceLeg | WalkLeg;

/**
 * Response from findTrips tool
 * Find journey connections between locations
 */
export interface FindTripsResponse {
  trips: Array<{
    id: string;
    origin: { name: string };
    destination: { name: string };
    departure: string; // ISO 8601
    arrival: string; // ISO 8601
    duration: string; // ISO 8601 duration
    price?: number;
    accessible?: boolean;
    occupancy?: 'Low' | 'Medium' | 'High';
    co2?: number;
    savings?: number;
    comparedTo?: string; // "car" | "plane"
    reservationRequired?: boolean;
    bookingUrl?: string;
    legs: Leg[];
  }>;
}

/**
 * Response from optimizeTransfers tool
 * Analyze transfer connections at hubs
 */
export interface OptimizeTransfersResponse {
  station: string;
  totalTransferTime: string; // ISO 8601 duration
  difficulty: 'easy' | 'moderate' | 'difficult';
  transfers: Array<{
    from: { platform?: string; arrival?: string };
    to: { platform?: string; departure?: string };
    walkingTime: string; // ISO 8601 duration
    barrierFree?: boolean;
  }>;
}

// ============================================================================
// Weather Functions
// ============================================================================

/**
 * Response from getWeather tool
 * Get general weather conditions
 */
export interface GetWeatherResponse {
  locationName?: string;
  location?: string;
  hourly?: {
    temperature_2m?: number[];
    apparent_temperature?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    precipitation?: number[];
    rain?: number[];
    weather_code?: number[];
    uv_index?: number[];
    visibility?: number[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}

/**
 * Response from getSnowConditions tool
 * Get ski/snow-specific conditions
 */
export interface GetSnowConditionsResponse {
  location: string;
  snowDepth?: {
    current?: number; // cm
    last24h?: number; // cm
    last7days?: number; // cm
  };
  temperature?: {
    current?: number; // °C
  };
  conditions?: {
    status?: 'snowing' | 'snow_showers' | 'clear' | 'partly_cloudy' | 'variable';
    visibility?: string;
  };
  forecast?: Array<{
    date: string;
    snowfall?: number;
    temperature?: { min: number; max: number };
  }>;
}

// ============================================================================
// Station Functions
// ============================================================================

/**
 * Connection info for departures/arrivals
 */
export interface Connection {
  time: string; // ISO 8601
  destination?: string; // For departures
  origin?: string; // For arrivals
  platform?: string;
  line?: string; // e.g., "IC 1"
  type?: 'train' | 'bus' | 'tram';
  delay?: string; // e.g., "+5'"
  journeyId?: string;
}

/**
 * Response from getPlaceEvents tool
 * Get departure/arrival boards for a station
 */
export interface GetPlaceEventsResponse {
  type: 'departures' | 'arrivals';
  station: string;
  connections: Connection[];
}

/**
 * Response from getTrainFormation tool
 * Get train composition details
 */
export interface GetTrainFormationResponse {
  journeyId: string;
  trainNumber?: string;
  composition?: {
    units: Array<{
      id: string;
      wagons: Array<{
        number: string;
        class?: '1' | '2';
        type?: 'restaurant' | 'quiet_zone' | 'family_zone' | 'bistro';
        position?: number;
      }>;
    }>;
  };
}

// ============================================================================
// Analytics Functions
// ============================================================================

/**
 * Response from getEcoComparison tool
 * Compare environmental impact of transport modes
 */
export interface GetEcoComparisonResponse {
  journey: {
    origin: string;
    destination: string;
    distance?: number; // km
  };
  comparison: {
    train: {
      co2: number; // kg
      energy?: number; // kWh
    };
    car: {
      co2: number; // kg
      energy?: number; // kWh
    };
    plane?: {
      co2: number; // kg
      energy?: number; // kWh
    };
  };
  savings: {
    vsCar: number; // kg CO2 saved
    vsPlane?: number; // kg CO2 saved
  };
  equivalentTo?: {
    trees?: number; // trees needed to offset per year
  };
}

/**
 * Response from compareRoutes tool
 * Compare and rank multiple route options
 */
export interface CompareRoutesResponse {
  origin: string;
  destination: string;
  criteria: 'fastest' | 'fewest_changes' | 'earliest_arrival' | 'balanced';
  routes: Array<{
    id: string;
    name: string; // e.g., "Option 1", "Fastest Route"
    departure: string; // ISO 8601
    arrival: string; // ISO 8601
    duration: string; // ISO 8601 duration
    transfers: number;
    price?: number;
    co2?: number;
    score?: number; // 0-100
    occupancy?: 'Low' | 'Medium' | 'High';
    legs?: Leg[];
  }>;
  analysis?: {
    summary?: string;
    recommendation?: string;
    tradeoffs?: string[];
  };
}

/**
 * Response from journeyRanking tool
 * Rank journeys by custom criteria
 */
export interface JourneyRankingResponse {
  criteria: {
    speed?: number; // weight 0-1
    comfort?: number;
    cost?: number;
    eco?: number;
  };
  rankings: Array<{
    journeyId: string;
    rank: number;
    totalScore: number;
    scores: {
      speed?: number;
      comfort?: number;
      cost?: number;
      eco?: number;
    };
    trip: FindTripsResponse['trips'][0]; // Reference to full trip data
  }>;
}

// ============================================================================
// Union Type for All Tool Responses
// ============================================================================

/**
 * Discriminated union of all MCP tool responses
 * Use toolName to narrow the type
 */
export type MCPToolResponse =
  | { toolName: 'findStopPlacesByName'; data: FindStopPlacesResponse }
  | { toolName: 'findPlaces'; data: FindPlacesResponse }
  | { toolName: 'findPlacesByLocation'; data: FindPlacesByLocationResponse }
  | { toolName: 'findTrips'; data: FindTripsResponse }
  | { toolName: 'optimizeTransfers'; data: OptimizeTransfersResponse }
  | { toolName: 'getWeather'; data: GetWeatherResponse }
  | { toolName: 'getSnowConditions'; data: GetSnowConditionsResponse }
  | { toolName: 'getPlaceEvents'; data: GetPlaceEventsResponse }
  | { toolName: 'getTrainFormation'; data: GetTrainFormationResponse }
  | { toolName: 'getEcoComparison'; data: GetEcoComparisonResponse }
  | { toolName: 'compareRoutes'; data: CompareRoutesResponse }
  | { toolName: 'journeyRanking'; data: JourneyRankingResponse };

/**
 * Extract response type for a specific tool
 * Usage: ToolResponseType<'findTrips'> => FindTripsResponse
 */
export type ToolResponseType<T extends MCPToolResponse['toolName']> = Extract<
  MCPToolResponse,
  { toolName: T }
>['data'];

/**
 * Helper type to ensure a value matches a tool's response type
 */
export function assertToolResponse<T extends MCPToolResponse['toolName']>(
  toolName: T,
  data: unknown
): asserts data is ToolResponseType<T> {
  // Runtime validation could go here if needed
  // For now, this is a type-level assertion
}
