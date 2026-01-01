/**
 * Unit tests for contextManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContext, updateContextFromMessage } from '../contextManager';
import type { ConversationContext, Intent } from '../context/types';
import { TimeParser } from '../../utils/TimeParser';

// Mock TimeParser
vi.mock('../../utils/TimeParser', () => ({
  TimeParser: {
    parseDatetime: vi.fn((date?: string, time?: string) => ({
      date: date || undefined,
      departureTime: time || undefined,
    })),
  },
}));

describe('contextManager', () => {
  describe('createContext', () => {
    it('should create context with correct sessionId', () => {
      const context = createContext('test-session-123');
      expect(context.sessionId).toBe('test-session-123');
    });

    it('should create context with default language "en"', () => {
      const context = createContext('test-session');
      expect(context.language).toBe('en');
    });

    it('should create context with custom language', () => {
      const context = createContext('test-session', 'de');
      expect(context.language).toBe('de');
    });

    it('should initialize with balanced travel style', () => {
      const context = createContext('test-session');
      expect(context.preferences.travelStyle).toBe('balanced');
    });

    it('should initialize empty location context', () => {
      const context = createContext('test-session');
      expect(context.location).toEqual({});
    });

    it('should initialize empty time context', () => {
      const context = createContext('test-session');
      expect(context.time).toEqual({});
    });

    it('should initialize empty intent history array', () => {
      const context = createContext('test-session');
      expect(context.intentHistory).toEqual([]);
      expect(Array.isArray(context.intentHistory)).toBe(true);
    });

    it('should initialize empty recentToolResults Map', () => {
      const context = createContext('test-session');
      expect(context.recentToolResults).toBeInstanceOf(Map);
      expect(context.recentToolResults.size).toBe(0);
    });

    it('should initialize empty mentionedPlaces array', () => {
      const context = createContext('test-session');
      expect(context.mentionedPlaces).toEqual([]);
      expect(Array.isArray(context.mentionedPlaces)).toBe(true);
    });

    it('should initialize empty mentionedTrips array', () => {
      const context = createContext('test-session');
      expect(context.mentionedTrips).toEqual([]);
      expect(Array.isArray(context.mentionedTrips)).toBe(true);
    });

    it('should set createdAt timestamp', () => {
      const before = new Date();
      const context = createContext('test-session');
      const after = new Date();
      
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(context.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should set lastUpdated timestamp', () => {
      const before = new Date();
      const context = createContext('test-session');
      const after = new Date();
      
      expect(context.lastUpdated).toBeInstanceOf(Date);
      expect(context.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(context.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('updateContextFromMessage', () => {
    let baseContext: ConversationContext;

    beforeEach(() => {
      baseContext = createContext('test-session', 'en');
      vi.clearAllMocks();
    });

    it('should update origin location', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {
        origin: 'Zurich',
      });

      expect(updated.location.origin).toEqual({ name: 'Zurich' });
    });

    it('should update destination location', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {
        destination: 'Bern',
      });

      expect(updated.location.destination).toEqual({ name: 'Bern' });
    });

    it('should update both origin and destination', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {
        origin: 'Zurich',
        destination: 'Bern',
      });

      expect(updated.location.origin).toEqual({ name: 'Zurich' });
      expect(updated.location.destination).toEqual({ name: 'Bern' });
    });

    it('should call TimeParser when date is provided', () => {
      updateContextFromMessage(baseContext, 'test message', {
        date: '2024-01-15',
      });

      expect(TimeParser.parseDatetime).toHaveBeenCalledWith('2024-01-15', undefined);
    });

    it('should call TimeParser when time is provided', () => {
      updateContextFromMessage(baseContext, 'test message', {
        time: '14:30',
      });

      expect(TimeParser.parseDatetime).toHaveBeenCalledWith(undefined, '14:30');
    });

    it('should call TimeParser when both date and time are provided', () => {
      updateContextFromMessage(baseContext, 'test message', {
        date: '2024-01-15',
        time: '14:30',
      });

      expect(TimeParser.parseDatetime).toHaveBeenCalledWith('2024-01-15', '14:30');
    });

    it('should update time context from TimeParser result', () => {
      const testDate = new Date('2024-01-15T14:30:00');
      vi.mocked(TimeParser.parseDatetime).mockReturnValueOnce({
        date: testDate,
        departureTime: testDate,
      });

      const updated = updateContextFromMessage(baseContext, 'test message', {
        date: '2024-01-15',
        time: '14:30',
      });

      expect(updated.time.date).toBe(testDate);
      expect(updated.time.departureTime).toBe(testDate);
    });

    it('should merge preferences without overwriting existing ones', () => {
      baseContext.preferences = {
        travelStyle: 'eco',
        transport: { bikeTransport: true },
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        preferences: {
          accessibility: { wheelchair: true },
        },
      });

      expect(updated.preferences).toEqual({
        travelStyle: 'eco',
        transport: { bikeTransport: true },
        accessibility: { wheelchair: true },
      });
    });

    it('should override existing preference values', () => {
      baseContext.preferences = {
        travelStyle: 'eco',
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        preferences: {
          travelStyle: 'fastest',
        },
      });

      expect(updated.preferences.travelStyle).toBe('fastest');
    });

    it('should add intent to history', () => {
      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.9,
        extractedEntities: {},
        timestamp: new Date(),
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        intent,
      });

      expect(updated.intentHistory).toHaveLength(1);
      expect(updated.intentHistory[0]).toEqual(intent);
    });

    it('should set currentIntent', () => {
      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.9,
        extractedEntities: {},
        timestamp: new Date(),
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        intent,
      });

      expect(updated.currentIntent).toEqual(intent);
    });

    it('should limit intent history to 10 items', () => {
      // Fill with 10 intents
      for (let i = 0; i < 10; i++) {
        baseContext.intentHistory.push({
          type: 'trip_planning',
          confidence: 0.9,
          extractedEntities: {},
          timestamp: new Date(),
        });
      }

      const newIntent: Intent = {
        type: 'weather_check',
        confidence: 0.8,
        extractedEntities: {},
        timestamp: new Date(),
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        intent: newIntent,
      });

      expect(updated.intentHistory).toHaveLength(10);
      expect(updated.intentHistory[9]).toEqual(newIntent);
      expect(updated.intentHistory[0].type).toBe('trip_planning');
    });

    it('should keep most recent 10 intents when history exceeds limit', () => {
      // Fill with 11 intents
      for (let i = 0; i < 11; i++) {
        baseContext.intentHistory.push({
          type: 'trip_planning',
          confidence: 0.9,
          extractedEntities: {},
          timestamp: new Date(),
          segment: `intent-${i}`,
        });
      }

      const newIntent: Intent = {
        type: 'weather_check',
        confidence: 0.8,
        extractedEntities: {},
        timestamp: new Date(),
        segment: 'intent-new',
      };

      const updated = updateContextFromMessage(baseContext, 'test message', {
        intent: newIntent,
      });

      expect(updated.intentHistory).toHaveLength(10);
      // First intent should be intent-2 (intent-0 and intent-1 removed)
      expect(updated.intentHistory[0].segment).toBe('intent-2');
      // Last intent should be the new one
      expect(updated.intentHistory[9]).toEqual(newIntent);
    });

    it('should update lastUpdated timestamp', () => {
      const before = new Date();
      const updated = updateContextFromMessage(baseContext, 'test message', {
        origin: 'Zurich',
      });
      const after = new Date();

      expect(updated.lastUpdated).toBeInstanceOf(Date);
      expect(updated.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(updated.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle empty extracted data gracefully', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {});

      expect(updated.sessionId).toBe(baseContext.sessionId);
      expect(updated.language).toBe(baseContext.language);
      expect(updated.location).toEqual(baseContext.location);
      expect(updated.time).toEqual(baseContext.time);
    });

    it('should handle partial updates', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {
        origin: 'Zurich',
        // No destination, date, time, preferences, or intent
      });

      expect(updated.location.origin).toEqual({ name: 'Zurich' });
      expect(updated.location.destination).toBeUndefined();
      expect(updated.time.date).toBeUndefined();
      expect(updated.currentIntent).toBeUndefined();
    });

    it('should create new context object (shallow copy)', () => {
      const updated = updateContextFromMessage(baseContext, 'test message', {
        origin: 'Zurich',
        preferences: { travelStyle: 'fastest' },
      });

      // Should be a different object
      expect(updated).not.toBe(baseContext);
      // But nested objects are shallow copied, so they may be mutated
      expect(updated.location.origin).toEqual({ name: 'Zurich' });
      expect(updated.preferences.travelStyle).toBe('fastest');
    });

    it('should preserve existing data when updating', () => {
      baseContext.location.origin = { name: 'Geneva' };
      baseContext.preferences.travelStyle = 'eco';

      const updated = updateContextFromMessage(baseContext, 'test message', {
        destination: 'Bern',
      });

      expect(updated.location.origin).toEqual({ name: 'Geneva' });
      expect(updated.location.destination).toEqual({ name: 'Bern' });
      expect(updated.preferences.travelStyle).toBe('eco');
    });
  });
});
