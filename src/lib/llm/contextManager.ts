/**
 * Context Manager - Tracks user preferences and conversation state
 * Enables intelligent multi-turn conversations with memory
 */

// Re-export all types
export type {
  UserPreferences,
  LocationContext,
  TimeContext,
  ConversationContext,
  Intent,
  ToolResultCache,
  MentionedEntity,
} from './context/types';

// Re-export cache management
export {
  CACHE_TTL,
  cacheToolResult,
  getCachedResult,
} from './context/cacheManager';

// Re-export intent extraction
export { extractIntent } from './context/intentExtractor';

// Re-export reference resolution
export { resolveReference } from './context/referenceResolver';

// Re-export serialization
export { serializeContext, deserializeContext } from './context/serialization';

// Re-export prompt building
export { buildContextualPrompt } from './context/promptBuilder';

// Import types for local use
import type {
  ConversationContext,
  UserPreferences,
  Intent,
} from './context/types';
import { TimeParser } from '../utils/TimeParser';

/**
 * Create a new conversation context
 */
export function createContext(
  sessionId: string,
  language: string = 'en'
): ConversationContext {
  return {
    sessionId,
    language,
    createdAt: new Date(),
    lastUpdated: new Date(),
    preferences: {
      travelStyle: 'balanced',
    },
    location: {},
    time: {},
    intentHistory: [],
    recentToolResults: new Map(),
    mentionedPlaces: [],
    mentionedTrips: [],
  };
}

/**
 * Update context with extracted information from user message
 */
export function updateContextFromMessage(
  context: ConversationContext,
  message: string,
  extractedData: Partial<{
    origin: string;
    destination: string;
    date: string;
    time: string;
    preferences: Partial<UserPreferences>;
    intent: Intent;
  }>
): ConversationContext {
  const updated = { ...context, lastUpdated: new Date() };

  if (extractedData.origin) {
    updated.location.origin = { name: extractedData.origin };
  }
  if (extractedData.destination) {
    updated.location.destination = { name: extractedData.destination };
  }

  if (extractedData.date || extractedData.time) {
    const { date, departureTime } = TimeParser.parseDatetime(
      extractedData.date,
      extractedData.time
    );
    updated.time.date = date;
    updated.time.departureTime = departureTime;
  }

  if (extractedData.preferences) {
    updated.preferences = {
      ...updated.preferences,
      ...extractedData.preferences,
    };
  }

  if (extractedData.intent) {
    updated.currentIntent = extractedData.intent;
    updated.intentHistory.push(extractedData.intent);
    if (updated.intentHistory.length > 10) {
      updated.intentHistory = updated.intentHistory.slice(-10);
    }
  }

  return updated;
}
