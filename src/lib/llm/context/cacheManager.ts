/**
 * Cache Manager - Manages tool result caching with TTL
 */

import type { ConversationContext, ToolResultCache, MentionedEntity } from './types';

// Cache expiration times
export const CACHE_TTL = {
  trips: 5 * 60 * 1000, // 5 minutes
  weather: 30 * 60 * 1000, // 30 minutes
  stations: 60 * 60 * 1000, // 1 hour
};

/**
 * Cache a tool result for follow-up questions
 */
export function cacheToolResult(
  context: ConversationContext,
  toolName: string,
  params: any,
  result: any
): void {
  const ttl = CACHE_TTL[toolName as keyof typeof CACHE_TTL] || CACHE_TTL.trips;

  context.recentToolResults.set(toolName, {
    toolName,
    params,
    result,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + ttl),
  });

  trackMentionedEntities(context, toolName, result);
}

/**
 * Get cached result if still valid
 */
export function getCachedResult(
  context: ConversationContext,
  toolName: string
): ToolResultCache | null {
  const cached = context.recentToolResults.get(toolName);
  if (!cached) return null;

  if (new Date() > cached.expiresAt) {
    context.recentToolResults.delete(toolName);
    return null;
  }

  return cached;
}

/**
 * Track entities mentioned in tool results for reference resolution
 */
function trackMentionedEntities(
  context: ConversationContext,
  toolName: string,
  result: any
): void {
  const now = new Date();

  if (toolName === 'findTrips' && Array.isArray(result)) {
    context.mentionedTrips = result.slice(0, 5).map((trip, index) => ({
      type: 'trip' as const,
      name: `Trip ${index + 1}`,
      data: trip,
      mentionedAt: now,
      referenceIndex: index + 1,
    }));
  }

  if (toolName === 'getPlaceEvents' && result && (result.departures || result.arrivals)) {
    const list = result.departures || result.arrivals || [];
    context.mentionedTrips = list.slice(0, 5).map((item: any, index: number) => ({
      type: 'trip' as const,
      name: `Service ${index + 1}`,
      data: { ...item, id: item.journeyId }, // Normalize ID for easier access
      mentionedAt: now,
      referenceIndex: index + 1,
    }));
  }

  if (
    (toolName === 'findStopPlacesByName' || toolName === 'findPlaces') &&
    Array.isArray(result)
  ) {
    context.mentionedPlaces = result.slice(0, 5).map((place, index) => ({
      type: 'place' as const,
      name: place.name || place.text,
      data: place,
      mentionedAt: now,
      referenceIndex: index + 1,
    }));
  }
}
