/**
 * Shared type definitions for card components
 */

import type { Language } from '@/lib/i18n';

// ========================================
// Common Types
// ========================================

export interface StopPoint {
  name: string;
  time: string;
  platform?: string;
  delay?: number;
}

export interface ServiceProduct {
  name: string;
  number?: string;
  line?: string;
  category?: string;
}

// ========================================
// Leg Types (Discriminated Union)
// ========================================

export interface ServiceLeg {
  type: 'ServiceLeg';
  serviceJourney: {
    serviceProducts: ServiceProduct[];
  };
  departure: StopPoint;
  arrival: StopPoint;
  duration?: string;
  distance?: number;
}

export interface WalkLeg {
  type: 'WalkLeg';
  duration?: string;
  distance?: number;
}

export type Leg = ServiceLeg | WalkLeg;

// ========================================
// Trip Card Data
// ========================================

export interface TripSummary {
  duration?: string;
  transfers?: number;
  departure?: string;
  arrival?: string;
}

export interface TripData {
  legs: Leg[];
  origin?: StopPoint | string;
  destination?: StopPoint | string;
  summary?: TripSummary;
  price?: number;
  co2Emissions?: number;
}

export interface TripCardProps {
  data: TripData;
  language: Language;
}

// ========================================
// Board Card Data (Departures/Arrivals)
// ========================================

export interface Connection {
  id: string;
  time: string;
  destination?: string;
  origin?: string;
  platform?: string;
  category?: string;
  number?: string;
  line?: string;
  delay?: number;
  cancelled?: boolean;
}

export interface BoardData {
  type: 'departures' | 'arrivals';
  station: string;
  connections: Connection[];
}

export interface BoardCardProps {
  data: BoardData;
  language: Language;
}

// ========================================
// Weather Card Data
// ========================================

export interface WeatherHourly {
  temperature_2m: number[];
  apparent_temperature?: number[];
  relative_humidity_2m?: number[];
  wind_speed_10m?: number[];
  weather_code?: number[];
  precipitation?: number[];
  rain?: number[];
  uv_index?: number[];
  visibility?: number[];
  surface_pressure?: number[];
}

export interface WeatherDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code?: number[];
}

export interface WeatherData {
  locationName?: string;
  location?: string;
  hourly: WeatherHourly;
  daily?: WeatherDaily;
}

export interface WeatherCardProps {
  data: WeatherData;
  language: Language;
}

// ========================================
// Eco Card Data
// ========================================

export interface EcoData {
  route?: string;
  trainCO2?: number;
  carCO2?: number;
  planeCO2?: number;
  savings?: number;
  treesEquivalent?: number;
}

export interface EcoCardProps {
  data: EcoData;
  language: Language;
}

// ========================================
// Compare Card Data
// ========================================

export interface ComparisonRoute {
  id: string;
  name: string;
  duration: string;
  transfers: number;
  departure: string;
  arrival: string;
  price?: number;
  co2?: number;
  occupancy?: string;
  score?: number;
  legs?: Leg[];
  notes?: string[];
  attributes?: string[];
  reservationRequired?: boolean;
}

export interface CompareAnalysis {
  recommendation?: string;
  summary?: string;
  tradeoffs?: string[];
}

export interface CompareData {
  origin: string;
  destination: string;
  criteria: 'fastest' | 'fewest_changes' | 'earliest_arrival' | 'balanced';
  routes: ComparisonRoute[];
  analysis?: CompareAnalysis;
}

export interface CompareCardProps {
  data: CompareData;
  language: Language;
}

// ========================================
// Station Card Data
// ========================================

export interface StationData {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  facilities?: string[];
  services?: string[];
}

export interface StationCardProps {
  data: StationData;
  language: Language;
}

// ========================================
// Itinerary Card Data
// ========================================

export interface ItineraryData {
  origin?: string;
  destination?: string;
  legs: Leg[];
  price?: number;
  co2Emissions?: number;
  summary?: {
    duration?: string;
    transfers?: number;
    departure?: string;
    arrival?: string;
  };
}

export interface ItineraryCardProps {
  data: ItineraryData;
  language: Language;
}
