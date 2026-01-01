import { useState, useCallback } from 'react';
import type { Language } from '@/lib/i18n';

// Extend Window interface to include server-provided language
declare global {
  interface Window {
    __INITIAL_LANGUAGE__?: Language;
  }
}

/**
 * Detects the user's preferred language from localStorage or browser settings
 * @returns The detected language code
 */
function detectLanguage(): Language {
  // Try localStorage first (user preference - highest priority)
  if (typeof window !== 'undefined') {
    try {
      const savedSettings = localStorage.getItem('sbb-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.language) {
          return settings.language as Language;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }

    // Check for server-detected language (from HTTP Accept-Language header)
    if (window.__INITIAL_LANGUAGE__) {
      const serverLanguage = window.__INITIAL_LANGUAGE__;
      const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
      if (supportedLanguages.includes(serverLanguage)) {
        return serverLanguage;
      }
    }

    // Fall back to browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
    if (supportedLanguages.includes(browserLang as Language)) {
      return browserLang as Language;
    }
  }

  // Default to English
  return 'en';
}

/**
 * Persists the language preference to localStorage
 * @param language - The language code to persist
 */
function persistLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    try {
      const savedSettings = localStorage.getItem('sbb-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.language = language;
      localStorage.setItem('sbb-settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist language setting:', e);
    }
  }
}

/**
 * Custom hook for managing language state with automatic detection and persistence
 * 
 * Features:
 * - Detects language from localStorage (user preference) on mount
 * - Falls back to browser language if no saved preference
 * - Defaults to English if browser language not supported
 * - Automatically persists language changes to localStorage
 * 
 * @returns A tuple of [language, setLanguage] matching the useState API
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [language, setLanguage] = useLanguage();
 *   
 *   return (
 *     <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
 *       <option value="en">English</option>
 *       <option value="de">Deutsch</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useLanguage(): [Language, (lang: Language) => void] {
  // Use lazy initialization to detect language only once on mount
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  // Persist to localStorage on change
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
  }, []);

  return [language, setLanguage];
}
