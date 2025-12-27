/**
 * Serialization - Serializes and deserializes conversation context
 */

import type { ConversationContext } from './types';

/**
 * Serialize context for storage
 */
export function serializeContext(context: ConversationContext): string {
  const serializable = {
    ...context,
    recentToolResults: Array.from(context.recentToolResults.entries()),
  };
  return JSON.stringify(serializable);
}

/**
 * Deserialize context from storage
 */
export function deserializeContext(json: string): ConversationContext {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    lastUpdated: new Date(parsed.lastUpdated),
    time: {
      ...parsed.time,
      departureTime: parsed.time.departureTime
        ? new Date(parsed.time.departureTime)
        : undefined,
      arrivalTime: parsed.time.arrivalTime
        ? new Date(parsed.time.arrivalTime)
        : undefined,
      date: parsed.time.date ? new Date(parsed.time.date) : undefined,
    },
    intentHistory: parsed.intentHistory.map((i: any) => ({
      ...i,
      timestamp: new Date(i.timestamp),
    })),
    recentToolResults: new Map(
      parsed.recentToolResults.map(([k, v]: [string, any]) => [
        k,
        {
          ...v,
          timestamp: new Date(v.timestamp),
          expiresAt: new Date(v.expiresAt),
        },
      ])
    ),
    mentionedPlaces: parsed.mentionedPlaces.map((e: any) => ({
      ...e,
      mentionedAt: new Date(e.mentionedAt),
    })),
    mentionedTrips: parsed.mentionedTrips.map((e: any) => ({
      ...e,
      mentionedAt: new Date(e.mentionedAt),
    })),
  };
}
