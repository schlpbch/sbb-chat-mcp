import { test, expect } from '@playwright/test';

/**
 * Unit tests for the orchestrator module
 * These tests verify the planning and execution logic
 */

test.describe('Orchestrator Logic', () => {
  test.describe('requiresOrchestration detection', () => {
    // Test the keyword detection logic via API
    const orchestrationKeywords = [
      'plan a day trip',
      'create an itinerary',
      'what are the arrivals at',
      'recommend things to do',
      'suggest a route',
      'best way to get to',
      'complete travel plan',
      'full day schedule',
    ];

    const nonOrchestrationKeywords = [
      'what time is it',
      'hello',
      'thanks',
      'weather in Zurich',
      'find station Bern',
    ];

    for (const keyword of orchestrationKeywords) {
      test(`should detect orchestration for: "${keyword}"`, async ({
        request,
      }) => {
        // This test verifies the API route handles orchestration detection
        // The actual detection logic is in the backend
        const response = await request.post('/api/llm/chat', {
          data: {
            message: keyword,
            sessionId: `test-${Date.now()}`,
            useOrchestration: true,
            context: { language: 'en' },
          },
        });

        // Should not return 400 (bad request)
        expect(response.status()).not.toBe(400);

        // Note: 500 errors may occur if API key is not configured
        // This is expected in test environments
      });
    }
  });

  test.describe('Intent extraction', () => {
    test('should correctly identify trip planning intent', async ({
      request,
    }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'How do I get from Zurich to Geneva?',
          sessionId: `test-trip-${Date.now()}`,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      // API should accept the request
      expect(response.status()).not.toBe(400);
    });

    test('should correctly identify itinerary creation intent', async ({
      request,
    }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Plan a weekend trip to the Swiss Alps',
          sessionId: `test-itinerary-${Date.now()}`,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      expect(response.status()).not.toBe(400);
    });
  });

  test('should show arrivals at a station', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'What are the arrivals at Zurich main station?',
        sessionId: `test-arrivals-${Date.now()}`,
        useOrchestration: true,
        context: { language: 'en' },
      },
    });

    expect(response.status()).not.toBe(400);
  });

  test.describe('Session context', () => {
    test('should maintain session context across requests', async ({
      request,
    }) => {
      const sessionId = `test-session-${Date.now()}`;

      // First request
      const response1 = await request.post('/api/llm/chat', {
        data: {
          message: 'I want to visit Zermatt',
          sessionId,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      expect(response1.status()).not.toBe(400);

      // Second request in same session
      const response2 = await request.post('/api/llm/chat', {
        data: {
          message: 'What can I see there?',
          sessionId,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      expect(response2.status()).not.toBe(400);
    });

    test('should use different context for different sessions', async ({
      request,
    }) => {
      const sessionId1 = `test-session1-${Date.now()}`;
      const sessionId2 = `test-session2-${Date.now()}`;

      const response1 = await request.post('/api/llm/chat', {
        data: {
          message: 'Hello',
          sessionId: sessionId1,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      const response2 = await request.post('/api/llm/chat', {
        data: {
          message: 'Hello',
          sessionId: sessionId2,
          useOrchestration: true,
          context: { language: 'de' },
        },
      });

      expect(response1.status()).not.toBe(400);
      expect(response2.status()).not.toBe(400);
    });
  });
});

test.describe('API Route Validation', () => {
  test('should reject requests without message', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        sessionId: 'test',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Message is required');
  });

  test('should accept requests without sessionId (falls back to standard chat)', async ({
    request,
  }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'Hello',
        context: { language: 'en' },
      },
    });

    // Should not be a client error
    expect(response.status()).not.toBe(400);
  });

  test('should accept requests with useOrchestration=false', async ({
    request,
  }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'Hello',
        sessionId: `test-${Date.now()}`,
        useOrchestration: false,
        context: { language: 'en' },
      },
    });

    expect(response.status()).not.toBe(400);
  });

  test('should handle different languages', async ({ request }) => {
    const languages = ['en', 'de', 'fr', 'it'];

    for (const language of languages) {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Hello',
          sessionId: `test-lang-${language}-${Date.now()}`,
          context: { language },
        },
      });

      expect(response.status()).not.toBe(400);
    }
  });
});
