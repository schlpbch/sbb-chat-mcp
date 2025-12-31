/**
 * Translation Service
 *
 * Provides translation capabilities for Chinese (ZH) and Hindi (HI) queries.
 * Translates non-European language queries to English before intent extraction
 * to leverage existing robust EN keyword dictionaries and entity patterns.
 */

import { v2 } from '@google-cloud/translate';

const { Translate } = v2;

// Initialize Google Cloud Translate client
let translateClient: InstanceType<typeof Translate> | null = null;

function getTranslateClient(): InstanceType<typeof Translate> | null {
  if (!translateClient && process.env.GOOGLE_CLOUD_KEY) {
    translateClient = new Translate({
      key: process.env.GOOGLE_CLOUD_KEY,
    });
  }
  return translateClient;
}

/**
 * Reset the translate client (for testing only)
 * @internal
 */
export function resetTranslateClient(): void {
  translateClient = null;
}

/**
 * Translate text from Chinese or Hindi to English
 *
 * @param text - The text to translate
 * @param sourceLanguage - The source language ('zh' or 'hi')
 * @returns Translated text in English, or original text if translation fails
 */
export async function translateToEnglish(
  text: string,
  sourceLanguage: 'zh' | 'hi'
): Promise<string> {
  const client = getTranslateClient();

  // If no API key configured, return original text
  if (!client) {
    console.warn(
      '[Translation] Google Cloud API key not configured, skipping translation'
    );
    return text;
  }

  try {
    const [translation] = await client.translate(text, {
      from: sourceLanguage,
      to: 'en',
    });

    console.log(`[Translation] ${sourceLanguage} → en:`, {
      original: text,
      translated: translation,
    });

    return translation;
  } catch (error) {
    console.error('[Translation] Error translating text:', error);
    // Fallback: return original text
    return text;
  }
}

/**
 * Check if a language requires translation before intent extraction
 *
 * @param language - The language code
 * @returns True if the language should be translated to EN first
 */
export function requiresTranslation(
  language?: string
): language is 'zh' | 'hi' {
  return language === 'zh' || language === 'hi';
}
