/**
 * Tests for Intent Extractor
 *
 * Comprehensive test suite for multilingual intent extraction
 * across English (EN), German (DE), French (FR), and Italian (IT).
 */

import { describe, it, expect } from '@jest/globals';
import { extractIntent } from '../intentExtractor';

describe('Intent Extractor', () => {
  // ==================== TRIP PLANNING ====================

  describe('Trip Planning Intent', () => {
    it('should detect EN trip planning with entities', () => {
      const result = extractIntent(
        'Find trains from Zurich to Bern tomorrow at 10 AM',
        'en'
      );

      expect(result.type).toBe('trip_planning');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/zurich/i);
      expect(result.extractedEntities.destination).toMatch(/bern/i);
      expect(result.extractedEntities.date).toMatch(/tomorrow/i);
      expect(result.detectedLanguages).toContain('en');
    });

    it('should detect DE trip planning with entities', () => {
      const result = extractIntent(
        'Züge von Zürich nach Bern morgen um 10 Uhr',
        'de'
      );

      expect(result.type).toBe('trip_planning');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/zürich/i);
      expect(result.extractedEntities.destination).toMatch(/bern/i);
      expect(result.extractedEntities.date).toMatch(/morgen/i);
      expect(result.detectedLanguages).toContain('de');
    });

    it('should detect FR trip planning with entities', () => {
      const result = extractIntent(
        'Trains de Zurich à Berne demain à 10h',
        'fr'
      );

      expect(result.type).toBe('trip_planning');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/zurich/i);
      expect(result.extractedEntities.destination).toMatch(/bern/i);
      expect(result.extractedEntities.date).toMatch(/demain/i);
      expect(result.detectedLanguages).toContain('fr');
    });

    it('should detect IT trip planning with entities', () => {
      const result = extractIntent(
        'Treni da Zurigo a Berna domani alle 10',
        'it'
      );

      expect(result.type).toBe('trip_planning');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/zurigo/i);
      expect(result.extractedEntities.destination).toMatch(/berna/i);
      expect(result.extractedEntities.date).toMatch(/domani/i);
      expect(result.detectedLanguages).toContain('it');
    });

    it('should handle implicit "X to Y" pattern', () => {
      const result = extractIntent('Zurich to Bern', 'en');

      expect(result.type).toBe('trip_planning');
      expect(result.extractedEntities.origin).toMatch(/zurich/i);
      expect(result.extractedEntities.destination).toMatch(/bern/i);
    });
  });

  // ==================== WEATHER CHECK ====================

  describe('Weather Check Intent', () => {
    it('should detect EN weather check', () => {
      const result = extractIntent('What is the weather in Lucerne?', 'en');

      expect(result.type).toBe('weather_check');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/lucerne/i);
    });

    it('should detect DE weather check', () => {
      const result = extractIntent('Wie ist das Wetter in Luzern?', 'de');

      expect(result.type).toBe('weather_check');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/luzern/i);
    });

    it('should detect FR weather check', () => {
      const result = extractIntent('Quel temps fait-il à Lucerne?', 'fr');

      expect(result.type).toBe('weather_check');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/lucerne/i);
    });

    it('should detect IT weather check', () => {
      const result = extractIntent('Che tempo fa a Lucerna?', 'it');

      expect(result.type).toBe('weather_check');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/lucerna/i);
    });
  });

  // ==================== STATION SEARCH ====================

  describe('Station Search Intent', () => {
    it('should detect EN station search', () => {
      const result = extractIntent(
        'Show me departures from Geneva station',
        'en'
      );

      expect(result.type).toBe('station_search');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.origin).toMatch(/geneva/i);
      expect(result.extractedEntities.eventType).toBe('departures');
    });

    it('should detect DE station search', () => {
      const result = extractIntent('Zeig mir Abfahrten vom Bahnhof Genf', 'de');

      expect(result.type).toBe('station_search');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.eventType).toBe('departures');
    });

    it('should detect FR station search', () => {
      const result = extractIntent(
        'Affiche les départs de la gare de Genève',
        'fr'
      );

      expect(result.type).toBe('station_search');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.eventType).toBe('departures');
    });

    it('should detect IT station search', () => {
      const result = extractIntent(
        'Mostra le partenze dalla stazione di Ginevra',
        'it'
      );

      expect(result.type).toBe('station_search');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.extractedEntities.eventType).toBe('departures');
    });

    it('should detect arrivals vs departures', () => {
      const departures = extractIntent('Show departures from Zurich', 'en');
      const arrivals = extractIntent('Show arrivals at Zurich', 'en');

      expect(departures.extractedEntities.eventType).toBe('departures');
      expect(arrivals.extractedEntities.eventType).toBe('arrivals');
    });
  });

  // ==================== TRAIN FORMATION ====================

  describe('Train Formation Intent', () => {
    it('should detect EN train formation', () => {
      const result = extractIntent(
        'What is the train formation for IC 815?',
        'en'
      );

      expect(result.type).toBe('train_formation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect DE train formation', () => {
      const result = extractIntent(
        'Wie ist die Zugformation für IC 815?',
        'de'
      );

      expect(result.type).toBe('train_formation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect FR train formation', () => {
      const result = extractIntent(
        'Quelle est la composition du train IC 815?',
        'fr'
      );

      expect(result.type).toBe('train_formation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect IT train formation', () => {
      const result = extractIntent(
        'Qual è la formazione del treno IC 815?',
        'it'
      );

      expect(result.type).toBe('train_formation');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  // ==================== LANGUAGE DETECTION ====================

  describe('Language Detection', () => {
    it('should detect German from keywords', () => {
      const result = extractIntent('Züge von Zürich nach Bern');

      expect(result.detectedLanguages).toContain('de');
    });

    it('should prioritize user language when provided', () => {
      const result = extractIntent('train from Zurich to Bern', 'fr');

      // Should detect EN but prioritize FR
      expect(result.detectedLanguages).toBeDefined();
      expect(result.detectedLanguages![0]).toBe('fr');
    });

    it('should handle mixed language input', () => {
      const result = extractIntent('Züge from Zurich to Bern', 'en');

      expect(result.detectedLanguages).toBeDefined();
      expect(result.detectedLanguages!.length).toBeGreaterThan(0);
    });

    it('should fallback to user language for ambiguous input', () => {
      const result = extractIntent('10:30', 'de');

      expect(result.detectedLanguages).toContain('de');
    });
  });

  // ==================== ENTITY EXTRACTION ====================

  describe('Entity Extraction', () => {
    it('should extract origin and destination in EN', () => {
      const result = extractIntent('Train from Milan to Zurich', 'en');

      expect(result.extractedEntities.origin).toMatch(/milan/i);
      expect(result.extractedEntities.destination).toMatch(/zurich/i);
    });

    it('should extract origin and destination in IT', () => {
      const result = extractIntent('Treni da Milano a Zurigo', 'it');

      expect(result.extractedEntities.origin).toMatch(/milano/i);
      expect(result.extractedEntities.destination).toMatch(/zurigo/i);
    });

    it('should handle diacritics in place names', () => {
      const result = extractIntent('Zürich to Genève', 'en');

      expect(result.extractedEntities.origin).toBeDefined();
      expect(result.extractedEntities.destination).toBeDefined();
    });

    it('should extract date in multiple languages', () => {
      const enResult = extractIntent('Train tomorrow', 'en');
      const deResult = extractIntent('Zug morgen', 'de');
      const frResult = extractIntent('Train demain', 'fr');
      const itResult = extractIntent('Treno domani', 'it');

      expect(enResult.extractedEntities.date).toBeDefined();
      expect(deResult.extractedEntities.date).toBeDefined();
      expect(frResult.extractedEntities.date).toBeDefined();
      expect(itResult.extractedEntities.date).toBeDefined();
    });

    it('should extract time in multiple languages', () => {
      const enResult = extractIntent('Train at 10:30', 'en');
      const deResult = extractIntent('Zug um 10:30', 'de');
      const frResult = extractIntent('Train à 10h30', 'fr');
      const itResult = extractIntent('Treno alle 10:30', 'it');

      expect(enResult.extractedEntities.time).toBeDefined();
      expect(deResult.extractedEntities.time).toBeDefined();
      expect(frResult.extractedEntities.time).toBeDefined();
      expect(itResult.extractedEntities.time).toBeDefined();
    });
  });

  // ==================== CONFIDENCE SCORING ====================

  describe('Confidence Scoring', () => {
    it('should have higher confidence with multiple keywords', () => {
      const simple = extractIntent('train', 'en');
      const detailed = extractIntent(
        'Find train connection from Zurich to Bern',
        'en'
      );

      expect(detailed.confidence).toBeGreaterThan(simple.confidence);
    });

    it('should boost confidence when entities are present', () => {
      const noEntities = extractIntent('train connection', 'en');
      const withEntities = extractIntent('train from Zurich to Bern', 'en');

      expect(withEntities.confidence).toBeGreaterThanOrEqual(
        noEntities.confidence
      );
    });

    it('should boost confidence when date/time is specified', () => {
      const noTime = extractIntent('train from Zurich to Bern', 'en');
      const withTime = extractIntent(
        'train from Zurich to Bern tomorrow at 10 AM',
        'en'
      );

      expect(withTime.confidence).toBeGreaterThanOrEqual(noTime.confidence);
    });

    it('should cap confidence at 0.95', () => {
      const result = extractIntent(
        'Find train connection from Zurich to Bern tomorrow at 10 AM with multiple keywords',
        'en'
      );

      expect(result.confidence).toBeLessThanOrEqual(0.95);
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = extractIntent('', 'en');

      expect(result.type).toBe('general_info');
      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should handle very short queries', () => {
      const result = extractIntent('Bern', 'en');

      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should handle queries with special characters', () => {
      const result = extractIntent('Train from Zürich (HB) to Bern!', 'en');

      expect(result.type).toBe('trip_planning');
      expect(result.extractedEntities.origin).toBeDefined();
    });

    it('should handle abbreviations', () => {
      const result = extractIntent('Train from ZH to BE', 'en');

      expect(result.type).toBe('trip_planning');
    });

    it('should prioritize station over trip for "train station"', () => {
      const result = extractIntent('Show me the train station in Zurich', 'en');

      expect(result.type).toBe('station_search');
    });

    it('should handle typos gracefully', () => {
      const result = extractIntent('Trian from Zurich to Bern', 'en');

      // Should still work even with typo in "train"
      expect(result.extractedEntities.origin).toBeDefined();
      expect(result.extractedEntities.destination).toBeDefined();
    });
  });

  // ==================== GENERAL INFO ====================

  describe('General Info Intent', () => {
    it('should default to general_info for unclear queries', () => {
      const result = extractIntent('Hello, how are you?', 'en');

      expect(result.type).toBe('general_info');
    });

    it('should detect help requests', () => {
      const enResult = extractIntent('Can you help me?', 'en');
      const deResult = extractIntent('Kannst du mir helfen?', 'de');

      expect(enResult.type).toBe('general_info');
      expect(deResult.type).toBe('general_info');
    });
  });
});
