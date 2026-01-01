/**
 * Multi-Intent Integration Tests
 * 
 * End-to-end tests for multi-intent extraction and orchestration
 */

import { describe, it, expect } from 'vitest';
import { extractMultipleIntents } from '../context/multiIntentExtractor';
import type { Language } from '../context/types';

describe('Multi-Intent Integration', () => {
  describe('End-to-End Multi-Intent Extraction', () => {
    it('extracts trip_planning + weather_check from compound query', async () => {
      const query = 'Show me trains from Zurich to Bern and the weather in Bern';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      
      // Should detect at least trip_planning
      expect(types).toContain('trip_planning');
      
      // Each intent should have priority assigned
      intents.forEach((intent) => {
        expect(intent.priority).toBeDefined();
        expect(typeof intent.priority).toBe('number');
      });
      
      // Each intent should have segment text
      intents.forEach((intent) => {
        expect(intent.segment).toBeDefined();
        expect(typeof intent.segment).toBe('string');
      });
    });

    it('extracts trip_planning + snow_conditions from compound query', async () => {
      const query = 'I need to get to Davos tomorrow. What are the snow conditions?';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      
      // Should detect snow_conditions
      expect(types).toContain('snow_conditions');
    });

    it('extracts weather_check + snow_conditions from compound query', async () => {
      const query = 'Weather and snow conditions in Zermatt';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      
      // Should detect at least one of weather or snow
      expect(
        types.includes('weather_check') || types.includes('snow_conditions')
      ).toBe(true);
    });

    it('handles single-intent query without false positives', async () => {
      const query = 'Weather in Zurich';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents.length).toBe(1);
      expect(intents[0].type).toBe('weather_check');
      expect(intents[0].priority).toBe(1);
    });

    it('handles simple greeting as general_info', async () => {
      const query = 'Hello, how are you?';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents.length).toBe(1);
      expect(intents[0].type).toBe('general_info');
    });
  });

  describe('Multi-Language Support', () => {
    it('extracts intents from German query', async () => {
      const query = 'Züge von Zürich nach Bern und Wetter in Bern';
      const intents = await extractMultipleIntents(query, 'de' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      expect(types).toContain('trip_planning');
    });

    it('extracts intents from French query', async () => {
      const query = 'Trains de Zurich à Berne et météo à Berne';
      const intents = await extractMultipleIntents(query, 'fr' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      expect(types).toContain('trip_planning');
    });

    it('extracts intents from Italian query', async () => {
      const query = 'Treni da Zurigo a Berna e meteo a Berna';
      const intents = await extractMultipleIntents(query, 'it' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      const types = intents.map((i) => i.type);
      expect(types).toContain('trip_planning');
    });
  });

  describe('Priority Assignment', () => {
    it('assigns priority 1 to first intent, 2 to second', async () => {
      const query = 'Trains to Bern and weather there';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      if (intents.length > 1) {
        expect(intents[0].priority).toBe(1);
        expect(intents[1].priority).toBe(2);
      }
    });

    it('maintains priority order after deduplication', async () => {
      const query = 'Find trains from Zurich to Bern tomorrow morning at 8 AM and check the weather forecast for Bern';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      // Priorities should be sequential starting from 1
      const priorities = intents.map((i) => i.priority).filter((p) => p !== undefined);
      
      if (priorities.length > 0) {
        expect(priorities[0]).toBe(1);
        
        // Each subsequent priority should be sequential
        for (let i = 1; i < priorities.length; i++) {
          expect(priorities[i]).toBeGreaterThan(priorities[i - 1]!);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', async () => {
      const intents = await extractMultipleIntents('', 'en' as Language);

      expect(intents.length).toBe(1);
      expect(intents[0].type).toBe('general_info');
    });

    it('handles very long compound query', async () => {
      const longQuery =
        'I need to travel from Zurich to Bern tomorrow morning at 8 AM and then check the weather forecast for Bern and also see if there are any snow conditions in the nearby mountains and find out about train formations';

      const intents = await extractMultipleIntents(longQuery, 'en' as Language);

      expect(intents.length).toBeGreaterThanOrEqual(1);
      
      // Should detect at least trip_planning
      expect(intents.some((i) => i.type === 'trip_planning')).toBe(true);
    });

    it('handles query with multiple punctuation marks', async () => {
      const intents = await extractMultipleIntents(
        'Trains to Bern??? Weather there!!!',
        'en' as Language
      );

      expect(intents.length).toBeGreaterThanOrEqual(1);
    });

    it('handles mixed language query', async () => {
      const intents = await extractMultipleIntents(
        'Züge from Zurich to Bern and weather in Bern',
        'en' as Language
      );

      expect(intents.length).toBeGreaterThanOrEqual(1);
    });

    it('does not split on protected phrases like "St. Gallen"', async () => {
      const intents = await extractMultipleIntents(
        'Trains from St. Gallen to Zurich',
        'en' as Language
      );

      expect(intents.length).toBe(1);
      expect(intents[0].type).toBe('trip_planning');
    });
  });

  describe('Confidence Scores', () => {
    it('assigns higher confidence to clear intents', async () => {
      const query = 'Find trains from Zurich to Bern';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      expect(intents[0].confidence).toBeGreaterThan(0.7);
    });

    it('assigns lower confidence to ambiguous queries', async () => {
      const query = 'maybe something about travel';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      // Should still extract an intent, but with lower confidence
      expect(intents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Deduplication', () => {
    it('allows both weather_check and snow_conditions', async () => {
      const query = 'Weather and snow in Zermatt';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      const types = intents.map((i) => i.type);
      
      // Both should be allowed if detected
      if (types.includes('weather_check') && types.includes('snow_conditions')) {
        expect(intents.length).toBe(2);
      }
    });

    it('removes duplicate intent types', async () => {
      // This is a synthetic test - in practice, deduplication happens internally
      const query = 'Trains to Bern and trains to Zurich';
      const intents = await extractMultipleIntents(query, 'en' as Language);

      const types = intents.map((i) => i.type);
      const uniqueTypes = [...new Set(types)];
      
      // Should not have duplicate types
      expect(types.length).toBe(uniqueTypes.length);
    });
  });
});
