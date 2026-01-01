import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextPreparationService } from '../ContextPreparationService';
import type { Intent } from '../../../context/types';

// Mock dependencies
vi.mock('../../../sessionManager', () => ({
  getSessionContext: vi.fn(),
  setSessionContext: vi.fn(),
}));

vi.mock('../../../contextManager', () => ({
  updateContextFromMessage: vi.fn(),
}));

vi.mock('../../../context/multiIntentExtractor', () => ({
  extractMultipleIntents: vi.fn(),
}));

import { getSessionContext, setSessionContext } from '../../../sessionManager';
import { updateContextFromMessage } from '../../../contextManager';
import { extractMultipleIntents } from '../../../context/multiIntentExtractor';

describe('ContextPreparationService', () => {
  let service: ContextPreparationService;

  beforeEach(() => {
    service = new ContextPreparationService();
    vi.clearAllMocks();
  });

  describe('prepareContext', () => {
    it('prepares context without parsed intent', async () => {
      const mockSessionContext = {
        sessionId: 'test-session',
        language: 'en',
        createdAt: new Date(),
        lastUpdated: new Date(),
        preferences: { travelStyle: 'balanced' },
        location: {},
        time: {},
        intentHistory: [],
        recentToolResults: new Map(),
        mentionedPlaces: [],
        mentionedTrips: [],
      };

      const mockExtractedIntent: Intent = {
        type: 'trip_planning' as const,
        confidence: 0.8,
        extractedEntities: {
          origin: 'Zurich',
          destination: 'Bern',
        },
        timestamp: new Date(),
        priority: 1,
      };

      const mockUpdatedContext = {
        ...mockSessionContext,
        currentIntent: mockExtractedIntent,
      };

      vi.mocked(getSessionContext).mockReturnValue(mockSessionContext);
      vi.mocked(extractMultipleIntents).mockResolvedValue([mockExtractedIntent]);
      vi.mocked(updateContextFromMessage).mockReturnValue(mockUpdatedContext);

      const result = await service.prepareContext(
        'Find trips from Zurich to Bern',
        'test-session',
        'en'
      );

      expect(getSessionContext).toHaveBeenCalledWith('test-session', 'en');
      expect(extractMultipleIntents).toHaveBeenCalledWith(
        'Find trips from Zurich to Bern',
        'en'
      );
      expect(updateContextFromMessage).toHaveBeenCalled();
      expect(setSessionContext).toHaveBeenCalledWith(
        'test-session',
        mockUpdatedContext
      );

      expect(result.sessionContext).toEqual(mockSessionContext);
      expect(result.intents).toEqual([mockExtractedIntent]);
      expect(result.updatedContext).toEqual(mockUpdatedContext);
    });

    it('merges parsed markdown intent with extracted intent', async () => {
      const mockSessionContext = {
        sessionId: 'test-session',
        language: 'en',
        createdAt: new Date(),
        lastUpdated: new Date(),
        preferences: { travelStyle: 'balanced' },
        location: {},
        time: {},
        intentHistory: [],
        recentToolResults: new Map(),
        mentionedPlaces: [],
        mentionedTrips: [],
      };

      const mockExtractedIntent = {
        type: 'trip_planning',
        confidence: 0.8,
        extractedEntities: {},
      };

      const parsedIntent = {
        hasMarkdown: true,
        structuredData: {
          preferences: ['eco-friendly', 'fast'],
        },
        subQueries: ['What are the connections?', 'How long does it take?'],
      };

      vi.mocked(getSessionContext).mockReturnValue(mockSessionContext);
      vi.mocked(extractMultipleIntents).mockResolvedValue([mockExtractedIntent]);
      vi.mocked(updateContextFromMessage).mockReturnValue(mockSessionContext);

      const result = await service.prepareContext(
        'Find eco-friendly trips',
        'test-session',
        'en',
        parsedIntent
      );

      expect(result.intents).toHaveLength(1);
      expect(result.intents[0]).toEqual({
        ...mockExtractedIntent,
        preferences: ['eco-friendly', 'fast'],
        subQueries: ['What are the connections?', 'How long does it take?'],
      });
    });

    it('handles parsed intent without markdown flag', async () => {
      const mockSessionContext = {
        sessionId: 'test-session',
        language: 'en',
        createdAt: new Date(),
        lastUpdated: new Date(),
        preferences: { travelStyle: 'balanced' },
        location: {},
        time: {},
        intentHistory: [],
        recentToolResults: new Map(),
        mentionedPlaces: [],
        mentionedTrips: [],
      };

      const mockExtractedIntent = {
        type: 'trip_planning',
        confidence: 0.8,
        extractedEntities: {},
      };

      const parsedIntent = {
        hasMarkdown: false,
        structuredData: {
          preferences: ['eco-friendly'],
        },
      };

      vi.mocked(getSessionContext).mockReturnValue(mockSessionContext);
      vi.mocked(extractMultipleIntents).mockResolvedValue([mockExtractedIntent]);
      vi.mocked(updateContextFromMessage).mockReturnValue(mockSessionContext);

      const result = await service.prepareContext(
        'Find trips',
        'test-session',
        'en',
        parsedIntent
      );

      // Should not merge when hasMarkdown is false
      expect(result.intents).toHaveLength(1);
      expect(result.intents[0]).toEqual(mockExtractedIntent);
      expect(result.intents[0]).not.toHaveProperty('preferences');
    });

    it('handles different languages', async () => {
      const languages = ['en', 'de', 'fr', 'it'];

      for (const language of languages) {
        vi.clearAllMocks();

        const mockSessionContext = {
          sessionId: 'test-session',
          language,
          createdAt: new Date(),
          lastUpdated: new Date(),
          preferences: { travelStyle: 'balanced' },
          location: {},
          time: {},
          intentHistory: [],
          recentToolResults: new Map(),
          mentionedPlaces: [],
          mentionedTrips: [],
        };

        const mockExtractedIntent: Intent = {
          type: 'trip_planning' as const,
          confidence: 0.8,
          extractedEntities: {},
          timestamp: new Date(),
        };

        vi.mocked(getSessionContext).mockReturnValue(mockSessionContext);
        vi.mocked(extractMultipleIntents).mockResolvedValue([mockExtractedIntent]);
        vi.mocked(updateContextFromMessage).mockReturnValue(mockSessionContext);

        await service.prepareContext('Test message', 'test-session', language);

        expect(getSessionContext).toHaveBeenCalledWith(
          'test-session',
          language
        );
        expect(extractMultipleIntents).toHaveBeenCalledWith('Test message', language);
      }
    });
  });
});
