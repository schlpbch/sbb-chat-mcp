/**
 * Zod schemas for runtime validation of card data
 * These schemas provide type-safe validation and parsing of API responses
 */

import { z } from 'zod';

// ============================================================================
// Board Card Schemas (Departures/Arrivals)
// ============================================================================

export const connectionSchema = z.object({
  time: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  destination: z.string().optional(),
  origin: z.string().optional(),
  platform: z.string().or(z.number()).optional(),
  track: z.string().or(z.number()).optional(),
  lineNumber: z.string().optional(),
  line: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  delay: z.number().or(z.string()).optional(),
  occupancy: z.string().optional(),
}).passthrough(); // Allow extra fields

export const boardDataSchema = z.object({
  type: z.enum(['departures', 'arrivals']).optional(),
  station: z.string().optional(),
  stationName: z.string().optional(),
  connections: z.array(connectionSchema).optional(),
  departures: z.array(connectionSchema).optional(),
  arrivals: z.array(connectionSchema).optional(),
  events: z.array(connectionSchema).optional(),
  stationboard: z.array(connectionSchema).optional(),
}).passthrough();

export type BoardData = z.infer<typeof boardDataSchema>;
export type Connection = z.infer<typeof connectionSchema>;

// ============================================================================
// Compare Card Schemas (Route Comparison)
// ============================================================================

export const routeSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.string(),
  transfers: z.number(),
  departure: z.string(),
  arrival: z.string(),
  price: z.number().optional(),
  co2: z.number().optional(),
  occupancy: z.string().optional(),
  score: z.number().optional(),
  legs: z.array(z.any()).optional(),
}).passthrough();

export const compareDataSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  criteria: z.string(),
  routes: z.array(routeSchema),
  analysis: z.object({
    tradeoffs: z.array(z.string()).optional(),
  }).optional(),
}).passthrough();

export type CompareData = z.infer<typeof compareDataSchema>;
export type Route = z.infer<typeof routeSchema>;

// ============================================================================
// Weather Card Schemas
// ============================================================================

export const weatherDataSchema = z.object({
  locationName: z.string().optional(),
  location: z.string().optional(),
  hourly: z.object({
    temperature_2m: z.array(z.number()).optional(),
    apparent_temperature: z.array(z.number()).optional(),
    relative_humidity_2m: z.array(z.number()).optional(),
    wind_speed_10m: z.array(z.number()).optional(),
    precipitation: z.array(z.number()).optional(),
    rain: z.array(z.number()).optional(),
    weather_code: z.array(z.number()).optional(),
    uv_index: z.array(z.number()).optional(),
    visibility: z.array(z.number()).optional(),
  }).optional(),
  daily: z.object({
    time: z.array(z.string()).optional(),
    temperature_2m_max: z.array(z.number()).optional(),
    temperature_2m_min: z.array(z.number()).optional(),
    weather_code: z.array(z.number()).optional(),
  }).optional(),
}).passthrough();

export type WeatherData = z.infer<typeof weatherDataSchema>;

// ============================================================================
// Eco Card Schemas
// ============================================================================

export const ecoDataSchema = z.object({
  route: z.string().optional(),
  trainCO2: z.number(),
  carCO2: z.number().optional(),
  planeCO2: z.number().optional(),
  savings: z.number().optional(),
  treesEquivalent: z.number().optional(),
}).passthrough();

export type EcoData = z.infer<typeof ecoDataSchema>;

// ============================================================================
// Station Card Schemas
// ============================================================================

export const stationDataSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }).optional(),
  distance: z.number().optional(),
}).passthrough();

export type StationData = z.infer<typeof stationDataSchema>;

// ============================================================================
// Trip Card Schemas
// ============================================================================

export const stopPointSchema = z.object({
  name: z.string().optional(),
  departure: z.object({
    time: z.string().optional(),
  }).optional(),
  arrival: z.object({
    time: z.string().optional(),
  }).optional(),
}).passthrough();

export const legSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ServiceLeg'),
    serviceJourney: z.object({
      serviceProducts: z.array(z.object({
        name: z.string().optional(),
        number: z.string().optional(),
        line: z.string().optional(),
      }).passthrough()),
    }).passthrough(),
    departure: stopPointSchema,
    arrival: stopPointSchema,
    duration: z.string().optional(),
  }).passthrough(),
  z.object({
    type: z.literal('WalkLeg'),
    duration: z.string().optional(),
    distance: z.number().optional(),
  }).passthrough(),
]);

export const tripDataSchema = z.object({
  legs: z.array(legSchema).optional(),
  origin: stopPointSchema.optional(),
  destination: stopPointSchema.optional(),
  summary: z.object({
    duration: z.string().optional(),
    departure: z.string().optional(),
    arrival: z.string().optional(),
    transfers: z.number().optional(),
  }).optional(),
}).passthrough();

export type TripData = z.infer<typeof tripDataSchema>;
export type Leg = z.infer<typeof legSchema>;
export type StopPoint = z.infer<typeof stopPointSchema>;
