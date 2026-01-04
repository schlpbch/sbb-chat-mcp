import { describe, it, expect } from 'vitest';
import { LOCATION_KEYWORDS, isLocationKeyword } from '../entityPatterns';

describe('Location Keywords', () => {
  describe('LOCATION_KEYWORDS constant', () => {
    it('should have keywords for all supported languages', () => {
      expect(LOCATION_KEYWORDS.en).toContain('here');
      expect(LOCATION_KEYWORDS.de).toContain('hier');
      expect(LOCATION_KEYWORDS.fr).toContain('ici');
      expect(LOCATION_KEYWORDS.it).toContain('qui');
      expect(LOCATION_KEYWORDS.it).toContain('qua');
    });
  });

  describe('isLocationKeyword', () => {
    it('should detect English "here"', () => {
      expect(isLocationKeyword('here', ['en'])).toBe(true);
      expect(isLocationKeyword('Here', ['en'])).toBe(true);
      expect(isLocationKeyword('HERE', ['en'])).toBe(true);
    });

    it('should detect German "hier"', () => {
      expect(isLocationKeyword('hier', ['de'])).toBe(true);
      expect(isLocationKeyword('Hier', ['de'])).toBe(true);
      expect(isLocationKeyword('HIER', ['de'])).toBe(true);
    });

    it('should detect French "ici"', () => {
      expect(isLocationKeyword('ici', ['fr'])).toBe(true);
      expect(isLocationKeyword('Ici', ['fr'])).toBe(true);
    });

    it('should detect Italian "qui" and "qua"', () => {
      expect(isLocationKeyword('qui', ['it'])).toBe(true);
      expect(isLocationKeyword('qua', ['it'])).toBe(true);
      expect(isLocationKeyword('Qui', ['it'])).toBe(true);
    });

    it('should work with multiple languages', () => {
      expect(isLocationKeyword('here', ['en', 'de'])).toBe(true);
      expect(isLocationKeyword('hier', ['en', 'de'])).toBe(true);
      expect(isLocationKeyword('ici', ['fr', 'it'])).toBe(true);
    });

    it('should return false for non-location keywords', () => {
      expect(isLocationKeyword('there', ['en'])).toBe(false);
      expect(isLocationKeyword('da', ['de'])).toBe(false);
      expect(isLocationKeyword('là', ['fr'])).toBe(false);
      expect(isLocationKeyword('bern', ['de'])).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isLocationKeyword(' here ', ['en'])).toBe(true);
      expect(isLocationKeyword('  hier  ', ['de'])).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isLocationKeyword('', ['en'])).toBe(false);
      expect(isLocationKeyword('   ', ['en'])).toBe(false);
    });
  });
});
