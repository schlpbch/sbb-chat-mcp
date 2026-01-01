import { describe, it, expect } from 'vitest';
import {
  ENTITY_PREPOSITIONS,
  DATE_PATTERNS,
  TIME_PATTERNS,
  buildEntityRegex,
  extractDate,
  extractTime,
} from '../entityPatterns';

describe('entityPatterns - Multilingual Support', () => {
  describe('ENTITY_PREPOSITIONS', () => {
    it('should have prepositions for all 6 languages', () => {
      const languages = ['en', 'de', 'fr', 'it', 'zh', 'hi'] as const;
      const entityTypes = ['origin', 'destination', 'location', 'time'] as const;

      languages.forEach((lang) => {
        entityTypes.forEach((type) => {
          expect(ENTITY_PREPOSITIONS[type][lang]).toBeDefined();
          expect(ENTITY_PREPOSITIONS[type][lang].length).toBeGreaterThan(0);
        });
      });
    });

    it('should have Chinese prepositions', () => {
      expect(ENTITY_PREPOSITIONS.origin.zh).toContain('从');
      expect(ENTITY_PREPOSITIONS.destination.zh).toContain('到');
      expect(ENTITY_PREPOSITIONS.location.zh).toContain('在');
    });

    it('should have Hindi prepositions', () => {
      expect(ENTITY_PREPOSITIONS.origin.hi).toContain('से');
      expect(ENTITY_PREPOSITIONS.destination.hi).toContain('को');
      expect(ENTITY_PREPOSITIONS.location.hi).toContain('में');
    });
  });

  describe('DATE_PATTERNS', () => {
    it('should have date patterns for all 6 languages', () => {
      const languages = ['en', 'de', 'fr', 'it', 'zh', 'hi'] as const;
      
      languages.forEach((lang) => {
        expect(DATE_PATTERNS[lang]).toBeDefined();
        expect(DATE_PATTERNS[lang].length).toBeGreaterThan(0);
      });
    });

    it('should extract Chinese dates', () => {
      expect(extractDate('今天去苏黎世', ['zh'])).toBe('今天');
      expect(extractDate('明天的天气', ['zh'])).toBe('明天');
    });

    it('should extract Hindi dates', () => {
      expect(extractDate('आज का मौसम', ['hi'])).toBe('आज');
      expect(extractDate('कल जाना है', ['hi'])).toBe('कल');
    });

    it('should extract English dates', () => {
      expect(extractDate('tomorrow morning', ['en'])).toBe('tomorrow');
      expect(extractDate('next Monday', ['en'])).toBe('next Monday');
    });
  });

  describe('TIME_PATTERNS', () => {
    it('should have time patterns for all 6 languages', () => {
      const languages = ['en', 'de', 'fr', 'it', 'zh', 'hi'] as const;
      
      languages.forEach((lang) => {
        expect(TIME_PATTERNS[lang]).toBeDefined();
        expect(TIME_PATTERNS[lang].length).toBeGreaterThan(0);
      });
    });

    it('should extract Chinese times', () => {
      expect(extractTime('早上8点', ['zh'])).toBe('早上');
      expect(extractTime('下午3点', ['zh'])).toBe('下午');
    });

    it('should extract Hindi times', () => {
      expect(extractTime('सुबह का समय', ['hi'])).toBe('सुबह');
      expect(extractTime('शाम को', ['hi'])).toBe('शाम');
    });

    it('should extract English times', () => {
      expect(extractTime('at 2:30 pm', ['en'])).toBe('2:30 pm');
      expect(extractTime('14:30', ['en'])).toBe('14:30');
    });
  });

  describe('buildEntityRegex', () => {
    it('should handle undefined language gracefully', () => {
      // This should not crash even if a language doesn't have prepositions
      const regex = buildEntityRegex('origin', ['en', 'zh']);
      expect(regex).toBeInstanceOf(RegExp);
    });

    it('should filter out null/undefined values', () => {
      // Should not crash when building regex
      const regex = buildEntityRegex('origin', ['en', 'de', 'zh', 'hi']);
      expect(regex).toBeInstanceOf(RegExp);
    });

    it('should create valid regex for Chinese', () => {
      const regex = buildEntityRegex('origin', ['zh']);
      expect(regex).toBeInstanceOf(RegExp);
      // Should match Chinese preposition with space
      expect(' 从 苏黎世').toMatch(regex);
    });

    it('should create valid regex for Hindi', () => {
      const regex = buildEntityRegex('origin', ['hi']);
      expect(regex).toBeInstanceOf(RegExp);
      // Should match Hindi preposition
      expect(' से ज्यूरिख').toMatch(regex);
    });

    it('should create valid regex for mixed languages', () => {
      const regex = buildEntityRegex('destination', ['en', 'zh']);
      expect(regex).toBeInstanceOf(RegExp);
      // Should match both English and Chinese with proper spacing
      expect(' to Zurich').toMatch(regex);
      expect(' 到 苏黎世').toMatch(regex);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      expect(extractDate('', ['en'])).toBeUndefined();
      expect(extractTime('', ['en'])).toBeUndefined();
    });

    it('should handle messages without dates/times', () => {
      expect(extractDate('Hello world', ['en'])).toBeUndefined();
      expect(extractTime('Hello world', ['en'])).toBeUndefined();
    });

    it('should handle multiple languages in date extraction', () => {
      const result = extractDate('tomorrow', ['en', 'de', 'zh']);
      expect(result).toBe('tomorrow');
    });

    it('should handle multiple languages in time extraction', () => {
      const result = extractTime('at 3pm', ['en', 'de', 'zh']);
      expect(result).toBe('3pm');
    });
  });
});
