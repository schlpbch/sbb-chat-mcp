/**
 * Unit tests for detectLanguageFromHeaders utility
 */

import { describe, it, expect } from 'vitest';
import { detectLanguageFromHeaders } from '../detectLanguageFromHeaders';
import type { Language } from '../i18n';

describe('detectLanguageFromHeaders', () => {
  describe('Single Language Detection', () => {
    it('should detect English from simple header', () => {
      const result = detectLanguageFromHeaders('en');
      expect(result).toBe('en');
    });

    it('should detect German from language with region', () => {
      const result = detectLanguageFromHeaders('de-DE');
      expect(result).toBe('de');
    });

    it('should detect French from language with region', () => {
      const result = detectLanguageFromHeaders('fr-FR');
      expect(result).toBe('fr');
    });

    it('should detect Italian from language with region', () => {
      const result = detectLanguageFromHeaders('it-IT');
      expect(result).toBe('it');
    });

    it('should detect Chinese from language with region', () => {
      const result = detectLanguageFromHeaders('zh-CN');
      expect(result).toBe('zh');
    });

    it('should detect Hindi from language with region', () => {
      const result = detectLanguageFromHeaders('hi-IN');
      expect(result).toBe('hi');
    });
  });

  describe('Multiple Languages with Quality Values', () => {
    it('should select highest priority language', () => {
      const result = detectLanguageFromHeaders('fr-FR,fr;q=0.9,en;q=0.8');
      expect(result).toBe('fr');
    });

    it('should respect q-values and select higher priority', () => {
      const result = detectLanguageFromHeaders('en;q=0.5,de;q=0.9');
      expect(result).toBe('de');
    });

    it('should handle complex Accept-Language header', () => {
      const result = detectLanguageFromHeaders(
        'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
      );
      expect(result).toBe('de');
    });

    it('should select first supported language from mixed list', () => {
      const result = detectLanguageFromHeaders('ja;q=0.9,fr;q=0.8,en;q=0.7');
      expect(result).toBe('fr');
    });

    it('should handle languages without explicit q-values (default 1.0)', () => {
      const result = detectLanguageFromHeaders('it,en;q=0.9');
      expect(result).toBe('it');
    });
  });

  describe('Unsupported Languages with Fallback', () => {
    it('should fallback to English for unsupported language', () => {
      const result = detectLanguageFromHeaders('ja-JP');
      expect(result).toBe('en');
    });

    it('should fallback to English when no supported languages found', () => {
      const result = detectLanguageFromHeaders('ja,ko,ru');
      expect(result).toBe('en');
    });

    it('should find supported language in mixed list', () => {
      const result = detectLanguageFromHeaders('ja-JP,en;q=0.8');
      expect(result).toBe('en');
    });

    it('should find first supported language in complex list', () => {
      const result = detectLanguageFromHeaders('ja;q=1.0,ko;q=0.9,de;q=0.8,ru;q=0.7');
      expect(result).toBe('de');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing header (null)', () => {
      const result = detectLanguageFromHeaders(null);
      expect(result).toBe('en');
    });

    it('should handle missing header (undefined)', () => {
      const result = detectLanguageFromHeaders(undefined);
      expect(result).toBe('en');
    });

    it('should handle empty string', () => {
      const result = detectLanguageFromHeaders('');
      expect(result).toBe('en');
    });

    it('should handle whitespace-only string', () => {
      const result = detectLanguageFromHeaders('   ');
      expect(result).toBe('en');
    });

    it('should handle malformed header with semicolons', () => {
      const result = detectLanguageFromHeaders(';;;');
      expect(result).toBe('en');
    });

    it('should handle malformed q-values gracefully', () => {
      const result = detectLanguageFromHeaders('en;q=invalid,de');
      expect(result).toBe('en');
    });

    it('should handle q-values out of range by skipping them', () => {
      // en has invalid q=2.0, so it's skipped. de has valid q=0.9, so it's selected
      const result = detectLanguageFromHeaders('en;q=2.0,de;q=0.9');
      expect(result).toBe('de');
    });

    it('should handle negative q-values by skipping them', () => {
      // en has invalid q=-0.5, so it's skipped. de has valid q=0.9, so it's selected
      const result = detectLanguageFromHeaders('en;q=-0.5,de;q=0.9');
      expect(result).toBe('de');
    });

    it('should trim whitespace around language tags', () => {
      const result = detectLanguageFromHeaders('  de-DE  ,  en  ');
      expect(result).toBe('de');
    });

    it('should handle duplicate languages', () => {
      const result = detectLanguageFromHeaders('de,de-DE,de-CH');
      expect(result).toBe('de');
    });
  });

  describe('Real-World Browser Examples', () => {
    it('should handle Chrome default header', () => {
      const result = detectLanguageFromHeaders('en-US,en;q=0.9');
      expect(result).toBe('en');
    });

    it('should handle Firefox default header', () => {
      const result = detectLanguageFromHeaders('en-US,en;q=0.5');
      expect(result).toBe('en');
    });

    it('should handle Safari default header', () => {
      const result = detectLanguageFromHeaders('en-us');
      expect(result).toBe('en');
    });

    it('should handle Swiss German browser', () => {
      const result = detectLanguageFromHeaders('de-CH,de;q=0.9,en;q=0.8');
      expect(result).toBe('de');
    });

    it('should handle Swiss French browser', () => {
      const result = detectLanguageFromHeaders('fr-CH,fr;q=0.9,de;q=0.8,en;q=0.7');
      expect(result).toBe('fr');
    });

    it('should handle Swiss Italian browser', () => {
      const result = detectLanguageFromHeaders('it-CH,it;q=0.9,de;q=0.8,fr;q=0.7');
      expect(result).toBe('it');
    });

    it('should handle multilingual Swiss user', () => {
      const result = detectLanguageFromHeaders(
        'de-CH,de;q=0.9,fr-CH;q=0.8,fr;q=0.7,it-CH;q=0.6,it;q=0.5,en;q=0.4'
      );
      expect(result).toBe('de');
    });
  });

  describe('Type Safety', () => {
    it('should return a valid Language type', () => {
      const result = detectLanguageFromHeaders('de-DE');
      const validLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
      expect(validLanguages).toContain(result);
    });

    it('should always return a valid Language type even for invalid input', () => {
      const result = detectLanguageFromHeaders('invalid-language-code');
      const validLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
      expect(validLanguages).toContain(result);
    });
  });
});
