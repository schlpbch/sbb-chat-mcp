/**
 * Intent Extractor - Extracts user intent from messages
 */

import type { Intent } from './types';

/**
 * Extract intent from user message
 */
export function extractIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();

  const tripKeywords = [
    'train',
    'connection',
    'trip',
    'travel',
    'get to',
    'go to',
    'from',
    'to',
    'journey',
    'route',
  ];
  const weatherKeywords = ['weather', 'forecast', 'temperature', 'rain', 'snow'];
  const stationKeywords = ['station', 'stop', 'platform', 'departures', 'arrivals'];

  let type: Intent['type'] = 'general_info';
  let confidence = 0.5;

  if (stationKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'station_search';
    confidence = 0.9;
  } else if (tripKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'trip_planning';
    confidence = 0.8;
  } else if (weatherKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'weather_check';
    confidence = 0.9;
  }

  // Simple entity extraction for "from X" and "in X"
  const fromMatch = lowerMessage.match(/from\s+([a-zA-Z0-9\s\.-]+)/);
  const toMatch = lowerMessage.match(/to\s+([a-zA-Z0-9\s\.-]+)/);
  const inMatch = lowerMessage.match(/in\s+([a-zA-Z0-9\s\.-]+)/);

  const extractedEntities: any = {};
  if (fromMatch) extractedEntities.origin = fromMatch[1].trim();
  if (toMatch) extractedEntities.destination = toMatch[1].trim();
  // For station queries like "arrivals in Zurich", treat "in" as the origin
  if (inMatch && !fromMatch && !toMatch) {
    extractedEntities.origin = inMatch[1].trim();
  }

  // Extract event type for station queries
  if (type === 'station_search') {
    if (lowerMessage.includes('arrival')) {
      extractedEntities.eventType = 'arrivals';
    } else if (lowerMessage.includes('departure')) {
      extractedEntities.eventType = 'departures';
    } else {
      // Default to departures if not specified
      extractedEntities.eventType = 'departures';
    }
  }

  return {
    type,
    confidence,
    extractedEntities,
    timestamp: new Date(),
  };
}
