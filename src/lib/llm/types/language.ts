/**
 * Language types and utilities for LLM chat modes
 */

import type { Language } from '@/lib/i18n';

/**
 * Map of language codes to their full names for LLM prompts
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  it: 'Italian',
  zh: 'Simplified Chinese',
  hi: 'Hindi',
} as const;

/**
 * Get the full language name for a language code
 * @param language - Language code (e.g., 'en', 'de', 'zh')
 * @returns Full language name (e.g., 'English', 'German', 'Simplified Chinese')
 */
export function getLanguageName(language: string): string {
  return LANGUAGE_NAMES[language as Language] || LANGUAGE_NAMES.en;
}

/**
 * Check if a language code is valid
 * @param language - Language code to check
 * @returns True if the language is supported
 */
export function isValidLanguage(language: string): language is Language {
  return language in LANGUAGE_NAMES;
}

/**
 * Get all supported language codes
 * @returns Array of language codes
 */
export function getSupportedLanguages(): Language[] {
  return Object.keys(LANGUAGE_NAMES) as Language[];
}
