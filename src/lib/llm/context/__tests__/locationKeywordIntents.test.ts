import { describe, it, expect } from 'vitest';
import { extractIntent } from '../intentExtractor';

describe('Location Keyword Intent Extraction', () => {
  describe('German location keywords', () => {
    it('should detect "hier" in "von hier nach Bern"', () => {
      const result = extractIntent('bus von hier nach bern', 'de');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).toBe('Bern');
      expect(result.extractedEntities.requiresUserLocation).toBe(true);
    });

    it('should detect "hier" in "zug von hier nach zürich"', () => {
      const result = extractIntent('zug von hier nach zürich', 'de');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).toMatch(/zürich/i);
    });

    it('should not capitalize "hier" as part of location name', () => {
      const result = extractIntent('bus von hier zum bahnhof', 'de');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.origin).not.toContain('Hier');
    });
  });

  describe('English location keywords', () => {
    it('should detect "here" in "from here to Geneva"', () => {
      const result = extractIntent('train from here to geneva', 'en');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).toMatch(/geneva/i);
      expect(result.extractedEntities.requiresUserLocation).toBe(true);
    });

    it('should detect "here" in "bus from here to airport"', () => {
      const result = extractIntent('bus from here to airport', 'en');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
    });
  });

  describe('French location keywords', () => {
    it('should detect "ici" in "de ici à Lausanne"', () => {
      const result = extractIntent('train de ici à lausanne', 'fr');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).toMatch(/lausanne/i);
    });
  });

  describe('Italian location keywords', () => {
    it('should detect "qui" in "da qui a Lugano"', () => {
      const result = extractIntent('treno da qui a lugano', 'it');
      expect(result.extractedEntities.origin).toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).toMatch(/lugano/i);
    });
  });

  describe('Non-location keyword queries', () => {
    it('should extract normal location names', () => {
      const result = extractIntent('bus von zürich nach bern', 'de');
      expect(result.extractedEntities.origin).toMatch(/zürich/i);
      expect(result.extractedEntities.destination).toBe('Bern');
      expect(result.extractedEntities.requiresUserLocation).toBeUndefined();
    });

    it('should not mark regular locations as USER_LOCATION', () => {
      const result = extractIntent('train from zurich to geneva', 'en');
      expect(result.extractedEntities.origin).not.toBe('USER_LOCATION');
      expect(result.extractedEntities.destination).not.toBe('USER_LOCATION');
    });
  });
});
