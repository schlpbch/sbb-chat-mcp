import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { it } from './it';
import { zh } from './zh';
import { hi } from './hi';
import type { Translation } from './en';

// Re-export the translations object (identical API to current implementation)
export const translations = {
  en,
  de,
  fr,
  it,
  zh,
  hi,
} as const;

// Derive Language type from translations keys (identical to current)
export type Language = keyof typeof translations;

// Derive TranslationKey type from English keys (identical to current)
export type TranslationKey = keyof typeof en;

// Re-export Translation type for advanced use cases
export type { Translation };
