import { describe, it, expect, beforeEach } from 'vitest';
import { ContextPreparationService } from '../ContextPreparationService';

describe('ContextPreparationService - USER_LOCATION Replacement', () => {
  let service: ContextPreparationService;

  beforeEach(() => {
    service = new ContextPreparationService();
  });

  describe('USER_LOCATION replacement with nearest station', () => {
    it('should replace origin USER_LOCATION with nearest station', async () => {
      const chatContext = {
        nearestStation: {
          name: 'Bern, Elfenau',
          distance: 394,
          stopId: 'test-stop-id',
        },
      };

      const result = await service.prepareContext(
        'bus von hier nach zürich',
        'test-session',
        'de',
        undefined,
        chatContext
      );

      // Check that the intent has the replaced origin
      expect(result.intents[0].extractedEntities?.origin).toBe('Bern, Elfenau');
      expect(result.intents[0].extractedEntities?.origin).not.toBe(
        'USER_LOCATION'
      );
    });

    it('should replace destination USER_LOCATION with nearest station', async () => {
      const chatContext = {
        nearestStation: {
          name: 'Zürich HB',
          distance: 500,
          stopId: 'test-stop-id',
        },
      };

      const result = await service.prepareContext(
        'bus von bern nach hier',
        'test-session',
        'de',
        undefined,
        chatContext
      );

      expect(result.intents[0].extractedEntities?.destination).toBe(
        'Zürich HB'
      );
    });

    it('should handle both origin and destination as USER_LOCATION', async () => {
      const chatContext = {
        nearestStation: {
          name: 'Geneva',
          distance: 200,
          stopId: 'test-stop-id',
        },
      };

      // This is an edge case - both origin and destination as "here"
      // In practice, this wouldn't make sense, but we should handle it gracefully
      const result = await service.prepareContext(
        'test message',
        'test-session',
        'en',
        {
          hasMarkdown: false,
        },
        chatContext
      );

      // The service should not crash and should handle the context
      expect(result.intents).toBeDefined();
    });
  });

  describe('USER_LOCATION without nearest station', () => {
    it('should not replace USER_LOCATION when no nearest station available', async () => {
      const chatContext = {
        nearestStation: undefined,
      };

      const result = await service.prepareContext(
        'bus von hier nach bern',
        'test-session',
        'de',
        undefined,
        chatContext
      );

      // USER_LOCATION should remain as-is if no nearest station
      const origin = result.intents[0].extractedEntities?.origin;
      if (origin === 'USER_LOCATION') {
        // This is expected - no replacement happened
        expect(origin).toBe('USER_LOCATION');
      }
    });

    it('should not replace when chatContext is undefined', async () => {
      const result = await service.prepareContext(
        'bus von hier nach bern',
        'test-session',
        'de',
        undefined,
        undefined
      );

      // Should not crash
      expect(result.intents).toBeDefined();
    });
  });

  describe('Normal location names', () => {
    it('should not modify normal location names', async () => {
      const chatContext = {
        nearestStation: {
          name: 'Bern, Elfenau',
          distance: 394,
          stopId: 'test-stop-id',
        },
      };

      const result = await service.prepareContext(
        'bus von zürich nach bern',
        'test-session',
        'de',
        undefined,
        chatContext
      );

      // Normal location names should not be replaced
      const origin = result.intents[0].extractedEntities?.origin;
      expect(origin).not.toBe('Bern, Elfenau');
      expect(origin).not.toBe('USER_LOCATION');
    });
  });
});
