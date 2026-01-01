/**
 * Unit tests for useLanguage hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguage } from '../useLanguage';
import type { Language } from '@/lib/i18n';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      configurable: true,
      value: 'en-US',
    });
  });

  describe('Initialization', () => {
    it('should initialize with browser language when no saved preference', () => {
      Object.defineProperty(window.navigator, 'language', {
        value: 'de-DE',
      });

      const { result } = renderHook(() => useLanguage());
      const [language] = result.current;

      expect(language).toBe('de');
    });

    it('should default to "en" when browser language is unsupported', () => {
      Object.defineProperty(window.navigator, 'language', {
        value: 'ja-JP',
      });

      const { result } = renderHook(() => useLanguage());
      const [language] = result.current;

      expect(language).toBe('en');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('sbb-settings', 'invalid-json');

      const { result } = renderHook(() => useLanguage());
      const [language] = result.current;

      expect(language).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('should update language state', () => {
      const { result } = renderHook(() => useLanguage());

      act(() => {
        const [, setLanguage] = result.current;
        setLanguage('de');
      });

      const [language] = result.current;
      expect(language).toBe('de');
    });

    it('should work with all supported languages', () => {
      const { result } = renderHook(() => useLanguage());
      const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      supportedLanguages.forEach((lang) => {
        act(() => {
          const [, setLanguage] = result.current;
          setLanguage(lang);
        });

        const [language] = result.current;
        expect(language).toBe(lang);
      });
    });
  });

  describe('Language Detection', () => {
    it('should extract language code from browser locale', () => {
      const testCases: Array<{ locale: string; expected: Language }> = [
        { locale: 'en-US', expected: 'en' },
        { locale: 'de-DE', expected: 'de' },
        { locale: 'fr-FR', expected: 'fr' },
        { locale: 'it-IT', expected: 'it' },
        { locale: 'zh-CN', expected: 'zh' },
        { locale: 'hi-IN', expected: 'hi' },
      ];

      testCases.forEach(({ locale, expected }) => {
        localStorage.clear();
        Object.defineProperty(window.navigator, 'language', {
          value: locale,
        });

        const { result } = renderHook(() => useLanguage());
        const [language] = result.current;
        expect(language).toBe(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage', () => {
      localStorage.clear();

      const { result } = renderHook(() => useLanguage());
      const [language] = result.current;

      expect(language).toBeDefined();
      expect(['en', 'de', 'fr', 'it', 'zh', 'hi']).toContain(language);
    });
  });
});

