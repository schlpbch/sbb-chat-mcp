import { describe, it, expect } from 'vitest';
import { extractIntent } from '../intentExtractor';

describe('Intent Extractor - Snow Conditions', () => {
  describe('Snow Conditions Intent Detection', () => {
    it('should detect snow_conditions intent for "snow conditions in Zermatt"', async () => {
      const result = await extractIntent('snow conditions in Zermatt', 'en');

      expect(result.type).toBe('snow_conditions');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.extractedEntities.origin).toBe('Zermatt');
    });

    it('should detect snow_conditions intent for "ski conditions in St. Moritz"', async () => {
      const result = await extractIntent('ski conditions in St. Moritz', 'en');

      expect(result.type).toBe('snow_conditions');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.extractedEntities.origin).toBe('St. Moritz');
    });

    it('should detect snow_conditions intent for "how much snow in Verbier"', async () => {
      const result = await extractIntent('how much snow in Verbier', 'en');

      expect(result.type).toBe('snow_conditions');
      expect(result.extractedEntities.origin).toBe('Verbier');
    });

    it('should detect snow_conditions for German "Schneebedingungen in Zermatt"', async () => {
      const result = await extractIntent('Schneebedingungen in Zermatt', 'de');

      expect(result.type).toBe('snow_conditions');
      expect(result.extractedEntities.origin).toBe('Zermatt');
    });

    it('should detect snow_conditions for French "conditions de neige à Verbier"', async () => {
      const result = await extractIntent('conditions de neige à Verbier', 'fr');

      expect(result.type).toBe('snow_conditions');
      expect(result.extractedEntities.origin).toBe('Verbier');
    });

    it('should detect snow_conditions for Italian "condizioni della neve a Zermatt"', async () => {
      const result = await extractIntent(
        'condizioni della neve a Zermatt',
        'it'
      );

      expect(result.type).toBe('snow_conditions');
      expect(result.extractedEntities.origin).toBe('Zermatt');
    });
  });

  describe('Weather vs Snow Distinction', () => {
    it('should detect weather_check (NOT snow) for "weather in Zurich"', async () => {
      const result = await extractIntent('weather in Zurich', 'en');

      expect(result.type).toBe('weather_check');
      expect(result.type).not.toBe('snow_conditions');
    });

    it('should detect weather_check for "temperature in Bern"', async () => {
      const result = await extractIntent('temperature in Bern', 'en');

      expect(result.type).toBe('weather_check');
    });

    it('should detect weather_check for "will it rain in Geneva"', async () => {
      const result = await extractIntent('will it rain in Geneva', 'en');

      expect(result.type).toBe('weather_check');
    });

    it('should detect snow_conditions (NOT weather) for "powder in Zermatt"', async () => {
      const result = await extractIntent('powder in Zermatt', 'en');

      expect(result.type).toBe('snow_conditions');
      expect(result.type).not.toBe('weather_check');
    });

    it('should detect snow_conditions for "skiing in Davos"', async () => {
      const result = await extractIntent('skiing in Davos', 'en');

      expect(result.type).toBe('snow_conditions');
    });
  });

  describe('Keyword Matching', () => {
    it('should match snow keywords for snow queries', async () => {
      const result = await extractIntent('snow conditions in Zermatt', 'en');

      expect(result.matchedKeywords).toBeDefined();
      expect(result.matchedKeywords!.length).toBeGreaterThan(0);
      expect(result.matchedKeywords!.some((k) => k.includes('snow'))).toBe(
        true
      );
    });

    it('should have high confidence for multi-keyword snow queries', async () => {
      const result = await extractIntent(
        'ski resort snow conditions in Zermatt',
        'en'
      );

      expect(result.type).toBe('snow_conditions');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Entity Extraction', () => {
    it('should extract location from "in" preposition', async () => {
      const result = await extractIntent('snow in Zermatt', 'en');

      expect(result.extractedEntities.origin).toBe('Zermatt');
    });

    it('should extract location from "at" preposition', async () => {
      const result = await extractIntent('ski conditions at St. Moritz', 'en');

      expect(result.extractedEntities.origin).toBe('St. Moritz');
    });

    it('should handle complex location names', async () => {
      const result = await extractIntent('snow conditions in Saas-Fee', 'en');

      expect(result.extractedEntities.origin).toBe('Saas-Fee');
    });
  });

  describe('Edge Cases', () => {
    it('should prioritize snow over weather when both keywords present', async () => {
      const result = await extractIntent(
        'weather and snow conditions in Zermatt',
        'en'
      );

      // Snow should take priority since it's checked first
      expect(result.type).toBe('snow_conditions');
    });

    it('should handle "snowfall" as snow_conditions', async () => {
      const result = await extractIntent('snowfall in Zermatt', 'en');

      expect(result.type).toBe('snow_conditions');
    });

    it('should handle "slopes" as snow_conditions', async () => {
      const result = await extractIntent('slopes in Verbier', 'en');

      expect(result.type).toBe('snow_conditions');
    });
  });
});
