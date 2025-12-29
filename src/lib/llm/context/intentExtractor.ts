/**
 * Intent Extractor - Extracts user intent from messages
 */

import type { Intent } from './types';

/**
 * Extract intent from user message
 */
export function extractIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  console.log('[intentExtractor] Extracting from:', message);
  console.log('[intentExtractor] Lowercase:', lowerMessage);

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
    'zug', 'bahn', 'verbindung', 'reise', // DE
    'train', 'connexion', 'voyage', 'aller', // FR
    'treno', 'viaggio', // IT
  ];
  const weatherKeywords = ['weather', 'forecast', 'temperature', 'rain', 'snow', 'wetter', 'météo', 'meteo'];
  const stationKeywords = [
    'station', 'stop', 'platform', 'departures', 'arrivals',
    'bahnhof', 'haltestelle', 'abfahrt', 'ankunft', // DE
    'gare', 'arrêt', 'départ', 'arrivée', // FR
    'stazione', 'fermata', 'partenze', 'arrivi' // IT
  ];
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
    'wagen', 'sektor', 'traktion', // DE
  ];

  let type: Intent['type'] = 'general_info';
  let confidence = 0.5;

  // Helper function to check for keyword with word boundaries
  const hasKeyword = (keywords: string[], message: string) => {
    return keywords.some((k) => {
      // For multi-word keywords like "get to", use simple includes
      if (k.includes(' ')) {
        return message.includes(k);
      }
      // For single words, use word boundary at start only to match plurals
      // (e.g., "station" matches "stations", but "rain" doesn't match "trains")
      const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      return regex.test(message);
    });
  };

  // Check station keywords first (most specific - "train station" should be station search, not trip)
  if (hasKeyword(stationKeywords, lowerMessage)) {
    type = 'station_search';
    confidence = 0.9;
  } else if (hasKeyword(formationKeywords, lowerMessage)) {
    type = 'train_formation';
    confidence = 0.9;
  } else if (hasKeyword(tripKeywords, lowerMessage)) {
    type = 'trip_planning';
    confidence = 0.8;
  } else if (hasKeyword(weatherKeywords, lowerMessage)) {
    type = 'weather_check';
    confidence = 0.9;
  }

  // Enhanced entity extraction with Unicode support (for Zürich, Genève, etc.)
  // Enhanced entity extraction with Unicode support
  // Matches from "from/von/de" until a keyword
  // Enhanced entity extraction with Unicode support
  // Matches from "from/von/de" until a keyword
  // Updated to allow dots in abbreviations (e.g. St. Gallen) by ensuring dot is followed by space or EOS
  // Note: Removed \.\s from lookahead to allow St. to be captured
  const fromMatch = lowerMessage.match(/(?:from|von|ab|de|depuis|da)\s+(.+?)(?=\s+(?:at|um|à|to|nach|bis|pour|via|in|on|tomorrow|morgen|demain|today|heute|aujourd'hui|yesterday|gestern|hier|with)\b|$|[?!]|$)/i);
  const toMatch = lowerMessage.match(/(?:to|nach|bis|à|pour|vers|a)\s+(.+?)(?=\s+(?:at|um|à|from|von|ab|de|depuis|da|via|in|on|tomorrow|morgen|demain|today|heute|aujourd'hui|yesterday|gestern|hier|with)\b|$|[?!]|$)/i);
  const inMatch = lowerMessage.match(/(?:in|bei|dans|à)\s+([^,]+?)(?=\s+(?:at|um|à|from|von|ab|de|depuis|da|to|nach|bis|pour|a|via|on|tomorrow|morgen|demain|today|heute|aujourd'hui|yesterday|gestern|hier|with)\b|$|[?!]|$)/i);
  
  // Implicit "X to Y" pattern (e.g. "Zurich to Bern")
  // Only use if explicit 'from' is missing but 'to' is present, and message is short-ish
  const simpleToMatch = !fromMatch && !inMatch ? lowerMessage.match(/^(.+?)\s+(?:to|nach|bis|à|pour|vers|a)\s+(.+?)(?=\s+(?:at|um|via)|$)/i) : null;

  const extractedEntities: any = {};
  if (fromMatch) extractedEntities.origin = fromMatch[1].replace(/\*\*|_|#/g, '').trim();
  if (toMatch) extractedEntities.destination = toMatch[1].replace(/\*\*|_|#/g, '').trim();
  
  // Apply implicit match if standard match failed
  if (simpleToMatch && !extractedEntities.origin) {
      // Check if group 1 looks like a keyword or valid place
      // Avoid matching "I want to go to Bern" -> Origin "I want to go"
      // Basic heuristic: length < 30 chars
      if (simpleToMatch[1].length < 30) {
        extractedEntities.origin = simpleToMatch[1].replace(/\*\*|_|#/g, '').trim();
        if (!extractedEntities.destination) {
            extractedEntities.destination = simpleToMatch[2].replace(/\*\*|_|#/g, '').trim();
        }
      }
  }

  // For station queries like "arrivals in Zurich", treat "in" as the origin (station)
  if (inMatch && !fromMatch && !toMatch && !simpleToMatch) {
    extractedEntities.origin = inMatch[1].replace(/\*\*|_|#/g, '').trim();
  }

  // Extract date and time (using patterns from intentParser)
  const datePatterns = [
    /\b(today|tomorrow|yesterday|heute|morgen|gestern)\b/i,
    /\b(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)\b/,
  ];
  
  const timePatterns = [
    /\b(\d{1,2}:\d{2})\b/i,
    /\b(?:at|um)\s+(\d{1,2}(?::\d{2})?)\b/i,
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
  console.log('[intentExtractor] Extracted entities:', extractedEntities);

  return {
    type,
    confidence,
    extractedEntities,
    timestamp: new Date(),
  };
}
