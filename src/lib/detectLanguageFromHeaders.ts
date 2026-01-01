import type { Language } from './i18n';

/**
 * Supported languages in the application
 */
const SUPPORTED_LANGUAGES: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

/**
 * Default language fallback
 */
const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Parses a single language tag and extracts the base language code
 * @param tag - Language tag (e.g., 'en-US', 'de', 'fr-FR')
 * @returns Base language code (e.g., 'en', 'de', 'fr') or null if invalid
 */
function parseLanguageTag(tag: string): string | null {
  const trimmed = tag.trim();
  if (!trimmed) return null;
  
  // Extract the primary language subtag (before the first hyphen)
  const parts = trimmed.split('-');
  return parts[0].toLowerCase();
}

/**
 * Parses the Accept-Language header and returns an array of language preferences
 * sorted by quality value (q-value) in descending order
 * 
 * @param acceptLanguageHeader - The Accept-Language header value
 * @returns Array of language codes sorted by preference
 * 
 * @example
 * parseAcceptLanguage('en-US,en;q=0.9,de;q=0.8')
 * // Returns: ['en', 'de']
 * 
 * parseAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8')
 * // Returns: ['fr', 'en']
 */
function parseAcceptLanguage(acceptLanguageHeader: string): string[] {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') {
    return [];
  }

  // Parse language tags with their quality values
  const languagePreferences: Array<{ lang: string; quality: number }> = [];

  const parts = acceptLanguageHeader.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Split by semicolon to separate language tag from quality value
    const [langTag, qValue] = trimmed.split(';');
    
    const lang = parseLanguageTag(langTag);
    if (!lang) continue;

    // Parse quality value (default is 1.0 if not specified)
    let quality = 1.0;
    if (qValue) {
      // Match q-values including negative numbers (which we'll reject)
      const qMatch = qValue.match(/q=([-0-9.]+)/);
      if (qMatch && qMatch[1]) {
        const parsed = parseFloat(qMatch[1]);
        // Reject invalid q-values (must be between 0 and 1)
        if (isNaN(parsed) || parsed < 0 || parsed > 1) {
          continue; // Skip this language preference
        }
        quality = parsed;
      }
    }

    languagePreferences.push({ lang, quality });
  }

  // Sort by quality value (descending) and remove duplicates
  const sorted = languagePreferences
    .sort((a, b) => b.quality - a.quality)
    .map(pref => pref.lang);

  // Remove duplicates while preserving order
  return Array.from(new Set(sorted));
}

/**
 * Detects the user's preferred language from the Accept-Language HTTP header
 * 
 * This function parses the Accept-Language header, respects quality values (q-values),
 * and returns the best matching supported language.
 * 
 * @param acceptLanguageHeader - The Accept-Language header value from the HTTP request
 * @returns The best matching supported language, or 'en' as fallback
 * 
 * @example
 * // Single language
 * detectLanguageFromHeaders('de-DE')
 * // Returns: 'de'
 * 
 * @example
 * // Multiple languages with quality values
 * detectLanguageFromHeaders('fr-FR,fr;q=0.9,en;q=0.8')
 * // Returns: 'fr'
 * 
 * @example
 * // Unsupported language with fallback
 * detectLanguageFromHeaders('ja-JP,en;q=0.8')
 * // Returns: 'en'
 * 
 * @example
 * // Missing or invalid header
 * detectLanguageFromHeaders(undefined)
 * // Returns: 'en'
 */
export function detectLanguageFromHeaders(
  acceptLanguageHeader: string | null | undefined
): Language {
  if (!acceptLanguageHeader) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const preferences = parseAcceptLanguage(acceptLanguageHeader);
    
    // Find the first preference that matches a supported language
    for (const lang of preferences) {
      if (SUPPORTED_LANGUAGES.includes(lang as Language)) {
        return lang as Language;
      }
    }
  } catch (error) {
    console.error('Error parsing Accept-Language header:', error);
  }

  return DEFAULT_LANGUAGE;
}
