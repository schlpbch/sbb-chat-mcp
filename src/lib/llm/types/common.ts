/**
 * Common type definitions for LLM chat system
 */

/**
 * Extracted entities from user messages
 */
export interface ExtractedEntities {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  eventType?: 'arrivals' | 'departures';
  query?: string;
  locationName?: string;
  tripId?: string;
  journeyId?: string;
  stopPlaces?: string[];
  responseMode?: 'simple' | 'detailed';
  isAccessible?: boolean;
  [key: string]: string | string[] | boolean | undefined;
}

/**
 * Plan execution summary result
 */
export interface PlanSummary {
  steps: Array<{
    stepId: string;
    toolName: string;
    success: boolean;
    duration: number;
  }>;
  totalDuration: number;
  successCount: number;
  failureCount: number;
  trips?: Array<{
    id: string;
    legs: unknown[];
    [key: string]: unknown;
  }>;
  weather?: {
    location: string;
    current?: unknown;
    forecast?: unknown[];
  };
  events?: {
    arrivals?: unknown[];
    departures?: unknown[];
  };
  stations?: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
  formation?: unknown;
  ecoComparison?: unknown;
  snowConditions?: unknown;
  [key: string]: unknown;
}

/**
 * Tool execution result data types
 */
export type ToolResultData =
  | TripResult[]
  | WeatherResult
  | StationResult[]
  | EventResult
  | FormationResult
  | EcoComparisonResult
  | SnowConditionsResult
  | Record<string, unknown>
  | unknown[];

export interface TripResult {
  id: string;
  legs: LegData[];
  duration?: number;
  transfers?: number;
  [key: string]: unknown;
}

export interface LegData {
  id: string;
  origin?: unknown;
  destination?: unknown;
  departure?: unknown;
  arrival?: unknown;
  [key: string]: unknown;
}

export interface WeatherResult {
  location: string;
  current?: unknown;
  forecast?: unknown[];
  [key: string]: unknown;
}

export interface StationResult {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  [key: string]: unknown;
}

export interface EventResult {
  arrivals?: unknown[];
  departures?: unknown[];
  [key: string]: unknown;
}

export interface FormationResult {
  journeyId: string;
  formation?: unknown;
  [key: string]: unknown;
}

export interface EcoComparisonResult {
  tripId: string;
  comparison?: unknown;
  [key: string]: unknown;
}

export interface SnowConditionsResult {
  location: string;
  snowDepth?: number;
  lastSnowfall?: string;
  [key: string]: unknown;
}
