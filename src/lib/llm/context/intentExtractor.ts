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
 * Extract ALL intents from user message (multi-intent support)
 *
 * @param message - User message to analyze
 * @param userLanguage - User's selected language preference (optional)
 * @param threshold - Minimum confidence threshold for including an intent (default: 0.5)
 * @returns Array of detected intents sorted by confidence (highest first)
 */
export async function extractIntents(
  message: string,
  userLanguage?: Language,
  threshold: number = 0.5
): Promise<Intent[]> {
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
  console.log('[intentExtractor:multi] Extracting intents from:', message);
  console.log(
    '[intentExtractor:multi] User language:',
    userLanguage || 'not specified'
  );

  // Detect language(s) in the message
  const detectedLanguages = detectMessageLanguage(message, userLanguage);
  console.log('[intentExtractor:multi] Detected languages:', detectedLanguages);

  // Get keywords for detected languages
  const tripKeywords = getAllKeywords('trip_planning', detectedLanguages);
  const snowKeywords = getAllKeywords('snow_conditions', detectedLanguages);
  const weatherKeywords = getAllKeywords('weather_check', detectedLanguages);
  const stationKeywords = getAllKeywords('station_search', detectedLanguages);
  const formationKeywords = getAllKeywords(
    'train_formation',
    detectedLanguages
  );

  // Calculate scores for ALL intent types
  const intentScores: Array<{
    type: Intent['type'];
    confidence: number;
    matchedKeywords: string[];
  }> = [];

  // Station search
  if (hasKeyword(stationKeywords, lowerMessage)) {
    const count = countMatchedKeywords(stationKeywords, lowerMessage);
    const matched = stationKeywords.filter((k) =>
      hasKeyword([k], lowerMessage)
    );
    intentScores.push({
      type: 'station_search',
      confidence: calculateBaseConfidence(count),
      matchedKeywords: matched,
    });
  }

  // Train formation
  if (hasKeyword(formationKeywords, lowerMessage)) {
    const count = countMatchedKeywords(formationKeywords, lowerMessage);
    const matched = formationKeywords.filter((k) =>
      hasKeyword([k], lowerMessage)
    );
    intentScores.push({
      type: 'train_formation',
      confidence: calculateBaseConfidence(count),
      matchedKeywords: matched,
    });
  }

  // Snow conditions (check before weather to prevent misclassification)
  if (hasKeyword(snowKeywords, lowerMessage)) {
    const count = countMatchedKeywords(snowKeywords, lowerMessage);
    const matched = snowKeywords.filter((k) => hasKeyword([k], lowerMessage));
    intentScores.push({
      type: 'snow_conditions',
      confidence: calculateBaseConfidence(count),
      matchedKeywords: matched,
    });
  }

  // Weather check
  if (hasKeyword(weatherKeywords, lowerMessage)) {
    const count = countMatchedKeywords(weatherKeywords, lowerMessage);
    const matched = weatherKeywords.filter((k) =>
      hasKeyword([k], lowerMessage)
    );
    intentScores.push({
      type: 'weather_check',
      confidence: calculateBaseConfidence(count),
      matchedKeywords: matched,
    });
  }

  // Trip planning
  if (hasKeyword(tripKeywords, lowerMessage)) {
    const count = countMatchedKeywords(tripKeywords, lowerMessage);
    const matched = tripKeywords.filter((k) => hasKeyword([k], lowerMessage));
    intentScores.push({
      type: 'trip_planning',
      confidence: calculateBaseConfidence(count),
      matchedKeywords: matched,
    });
  }

  // Check for implicit trip planning pattern (e.g., "Zurich to Bern")
  const implicitTripPattern =
    /\b\w+\s+(?:to|nach|bis|à|pour|vers|a|per)\s+\w+/i;
  if (implicitTripPattern.test(lowerMessage)) {
    // Only add if not already detected
    const hasTripIntent = intentScores.some((s) => s.type === 'trip_planning');
    if (!hasTripIntent) {
      intentScores.push({
        type: 'trip_planning',
        confidence: 0.7, // Higher confidence than before since it's a clear pattern
        matchedKeywords: ['implicit_trip_pattern'],
      });
    } else {
      // Boost existing trip_planning confidence if we have implicit pattern
      const tripScore = intentScores.find((s) => s.type === 'trip_planning');
      if (tripScore) {
        tripScore.confidence = Math.min(0.95, tripScore.confidence + 0.05);
      }
    }
  }

  // Filter by threshold and sort by confidence (highest first)
  const filteredIntents = intentScores.filter((s) => s.confidence >= threshold);

  // If no intents pass threshold, return general_info
  if (filteredIntents.length === 0) {
    console.log('[intentExtractor:multi] No intents above threshold, defaulting to general_info');
    const entities = extractEntities(lowerMessage, detectedLanguages, 'general_info');
    return [
      {
        type: 'general_info',
        confidence: 0.5,
        extractedEntities: entities,
        timestamp: new Date(),
        detectedLanguages,
        matchedKeywords: [],
        translatedFrom,
      },
    ];
  }

  // Sort by confidence (highest first)
  filteredIntents.sort((a, b) => b.confidence - a.confidence);

  console.log(
    `[intentExtractor:multi] Found ${filteredIntents.length} intent(s):`,
    filteredIntents.map((i) => `${i.type} (${(i.confidence * 100).toFixed(0)}%)`)
  );

  // Build Intent objects with entities for each detected intent
  const intents: Intent[] = filteredIntents.map((intentScore) => {
    const extractedEntities = extractEntities(
      lowerMessage,
      detectedLanguages,
      intentScore.type
    );

    // Refine confidence based on extracted entities
    const refinedConfidence = refineConfidence(
      intentScore.type,
      intentScore.confidence,
      extractedEntities,
      intentScore.matchedKeywords
    );

    return {
      type: intentScore.type,
      confidence: refinedConfidence,
      extractedEntities,
      timestamp: new Date(),
      detectedLanguages,
      matchedKeywords: intentScore.matchedKeywords.slice(0, 5),
      translatedFrom,
    };
  });

  return intents;
}

/**
 * Extract intent from user message (single intent - backward compatible)
 *
 * @param message - User message to analyze
 * @param userLanguage - User's selected language preference (optional)
 * @returns Detected intent with confidence score and extracted entities
 */
export async function extractIntent(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  // Use multi-intent extraction and return the highest-confidence intent
  const intents = await extractIntents(message, userLanguage, 0.0);
  return intents[0]; // Return highest confidence intent
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

  // Helper function to capitalize location names
  const capitalizeLocation = (text: string): string => {
    return text
      .split(/(\s+|-|'|')/g) // Split on spaces, hyphens, and apostrophes
      .map((word) => {
        // Don't capitalize separators
        if (/^(\s+|-|'|')$/.test(word)) return word;

        // Capitalize first letter of each word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  // For weather/snow queries, prioritize location match over destination
  // (FR "à" and IT "a" appear in both destination and location prepositions)
  // Also, for snow conditions, "de neige" (of snow) should not be treated as origin
  // Note: Using [2] because buildEntityRegex now captures preposition in [1] and entity in [2]
  if (
    (intentType === 'weather_check' || intentType === 'snow_conditions') &&
    inMatch
  ) {
    // Use location match for weather/snow queries
    entities.origin = capitalizeLocation(inMatch[2].replace(/\*\*|_|#/g, '').trim());
  } else if (
    intentType === 'station_search' &&
    inMatch &&
    !fromMatch &&
    !toMatch
  ) {
    // For station queries, only use location if no destination match
    entities.origin = capitalizeLocation(inMatch[2].replace(/\*\*|_|#/g, '').trim());
  } else {
    // Standard extraction for trip planning
    if (fromMatch) {
      entities.origin = capitalizeLocation(fromMatch[2].replace(/\*\*|_|#/g, '').trim());
    }
    if (toMatch) {
      entities.destination = capitalizeLocation(toMatch[2].replace(/\*\*|_|#/g, '').trim());
    }
  }

  // Implicit "X to Y" pattern (e.g., "Zurich to Bern", "Geneva to Lausanne at 14:30")
  // Only use if explicit 'from' is missing but 'to' is present
  // AND the intent is trip_planning (to avoid overwriting weather/snow locations where prepositions overlap)
  // Note: We don't check inMatch here because "at" can be captured as a location preposition
  if (intentType === 'trip_planning' && !fromMatch && toMatch) {
    const simplePattern = buildSimpleToPattern(languages);
    const simpleMatch = message.match(simplePattern);

    if (simpleMatch && simpleMatch[1].length < 30) {
      entities.origin = capitalizeLocation(simpleMatch[1].replace(/\*\*|_|#/g, '').trim());
      if (!entities.destination) {
        entities.destination = capitalizeLocation(simpleMatch[2].replace(/\*\*|_|#/g, '').trim());
      }
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

  // Capture origin and destination, stopping at time/date indicators
  // Improved to handle "X to Y at TIME" correctly
  // The destination captures one or more words until we hit a time/date indicator
  const pattern = `^(.+?)\\s+(?:${escapedPreps.join(
    '|'
  )})\\s+(.+?)(?=\\s+(?:at|um|à|alle|via|on|tomorrow|today|morgen|demain|next|this|\\d)|$)`;
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
