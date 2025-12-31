/**
 * Tests for Session Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSessionContext,
  setSessionContext,
  clearSessionContext,
  clearAllSessions,
} from '../sessionManager';
import type { ConversationContext } from '../contextManager';

describe('sessionManager', () => {
  beforeEach(() => {
    // Clear all sessions before each test
    clearAllSessions();
  });

  describe('getSessionContext', () => {
    it('should create a new context for a new session', () => {
      const context = getSessionContext('session-1', 'en');

      expect(context).toBeDefined();
      expect(context.sessionId).toBe('session-1');
      expect(context.language).toBe('en');
      expect(context.preferences).toBeDefined();
      expect(context.intentHistory).toEqual([]);
    });

    it('should retrieve existing context for known session', () => {
      const context1 = getSessionContext('session-2', 'de');
      const context2 = getSessionContext('session-2', 'de');

      expect(context1).toBe(context2);
      expect(context1.sessionId).toBe('session-2');
    });

    it('should update language on existing session', () => {
      const context1 = getSessionContext('session-3', 'en');
      expect(context1.language).toBe('en');

      const context2 = getSessionContext('session-3', 'fr');
      expect(context2.language).toBe('fr');
      expect(context1).toBe(context2); // Same object reference
    });

    it('should use default language "en" if not specified', () => {
      const context = getSessionContext('session-4');
      expect(context.language).toBe('en');
    });

    it('should create separate contexts for different sessions', () => {
      const context1 = getSessionContext('session-5', 'en');
      const context2 = getSessionContext('session-6', 'de');

      expect(context1).not.toBe(context2);
      expect(context1.sessionId).toBe('session-5');
      expect(context2.sessionId).toBe('session-6');
    });
  });

  describe('setSessionContext', () => {
    it('should set a custom context for a session', () => {
      const customContext: ConversationContext = {
        sessionId: 'custom-session',
        language: 'it',
        createdAt: new Date(),
        lastUpdated: new Date(),
        preferences: {
          travelStyle: 'eco',
        },
        location: {
          origin: { name: 'Zurich' },
        },
        time: {},
        intentHistory: [],
        recentToolResults: new Map(),
        mentionedPlaces: [],
        mentionedTrips: [],
      };

      setSessionContext('custom-session', customContext);
      const retrieved = getSessionContext('custom-session');

      expect(retrieved).toBe(customContext);
      expect(retrieved.preferences.travelStyle).toBe('eco');
      expect(retrieved.location.origin?.name).toBe('Zurich');
    });

    it('should overwrite existing context', () => {
      const context1 = getSessionContext('session-7', 'en');
      context1.preferences.travelStyle = 'fast';

      const newContext: ConversationContext = {
        sessionId: 'session-7',
        language: 'de',
        createdAt: new Date(),
        lastUpdated: new Date(),
        preferences: {
          travelStyle: 'balanced',
        },
        location: {},
        time: {},
        intentHistory: [],
        recentToolResults: new Map(),
        mentionedPlaces: [],
        mentionedTrips: [],
      };

      setSessionContext('session-7', newContext);
      const retrieved = getSessionContext('session-7');

      expect(retrieved).toBe(newContext);
      expect(retrieved.preferences.travelStyle).toBe('balanced');
    });
  });

  describe('clearSessionContext', () => {
    it('should remove a specific session context', () => {
      const context1 = getSessionContext('session-8', 'en');
      const context2 = getSessionContext('session-9', 'de');

      clearSessionContext('session-8');

      // session-8 should be recreated as new
      const newContext1 = getSessionContext('session-8', 'en');
      expect(newContext1).not.toBe(context1);

      // session-9 should still be the same
      const sameContext2 = getSessionContext('session-9', 'de');
      expect(sameContext2).toBe(context2);
    });

    it('should handle clearing non-existent session gracefully', () => {
      expect(() => clearSessionContext('non-existent')).not.toThrow();
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all session contexts', () => {
      const context1 = getSessionContext('session-10', 'en');
      const context2 = getSessionContext('session-11', 'de');
      const context3 = getSessionContext('session-12', 'fr');

      clearAllSessions();

      // All sessions should be recreated as new
      const newContext1 = getSessionContext('session-10', 'en');
      const newContext2 = getSessionContext('session-11', 'de');
      const newContext3 = getSessionContext('session-12', 'fr');

      expect(newContext1).not.toBe(context1);
      expect(newContext2).not.toBe(context2);
      expect(newContext3).not.toBe(context3);
    });

    it('should work when no sessions exist', () => {
      expect(() => clearAllSessions()).not.toThrow();
    });
  });
});
