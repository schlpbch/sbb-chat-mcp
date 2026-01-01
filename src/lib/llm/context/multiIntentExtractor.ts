/**
 * Multi-Intent Extractor
 * 
 * Handles queries with multiple intents by segmenting them and extracting
 * intent from each segment independently.
 * 
 * Example: "Show trains from Zurich to Bern and the weather in Bern"
 *   → ["Show trains from Zurich to Bern", "the weather in Bern"]
 *   → [trip_planning, weather_check]
 */

import type { Language } from './intentKeywords';
import type { Intent } from './types';
import { extractIntent } from './intentExtractor';

/**
 * Represents a segment of a query
 */
export interface QuerySegment {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Conjunction words that typically separate intents
 */
const CONJUNCTIONS: Record<Language, string[]> = {
  en: ['and', 'also', 'then', 'plus', 'additionally'],
  de: ['und', 'auch', 'dann', 'außerdem', 'zusätzlich'],
  fr: ['et', 'aussi', 'puis', 'également', 'en plus'],
  it: ['e', 'anche', 'poi', 'inoltre', 'in più'],
  zh: ['\u548c', '\u4e5f', '\u7136\u540e', '\u8fd8\u6709', '\u53e6\u5916'],  // and, also, then, also have, additionally
  hi: ['\u0914\u0930', '\u092d\u0940', '\u092b\u093f\u0930', '\u0938\u093e\u0925', '\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924'],  // and, also, then, with, additionally
};

/**
 * Place names that contain conjunctions (to avoid false splits)
 */
const PROTECTED_PHRASES = [
  'st. gallen',
  'st gallen',
  'saint gallen',
  'baden-baden',
  // Add more as needed
];

/**
 * Segment a query into logical parts based on punctuation and conjunctions
 * 
 * @param message - User message to segment
 * @param language - Detected or user language
 * @returns Array of query segments
 */
export function segmentQuery(
  message: string,
  language: Language = 'en'
): QuerySegment[] {
  const lowerMessage = message.toLowerCase();
  
  // Check if message contains protected phrases
  const protectedRanges: Array<{ start: number; end: number }> = [];
  for (const phrase of PROTECTED_PHRASES) {
    let index = lowerMessage.indexOf(phrase);
    while (index !== -1) {
      protectedRanges.push({
        start: index,
        end: index + phrase.length,
      });
      index = lowerMessage.indexOf(phrase, index + 1);
    }
  }

  // Helper to check if index is in a protected range
  const isProtected = (index: number): boolean => {
    return protectedRanges.some(
      (range) => index >= range.start && index < range.end
    );
  };

  // Get conjunctions for the language
  const conjunctions = CONJUNCTIONS[language] || CONJUNCTIONS.en;

  // Find all potential split points
  const splitPoints: number[] = [0]; // Start of message

  // Split on punctuation (., ?, !)
  const punctuationRegex = /[.?!]/g;
  let match;
  while ((match = punctuationRegex.exec(message)) !== null) {
    if (!isProtected(match.index)) {
      splitPoints.push(match.index + 1);
    }
  }

  // Split on conjunctions (with word boundaries)
  for (const conjunction of conjunctions) {
    const regex = new RegExp(`\\s+${conjunction}\\s+`, 'gi');
    let conjMatch;
    while ((conjMatch = regex.exec(message)) !== null) {
      const splitIndex = conjMatch.index + conjMatch[0].indexOf(conjunction);
      if (!isProtected(splitIndex)) {
        splitPoints.push(conjMatch.index + conjMatch[0].length);
      }
    }
  }

  // Sort and deduplicate split points
  const uniqueSplitPoints = Array.from(new Set(splitPoints)).sort((a, b) => a - b);

  // Create segments
  const segments: QuerySegment[] = [];
  for (let i = 0; i < uniqueSplitPoints.length; i++) {
    const start = uniqueSplitPoints[i];
    const end = uniqueSplitPoints[i + 1] || message.length;
    const text = message.substring(start, end).trim();

    // Skip empty or very short segments (< 3 words)
    const wordCount = text.split(/\s+/).length;
    if (text.length > 0 && wordCount >= 3) {
      segments.push({
        text,
        startIndex: start,
        endIndex: end,
      });
    }
  }

  // If no valid segments found, return entire message as single segment
  if (segments.length === 0) {
    return [
      {
        text: message.trim(),
        startIndex: 0,
        endIndex: message.length,
      },
    ];
  }

  return segments;
}

/**
 * Remove duplicate or overlapping intents
 * 
 * Rules:
 * - If two intents have the same type, keep the one with higher confidence
 * - If snow_conditions and weather_check both present, keep both (they're complementary)
 * 
 * @param intents - Array of intents to deduplicate
 * @returns Deduplicated intents
 */
export function deduplicateIntents(intents: Intent[]): Intent[] {
  if (intents.length <= 1) return intents;

  const deduped: Intent[] = [];
  const seenTypes = new Set<string>();

  // Sort by confidence (highest first)
  const sorted = [...intents].sort((a, b) => b.confidence - a.confidence);

  for (const intent of sorted) {
    // Special case: weather_check and snow_conditions can coexist
    if (
      (intent.type === 'weather_check' || intent.type === 'snow_conditions') &&
      (seenTypes.has('weather_check') || seenTypes.has('snow_conditions'))
    ) {
      // Allow both if they're different types
      if (!seenTypes.has(intent.type)) {
        deduped.push(intent);
        seenTypes.add(intent.type);
      }
      continue;
    }

    // For other types, only keep first occurrence (highest confidence)
    if (!seenTypes.has(intent.type)) {
      deduped.push(intent);
      seenTypes.add(intent.type);
    }
  }

  // Restore original order (by priority)
  return deduped.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

/**
 * Extract multiple intents from a query using segmentation
 * 
 * @param message - User message
 * @param userLanguage - User's preferred language
 * @returns Array of intents (sorted by priority)
 */
export async function extractMultipleIntents(
  message: string,
  userLanguage?: Language
): Promise<Intent[]> {
  // Segment the query
  const segments = segmentQuery(message, userLanguage);

  console.log('[multiIntentExtractor] Segments:', segments.length);
  segments.forEach((seg, idx) => {
    console.log(`  [${idx + 1}] "${seg.text}"`);
  });

  // If only one segment, use single-intent extraction
  if (segments.length === 1) {
    const intent = await extractIntent(message, userLanguage);
    return [{ ...intent, priority: 1, segment: message }];
  }

  // Extract intent from each segment
  const intents = await Promise.all(
    segments.map(async (segment, index) => {
      const intent = await extractIntent(segment.text, userLanguage);
      return {
        ...intent,
        priority: index + 1,
        segment: segment.text,
      };
    })
  );

  // Filter out low-confidence intents (< 0.5)
  const highConfidenceIntents = intents.filter(
    (intent) => intent.confidence >= 0.5
  );

  // Deduplicate
  const deduplicated = deduplicateIntents(highConfidenceIntents);

  console.log('[multiIntentExtractor] Extracted intents:', deduplicated.length);
  deduplicated.forEach((intent) => {
    console.log(
      `  [${intent.priority}] ${intent.type} (${(intent.confidence * 100).toFixed(0)}%)`
    );
  });

  return deduplicated;
}
