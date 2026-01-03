import { createModel } from '../chatModes/modelFactory';
import type { Language } from '@/lib/i18n';

/**
 * Detects the primary language of a user message using Gemini LLM
 *
 * @param message - The user's message to analyze
 * @param uiLanguage - The current UI language setting (used as fallback)
 * @returns The detected language code (en, de, fr, it, zh, hi)
 *
 * @example
 * const lang = await detectMessageLanguage("从日内瓦到卢加诺", "en");
 * // Returns: "zh"
 */
export async function detectMessageLanguage(
  message: string,
  uiLanguage: Language
): Promise<Language> {
  // Skip detection for very short messages (< 10 chars)
  // Short messages like "Hi", "Ok" are ambiguous
  if (message.trim().length < 10) {
    console.log(
      '[LanguageDetection] Message too short, using UI language:',
      uiLanguage
    );
    return uiLanguage;
  }

  const prompt = `Detect the primary language of this message. 
Respond with ONLY the ISO 639-1 language code from this list: en, de, fr, it, zh, hi
If the message is mixed language or uncertain, respond with: ${uiLanguage}
Do not include any explanation, just the 2-letter code.

Message: "${message}"`;

  try {
    const model = createModel(false); // No function calling needed
    const result = await model.generateContent(prompt);
    const detected = result.response.text().trim().toLowerCase();

    const supported: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

    if (supported.includes(detected as Language)) {
      console.log(
        `[LanguageDetection] Detected: ${detected} (UI: ${uiLanguage})`
      );
      return detected as Language;
    } else {
      console.warn(
        `[LanguageDetection] Invalid response: ${detected}, using UI language`
      );
    }
  } catch (error) {
    console.error('[LanguageDetection] Detection failed:', error);
  }

  // Fallback to UI language on any error
  return uiLanguage;
}
