/**
 * Multilingual Entity Extraction Patterns
 *
 * Patterns and utilities for extracting entities (origin, destination, location, date, time)
 * from user messages in English (EN), German (DE), French (FR), and Italian (IT).
 */

import type { Language } from './intentKeywords';

export interface EntityPrepositions {
  origin: Record<Language, string[]>;
  destination: Record<Language, string[]>;
  location: Record<Language, string[]>;
  time: Record<Language, string[]>;
}

/**
 * Prepositions used to identify different entity types across languages
 */
export const ENTITY_PREPOSITIONS: EntityPrepositions = {
  origin: {
    en: [
      'from',
      'starting from',
      'leaving from',
      'departing from',
      'departure from',
    ],
    de: ['von', 'ab', 'ausgehend von', 'abfahrt von', 'abfahrt ab'],
    fr: ['de', 'depuis', 'en partant de', 'départ de', 'au départ de'],
    it: ['da', 'partendo da', 'in partenza da', 'partenza da'],
  },
  destination: {
    en: [
      'to',
      'going to',
      'heading to',
      'arriving at',
      'arriving in',
      'arrival at',
    ],
    de: ['nach', 'bis', 'richtung', 'ankunft in', 'ankunft', 'bis nach'],
    fr: ['à', 'pour', 'vers', 'direction', 'arrivée à', 'arrivée'],
    it: ['a', 'per', 'verso', 'direzione', 'arrivo a', 'arrivo'],
  },
  location: {
    en: ['in', 'at', 'near'],
    de: ['in', 'bei', 'nahe'],
    fr: ['à', 'dans', 'près de'],
    it: ['a', 'in', 'vicino a', 'presso'],
  },
  time: {
    en: ['at', 'around'],
    de: ['um', 'gegen'],
    fr: ['à', 'vers'],
    it: ['alle', 'verso', 'circa'],
  },
};

/**
 * Stop words used to terminate entity extraction
 * These words indicate the end of an entity name
 */
export const STOP_WORDS = [
  // Time indicators
  'at',
  'um',
  'à',
  'alle',
  'verso',
  // Prepositions
  'to',
  'nach',
  'bis',
  'pour',
  'a',
  'per',
  'from',
  'von',
  'ab',
  'de',
  'depuis',
  'da',
  'via',
  'in',
  'on',
  // Date words
  'tomorrow',
  'morgen',
  'demain',
  'domani',
  'today',
  'heute',
  "aujourd'hui",
  'oggi',
  'yesterday',
  'gestern',
  'hier',
  'ieri',
  // Weekend expressions
  'weekend',
  'wochenende',
  'week-end',
  'fine settimana',
  'this',
  'next',
  'dieses',
  'nächste',
  'ce',
  'questo',
  // Other
  'with',
  'and',
  'et',
  'e',
  'und',
];

/**
 * Date patterns for different languages
 */
export const DATE_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    // Match most specific patterns first
    /\b(next|this)\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/i,
    /\b(this\s+weekend|weekend)\b/i,
    /\b(today|tomorrow|yesterday)\b/i,
    /\b(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)\b/,
    // Match single day names last (least specific)
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  ],
  de: [
    // Match most specific patterns first
    /\b(nächste|nächster|diese|dieser)\s+(woche|monat|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i,
    /\b(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{1,2}\b/i,
    /\b(dieses\s+wochenende|wochenende)\b/i,
    /\b(heute|morgen|gestern|übermorgen)\b/i,
    /\b(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)\b/,
    // Match single day names last (least specific)
    /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i,
  ],
  fr: [
    // Match most specific patterns first
    /\b(prochain|prochaine|ce|cette)\s+(semaine|mois|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i,
    /\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2}\b/i,
    /\b(ce\s+week-end|week-end)\b/i,
    /\b(aujourd'hui|demain|hier|après-demain)\b/i,
    /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/,
    // Match single day names last (least specific)
    /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i,
  ],
  it: [
    // Match most specific patterns first
    /\b(prossimo|prossima|questo|questa)\s+(settimana|mese|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\b/i,
    /\b(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{1,2}\b/i,
    /\b(questo\s+fine\s+settimana|fine\s+settimana)\b/i,
    /\b(oggi|domani|ieri|dopodomani)\b/i,
    /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/,
    // Match single day names last (least specific)
    /\b(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\b/i,
  ],
};

/**
 * Time patterns for different languages
 * IMPORTANT: Patterns are ordered from most specific to least specific
 * to ensure proper matching (e.g., "2:30 pm" before "2:30")
 */
export const TIME_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    // Match 12h format FIRST (most specific)
    /\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,  // "at 2:30 pm"
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,       // "2:30 pm" without "at"
    // Then 24h format
    /\b(\d{1,2}:\d{2})\b/,  // "14:30"
    // Finally relative times
    /\b(morning|afternoon|evening|night)\b/i,
  ],
  de: [
    /\bum\s+(\d{1,2}(?::\d{2})?)\s*uhr\b/i,  // "um 14:30 Uhr"
    /\b(\d{1,2}:\d{2})\b/,
    /\b(morgens|vormittags|mittags|nachmittags|abends|nachts)\b/i,
  ],
  fr: [
    /\bà\s+(\d{1,2}(?:[h:]\d{2})?)\b/i,  // "à 14h30"
    /\b(\d{1,2})[h:](\d{2})?\b/,
    /\b(matin|après-midi|soir|nuit)\b/i,
  ],
  it: [
    /\balle\s+(\d{1,2}(?::\d{2})?)\b/i,  // "alle 14:30"
    /\b(\d{1,2}:\d{2})\b/,
    /\b(mattina|pomeriggio|sera|notte)\b/i,
  ],
};

/**
 * Build a regex pattern for extracting entities based on prepositions
 *
 * @param entityType - Type of entity to extract (origin, destination, location, time)
 * @param languages - Languages to include in the pattern
 * @returns RegExp for matching the entity
 */
export function buildEntityRegex(
  entityType: keyof EntityPrepositions,
  languages: Language[]
): RegExp {
  const prepositions = languages.flatMap(
    (lang) => ENTITY_PREPOSITIONS[entityType][lang]
  );

  // Sort by length (longest first) to match longer phrases first
  prepositions.sort((a, b) => b.length - a.length);

  // Escape special regex characters
  const escapedPrepositions = prepositions.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  // Build pattern supporting accented characters
  // JavaScript's \b doesn't work with accented characters (à, è, ü, etc.)
  // Use (?:^|\s) for word boundary with accented chars, \b for ASCII-only
  const pattern = `(?:^|\\s)(${escapedPrepositions.join(
    '|'
  )})\\s+(.+?)(?=(?:^|\\s)(?:${STOP_WORDS.join('|')})(?:\\s|$)|$|[?!])`;

  return new RegExp(pattern, 'i');
}

/**
 * Extract date from message using language-specific patterns
 *
 * @param message - User message
 * @param languages - Detected languages
 * @returns Extracted date string or undefined
 */
export function extractDate(
  message: string,
  languages: Language[]
): string | undefined {
  for (const lang of languages) {
    const patterns = DATE_PATTERNS[lang];
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        // Return full match to preserve modifiers like "next" or "this"
        // e.g., "next Monday" instead of just "Monday"
        return match[0];
      }
    }
  }
  return undefined;
}

/**
 * Extract time from message using language-specific patterns
 *
 * @param message - User message
 * @param languages - Detected languages
 * @returns Extracted time string or undefined
 */
export function extractTime(
  message: string,
  languages: Language[]
): string | undefined {
  for (const lang of languages) {
    const patterns = TIME_PATTERNS[lang];
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }
  }
  return undefined;
}
