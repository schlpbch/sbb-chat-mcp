/**
 * Language Detection Utilities
 *
 * Utilities for detecting the language(s) used in user messages
 * and normalizing text for matching.
 */

import type { Language } from './intentKeywords';

/**
 * Language indicators - patterns that strongly suggest a specific language
 */
const LANGUAGE_INDICATORS: Record<Language, RegExp> = {
  de: /\b(zug|züge|bahn|nach|von|morgen|heute|zürich|genf|wetter|bahnhof|abfahrt|ankunft)\b/i,
  fr: /\b(train|depuis|demain|aujourd'hui|gare|genève|lausanne|météo|départ|arrivée)\b/i,
  it: /\b(treno|treni|viaggio|oggi|domani|stazione|zurigo|ginevra|meteo|partenza|arrivo)\b/i,
  en: /\b(train|trains|from|tomorrow|today|station|zurich|geneva|weather|departure|arrival)\b/i,
};

/**
 * Detect which language(s) are used in a message
 *
 * Uses both the user's selected language preference and content analysis
 * to determine the most likely language(s) in the message.
 *
 * @param message - User message to analyze
 * @param userLanguage - User's selected language preference (optional)
 * @returns Array of detected languages, prioritizing user's selection
 */
export function detectMessageLanguage(
  message: string,
  userLanguage?: Language
): Language[] {
  const detectedLanguages: Language[] = [];

  // First, check for language indicators in the message
  for (const [lang, pattern] of Object.entries(LANGUAGE_INDICATORS)) {
    if (pattern.test(message)) {
      detectedLanguages.push(lang as Language);
    }
  }

  // If user has a language preference, prioritize it
  if (userLanguage) {
    // If the user's language was detected in the message, move it to the front
    const userLangIndex = detectedLanguages.indexOf(userLanguage);
    if (userLangIndex > 0) {
      // Move user's language to the front
      detectedLanguages.splice(userLangIndex, 1);
      detectedLanguages.unshift(userLanguage);
    } else if (userLangIndex === -1 && detectedLanguages.length === 0) {
      // No languages detected, use user's preference
      detectedLanguages.push(userLanguage);
    } else if (userLangIndex === -1 && detectedLanguages.length > 0) {
      // Languages detected but not user's preference
      // Add user's language as secondary option (might be mixed language input)
      detectedLanguages.push(userLanguage);
    }
    // If userLangIndex === 0, it's already at the front, no action needed
  }

  // Fallback to English if nothing detected and no user preference
  return detectedLanguages.length > 0 ? detectedLanguages : ['en'];
}

/**
 * Normalize text for matching by removing diacritics and converting to lowercase
 *
 * This helps with fuzzy matching where users might not type accents correctly,
 * e.g., "Zurich" vs "Zürich", "Geneve" vs "Genève"
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/ü/g, 'u') // German umlauts
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/ß/g, 'ss'); // German sharp s
}

/**
 * Check if text contains any of the given keywords with word boundaries
 * Supports both single words and multi-word phrases
 *
 * @param keywords - Array of keywords to check
 * @param text - Text to search in
 * @param useNormalization - Whether to normalize text before matching
 * @returns True if any keyword is found
 */
export function hasKeyword(
  keywords: string[],
  text: string,
  useNormalization = false
): boolean {
  const searchText = useNormalization
    ? normalizeForMatching(text)
    : text.toLowerCase();

  return keywords.some((keyword) => {
    const normalizedKeyword = useNormalization
      ? normalizeForMatching(keyword)
      : keyword.toLowerCase();

    // For multi-word keywords like "get to", use simple includes
    if (normalizedKeyword.includes(' ')) {
      return searchText.includes(normalizedKeyword);
    }

    // For single words, use word boundary at start only to match plurals
    // (e.g., "station" matches "stations", but "rain" doesn't match "trains")
    const regex = new RegExp(
      `\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i'
    );
    return regex.test(searchText);
  });
}

/**
 * Count how many keywords from a list are present in the text
 * Useful for confidence scoring
 *
 * @param keywords - Array of keywords to check
 * @param text - Text to search in
 * @returns Number of matched keywords
 */
export function countMatchedKeywords(keywords: string[], text: string): number {
  const lowerText = text.toLowerCase();
  let count = 0;

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();

    if (lowerKeyword.includes(' ')) {
      if (lowerText.includes(lowerKeyword)) {
        count++;
      }
    } else {
      const regex = new RegExp(
        `\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'i'
      );
      if (regex.test(lowerText)) {
        count++;
      }
    }
  }

  return count;
}
