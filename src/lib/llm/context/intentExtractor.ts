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
  const formationKeywords = [
    'formation',
    'fromation',
    'composition',
    'wagon',
    'sector',
    'coach',
    'where is',
    'information',
    'info',
    'unit',
  ];

  let type: Intent['type'] = 'general_info';
  let confidence = 0.5;

  if (stationKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'station_search';
    confidence = 0.9;
  } else if (formationKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'train_formation';
    confidence = 0.9;
  } else if (tripKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'trip_planning';
    confidence = 0.8;
  } else if (weatherKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'weather_check';
    confidence = 0.9;
  }

  // Enhanced entity extraction with Unicode support (for Zürich, Genève, etc.)
  // Matches from "from" until a keyword like "at", "to", "tomorrow", or end of string
  const fromMatch = lowerMessage.match(/from\s+([^,]+?)(?=\s+(?:at|to|in|on|tomorrow|today|yesterday|with|via)\b|$|[.,!?])/i);
  const toMatch = lowerMessage.match(/to\s+([^,]+?)(?=\s+(?:at|from|in|on|tomorrow|today|yesterday|with|via)\b|$|[.,!?])/i);
  const inMatch = lowerMessage.match(/in\s+([^,]+?)(?=\s+(?:at|from|to|on|tomorrow|today|yesterday|with|via)\b|$|[.,!?])/i);

  const extractedEntities: any = {};
  if (fromMatch) extractedEntities.origin = fromMatch[1].trim();
  if (toMatch) extractedEntities.destination = toMatch[1].trim();
  // For station queries like "arrivals in Zurich", treat "in" as the origin
  if (inMatch && !fromMatch && !toMatch) {
    extractedEntities.origin = inMatch[1].trim();
  }

  // Extract date and time (using patterns from intentParser)
  const datePatterns = [
    /\b(today|tomorrow|yesterday)\b/i,
    /\b(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)\b/,
  ];
  
  const timePatterns = [
    /\b(\d{1,2}:\d{2})\b/i,
    /\bat\s+(\d{1,2}(?::\d{2})?)\b/i,
  ];

  for (const pattern of datePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) extractedEntities.date = match[1];
  }
  
  for (const pattern of timePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) extractedEntities.time = match[1];
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
