/**
 * Context Manager Type Definitions
 */

import type { ExtractedEntities } from '../types/common';
import type { FunctionCallParams } from '../functionDefinitions';
import type { ToolResultData } from '../types/common';

export interface UserPreferences {
  travelStyle: 'fastest' | 'cheapest' | 'eco' | 'comfortable' | 'balanced';
  accessibility?: {
    wheelchair?: boolean;
    visualAssistance?: boolean;
    reducedMobility?: boolean;
  };
  transport?: {
    bikeTransport?: boolean;
    firstClass?: boolean;
    avoidBus?: boolean;
  };
}

export interface LocationContext {
  origin?: {
    name: string;
    coordinates?: { lat: number; lon: number };
    stopId?: string;
  };
  destination?: {
    name: string;
    coordinates?: { lat: number; lon: number };
    stopId?: string;
  };
  intermediateStops?: Array<{
    name: string;
    stopId?: string;
    duration?: number; // minutes to spend here
  }>;
}

export interface TimeContext {
  departureTime?: Date;
  arrivalTime?: Date;
  isArriveBy?: boolean;
  duration?: number; // trip duration in hours
  date?: Date;
}

export interface ConversationContext {
  // Core context
  sessionId: string;
  language: string;
  createdAt: Date;
  lastUpdated: Date;

  // User preferences (persisted across messages)
  preferences: UserPreferences;

  // Current planning context
  location: LocationContext;
  time: TimeContext;

  // Intent tracking
  currentIntent?: Intent;
  intentHistory: Intent[];

  // Tool results cache (for follow-up questions)
  recentToolResults: Map<string, ToolResultCache>;

  // Mentioned entities for reference resolution
  mentionedPlaces: MentionedEntity[];
  mentionedTrips: MentionedEntity[];
}

export interface Intent {
  type:
    | 'trip_planning'
    | 'weather_check'
    | 'snow_conditions'
    | 'station_search'
    | 'train_formation'
    | 'general_info';
  confidence: number;
  extractedEntities: ExtractedEntities;
  timestamp: Date;
  detectedLanguages?: string[]; // Languages detected in the message
  matchedKeywords?: string[]; // Keywords that matched (for debugging)
  translatedFrom?: 'zh' | 'hi' | null; // Track if query was translated
}

export interface ToolResultCache {
  toolName: string;
  params: Partial<FunctionCallParams>;
  result: ToolResultData;
  timestamp: Date;
  expiresAt: Date;
}

export interface MentionedEntity {
  type: 'place' | 'trip';
  name: string;
  data: any;
  mentionedAt: Date;
  referenceIndex: number; // "the first one", "option 2"
}
