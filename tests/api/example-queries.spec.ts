import { test, expect } from '@playwright/test';
import { exampleQueries } from '../../src/lib/exampleQueries';

/**
 * Example Queries Test Suite
 * Automatically verifies that all "Example Queries" displayed on the welcome page
 * work correctly when sent to the Chat API.
 */

test.describe('Chat API - Example Queries Batch', () => {
  test.setTimeout(60000);

  exampleQueries.forEach((example) => {
    test(`should handle example query: ${example.id} - "${
      example.text.en.split('\n')[0]
    }..."`, async ({ request }) => {
      // Use a consistent session per category or a new one to simulate clean state
      const sessionId = `test-example-${example.id}-${Date.now()}`;

      const response = await request.post('/api/llm/chat', {
        data: {
          message: example.text.en,
          sessionId,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      // Status should be 200
      expect(response.status(), `Failed on query: ${example.text.en}`).toBe(
        200
      );

      const data = await response.json();

      // Basic response structure check
      expect(data.response).toBeDefined();
      expect(typeof data.response).toBe('string');

      // Category-specific assertions
      if (example.category === 'trips') {
        // Should likely have findTrips tool call
        const tripCalls = data.toolCalls?.filter(
          (tc: any) => tc.toolName === 'findTrips'
        );
        expect(
          tripCalls?.length || 0,
          `Expected trip tool call for: ${example.text.en}`
        ).toBeGreaterThan(0);
      }

      if (example.category === 'weather') {
        // Should have weather or snow tool calls
        const weatherCalls = data.toolCalls?.filter(
          (tc: any) =>
            tc.toolName === 'getWeather' || tc.toolName === 'getSnowConditions'
        );
        expect(
          weatherCalls?.length || 0,
          `Expected weather tool call for: ${example.text.en}`
        ).toBeGreaterThan(0);
      }

      if (example.category === 'stations') {
        // Should have place info or events tool calls
        const stationCalls = data.toolCalls?.filter(
          (tc: any) =>
            tc.toolName === 'getPlaceEvents' ||
            tc.toolName === 'findStopPlacesByName'
        );
        expect(
          stationCalls?.length || 0,
          `Expected station tool call for: ${example.text.en}`
        ).toBeGreaterThan(0);
      }

      if (example.category === 'markdown') {
        // Markdown queries are often multi-part or complex, check if we got ANY tool calls
        expect(
          data.toolCalls?.length || 0,
          `Expected at least one tool call for complex markdown query: ${example.text.en}`
        ).toBeGreaterThan(0);
      }
    });
  });
});
