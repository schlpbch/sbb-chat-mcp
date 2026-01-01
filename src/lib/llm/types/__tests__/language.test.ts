import { describe, it, expect } from 'vitest';
import { getLanguageName, LANGUAGE_NAMES } from '../language';

describe('language types - Multilingual Support', () => {
  describe('LANGUAGE_NAMES', () => {
    it('should have names for all 6 supported languages', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.de).toBe('German');
      expect(LANGUAGE_NAMES.fr).toBe('French');
      expect(LANGUAGE_NAMES.it).toBe('Italian');
      expect(LANGUAGE_NAMES.zh).toBe('Simplified Chinese');
      expect(LANGUAGE_NAMES.hi).toBe('Hindi');
    });

    it('should have exactly 6 languages', () => {
      expect(Object.keys(LANGUAGE_NAMES)).toHaveLength(6);
    });
  });

  describe('getLanguageName', () => {
    it('should return correct language names', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('de')).toBe('German');
      expect(getLanguageName('fr')).toBe('French');
      expect(getLanguageName('it')).toBe('Italian');
      expect(getLanguageName('zh')).toBe('Simplified Chinese');
      expect(getLanguageName('hi')).toBe('Hindi');
    });

    it('should fallback to English for unknown languages', () => {
      expect(getLanguageName('unknown')).toBe('English');
      expect(getLanguageName('es')).toBe('English');
      expect(getLanguageName('')).toBe('English');
    });

    it('should handle case sensitivity', () => {
      // Should work with lowercase
      expect(getLanguageName('zh')).toBe('Simplified Chinese');
      expect(getLanguageName('hi')).toBe('Hindi');
    });
  });
});
