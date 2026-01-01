/**
 * Intent Extractor - Extracts user intent from messages
 *
 * Refactored to use structured multilingual dictionaries and utilities
 * for robust intent classification across EN/DE/FR/IT.
 *
 * For ZH/HI queries, translates to EN first before intent extraction.
 */

import type { Intent } from './types';
import type { Language } from './intentKeywords';
import { INTENT_KEYWORDS, getAllKeywords } from './intentKeywords';
import {
  buildEntityRegex,
  extractDate,
  extractTime,
  ENTITY_PREPOSITIONS,
} from './entityPatterns';
import {
  detectMessageLanguage,
  hasKeyword,
  countMatchedKeywords,
} from './languageDetection';
import {
  translateToEnglish,
  requiresTranslation,
} from '@/lib/translation/translationService';

/**
 * Extract intent from user message
 *
 * @param message - User message to analyze
 * @param userLanguage - User's selected language preference (optional)
 * @returns Detected intent with confidence score and extracted entities
 */
export async function extractIntent(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  let processedMessage = message;
  let translatedFrom: 'zh' | 'hi' | null = null;

  // Translate ZH/HI to EN for intent extraction
  if (requiresTranslation(userLanguage)) {
    processedMessage = await translateToEnglish(message, userLanguage);
    translatedFrom = userLanguage;
    console.log(
      `[intentExtractor] Translated ${userLanguage} → en:`,
      processedMessage
    );
  }

  const lowerMessage = processedMessage.toLowerCase();
  console.log('[intentExtractor] Extracting from:', message);
  console.log(
    '[intentExtractor] User language:',
    userLanguage || 'not specified'
  );

  // Detect language(s) in the message
  const detectedLanguages = detectMessageLanguage(message, userLanguage);
  console.log('[intentExtractor] Detected languages:', detectedLanguages);

  // Get keywords for detected languages
  const tripKeywords = getAllKeywords('trip_planning', detectedLanguages);
  const snowKeywords = getAllKeywords('snow_conditions', detectedLanguages);
  const weatherKeywords = getAllKeywords('weather_check', detectedLanguages);
  const stationKeywords = getAllKeywords('station_search', detectedLanguages);
  const formationKeywords = getAllKeywords(
    'train_formation',
    detectedLanguages
  );

  let type: Intent['type'] = 'general_info';
  let confidence = 0.5;
  const matchedKeywords: string[] = [];

  // Check keywords in priority order (most specific first)
  // Station keywords first - "train station" should be station search, not trip
  if (hasKeyword(stationKeywords, lowerMessage)) {
    type = 'station_search';
    const count = countMatchedKeywords(stationKeywords, lowerMessage);
    matchedKeywords.push(
      ...stationKeywords.filter((k) => hasKeyword([k], lowerMessage))
    );
    confidence = calculateBaseConfidence(count);
    console.log('[intentExtractor] Matched station keywords:', count);
  } else if (hasKeyword(formationKeywords, lowerMessage)) {
    type = 'train_formation';
    const count = countMatchedKeywords(formationKeywords, lowerMessage);
    matchedKeywords.push(
      ...formationKeywords.filter((k) => hasKeyword([k], lowerMessage))
    );
    confidence = calculateBaseConfidence(count);
    console.log('[intentExtractor] Matched formation keywords:', count);
  } else if (hasKeyword(snowKeywords, lowerMessage)) {
    // Check snow BEFORE weather to prevent misclassification
    type = 'snow_conditions';
    const count = countMatchedKeywords(snowKeywords, lowerMessage);
    matchedKeywords.push(
      ...snowKeywords.filter((k) => hasKeyword([k], lowerMessage))
    );
    confidence = calculateBaseConfidence(count);
    console.log('[intentExtractor] Matched snow keywords:', count);
  } else if (hasKeyword(tripKeywords, lowerMessage)) {
    type = 'trip_planning';
    const count = countMatchedKeywords(tripKeywords, lowerMessage);
    matchedKeywords.push(
      ...tripKeywords.filter((k) => hasKeyword([k], lowerMessage))
    );
    confidence = calculateBaseConfidence(count);
    console.log('[intentExtractor] Matched trip keywords:', count);
  } else if (hasKeyword(weatherKeywords, lowerMessage)) {
    type = 'weather_check';
    const count = countMatchedKeywords(weatherKeywords, lowerMessage);
    matchedKeywords.push(
      ...weatherKeywords.filter((k) => hasKeyword([k], lowerMessage))
    );
    confidence = calculateBaseConfidence(count);
    console.log('[intentExtractor] Matched weather keywords:', count);
  } else {
    // Check for implicit trip planning pattern (e.g., "Zurich to Bern")
    // Look for "X to/nach/à/a Y" pattern without explicit trip keywords
    const implicitTripPattern =
      /\b\w+\s+(?:to|nach|bis|à|pour|vers|a|per)\s+\w+/i;
    if (implicitTripPattern.test(lowerMessage)) {
      type = 'trip_planning';
      confidence = 0.6; // Lower confidence since no explicit keywords
      matchedKeywords.push('implicit_trip_pattern');
      console.log('[intentExtractor] Matched implicit trip pattern');
    }
  }

  // Extract entities using dynamic regex builders
  const extractedEntities = extractEntities(
    lowerMessage,
    detectedLanguages,
    type
  );

  // Refine confidence based on extracted entities
  confidence = refineConfidence(
    type,
    confidence,
    extractedEntities,
    matchedKeywords
  );

  console.log('[intentExtractor] Final intent:', type);
  console.log('[intentExtractor] Confidence:', confidence);
  console.log('[intentExtractor] Extracted entities:', extractedEntities);

  return {
    type,
    confidence,
    extractedEntities,
    timestamp: new Date(),
    detectedLanguages,
    matchedKeywords: matchedKeywords.slice(0, 5), // Limit to first 5 for debugging
    translatedFrom, // Track if query was translated from ZH/HI
  };
}

/**
 * Extract entities from message using multilingual patterns
 */
function extractEntities(
  message: string,
  languages: Language[],
  intentType: Intent['type']
): Record<string, any> {
  const entities: Record<string, any> = {};

  // Build dynamic regex patterns for detected languages
  const originRegex = buildEntityRegex('origin', languages);
  const destinationRegex = buildEntityRegex('destination', languages);
  const locationRegex = buildEntityRegex('location', languages);

  // Extract origin and destination
  const fromMatch = message.match(originRegex);
  const toMatch = message.match(destinationRegex);
  const inMatch = message.match(locationRegex);

  // For weather queries, prioritize location match over destination
  // (FR "à" and IT "a" appear in both destination and location prepositions)
  // Note: Using [2] because buildEntityRegex now captures preposition in [1] and entity in [2]
  if (intentType === 'weather_check' && inMatch && !fromMatch) {
    entities.origin = inMatch[2].replace(/\*\*|_|#/g, '').trim();
  } else {
    // Standard extraction for other intent types
    if (fromMatch) {
      entities.origin = fromMatch[2].replace(/\*\*|_|#/g, '').trim();
    }
    if (toMatch) {
      entities.destination = toMatch[2].replace(/\*\*|_|#/g, '').trim();
    }
  }

  // Implicit "X to Y" pattern (e.g., "Zurich to Bern")
  // Only use if explicit 'from' is missing but 'to' is present
  if (!fromMatch && !inMatch && toMatch) {
    const simplePattern = buildSimpleToPattern(languages);
    const simpleMatch = message.match(simplePattern);

    if (simpleMatch && simpleMatch[1].length < 30) {
      entities.origin = simpleMatch[1].replace(/\*\*|_|#/g, '').trim();
      if (!entities.destination) {
        entities.destination = simpleMatch[2].replace(/\*\*|_|#/g, '').trim();
      }
    }
  }

  // For station/weather/snow queries like "arrivals in Zurich", "weather in Lucerne", or "snow in Zermatt",
  // treat "in" as the origin (station/location)
  if (inMatch && !fromMatch && !toMatch) {
    if (
      intentType === 'station_search' ||
      intentType === 'weather_check' ||
      intentType === 'snow_conditions'
    ) {
      entities.origin = inMatch[2].replace(/\*\*|_|#/g, '').trim();
    }
  }

  // Extract date and time using language-specific patterns
  const date = extractDate(message, languages);
  const time = extractTime(message, languages);

  if (date) entities.date = date;
  if (time) entities.time = time;

  // Extract event type for station queries
  if (intentType === 'station_search') {
    if (
      message.includes('arrival') ||
      message.includes('arriving') ||
      message.includes('ankunft') ||
      message.includes('arrivée') ||
      message.includes('arrivo')
    ) {
      entities.eventType = 'arrivals';
    } else if (
      message.includes('departure') ||
      message.includes('departing') ||
      message.includes('abfahrt') ||
      message.includes('départ') ||
      message.includes('partenza')
    ) {
      entities.eventType = 'departures';
    } else {
      // Default to departures if not specified
      entities.eventType = 'departures';
    }
  }

  return entities;
}

/**
 * Build regex for simple "X to Y" pattern
 */
function buildSimpleToPattern(languages: Language[]): RegExp {
  const toPrepositions = languages.flatMap(
    (lang) => ENTITY_PREPOSITIONS.destination[lang]
  );

  // Sort by length (longest first)
  toPrepositions.sort((a, b) => b.length - a.length);

  const escapedPreps = toPrepositions.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  const pattern = `^(.+?)\\s+(?:${escapedPreps.join(
    '|'
  )})\\s+(.+?)(?=\\s+(?:at|um|à|alle|via)|$)`;
  return new RegExp(pattern, 'i');
}

/**
 * Calculate base confidence from keyword match count
 */
function calculateBaseConfidence(matchCount: number): number {
  if (matchCount >= 3) return 0.9;
  if (matchCount === 2) return 0.8;
  if (matchCount === 1) return 0.7;
  return 0.5;
}

/**
 * Refine confidence based on extracted entities and context
 */
function refineConfidence(
  intentType: Intent['type'],
  baseConfidence: number,
  entities: Record<string, any>,
  matchedKeywords: string[]
): number {
  let confidence = baseConfidence;

  // Boost confidence if relevant entities are present
  if (intentType === 'trip_planning') {
    if (entities.origin && entities.destination) {
      confidence += 0.1; // Both origin and destination
    } else if (entities.origin || entities.destination) {
      confidence += 0.05; // At least one location
    }
  }

  if (intentType === 'weather_check') {
    if (entities.origin) {
      confidence += 0.1; // Location specified
    }
  }

  if (intentType === 'station_search') {
    if (entities.origin) {
      confidence += 0.1; // Station specified
    }
  }

  // Boost confidence if date/time is specified
  if (entities.date || entities.time) {
    confidence += 0.05;
  }

  // Boost confidence for multiple keyword matches
  if (matchedKeywords.length >= 3) {
    confidence += 0.05;
  }

  // Cap confidence at 0.95
  return Math.min(0.95, Math.max(0.3, confidence));
}
