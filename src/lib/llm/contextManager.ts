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
export { CACHE_TTL, cacheToolResult, getCachedResult } from './context/cacheManager';

// Re-export intent extraction
export { extractIntent } from './context/intentExtractor';

// Re-export reference resolution
export { resolveReference } from './context/referenceResolver';

// Re-export serialization
export { serializeContext, deserializeContext } from './context/serialization';

// Re-export prompt building
export { buildContextualPrompt } from './context/promptBuilder';

// Import types for local use
import type { ConversationContext, UserPreferences, Intent } from './context/types';

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
    const now = new Date();
    let baseDate = now;

    if (extractedData.date) {
      const lowerDate = extractedData.date.toLowerCase();
      if (lowerDate === 'tomorrow') {
        baseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (lowerDate === 'yesterday') {
        baseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (lowerDate !== 'today') {
        const parsed = new Date(extractedData.date);
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      }
    }

    const dateStr = baseDate.toISOString().split('T')[0];
    let timeStr = extractedData.time || '09:00';
    
    // Normalize timeStr (e.g., "7:00" -> "07:00")
    if (/^\d:\d{2}/.test(timeStr)) {
      timeStr = '0' + timeStr;
    } else if (/^\d$/.test(timeStr) || /^\d{2}$/.test(timeStr)) {
      // Just a number like "7" or "19"
      timeStr = (timeStr.length === 1 ? '0' : '') + timeStr + ':00';
    }

    const combined = new Date(`${dateStr}T${timeStr}`);
    if (!isNaN(combined.getTime())) {
      updated.time.departureTime = combined;
      updated.time.date = new Date(dateStr);
    } else {
      // Fallback
      updated.time.departureTime = new Date();
      updated.time.date = new Date();
    }
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
