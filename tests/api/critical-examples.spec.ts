import { test, expect } from '@playwright/test';

/**
 * Critical User Journey Examples Test Suite
 * Tests the 6 most common/critical example queries to ensure no regressions.
 */

const criticalExamples = [
  {
    id: 'trip-simple',
    text: 'Find trains from Zurich to Bern tomorrow at 9am00',
    description: 'Simple specific trip (tomorrow morning)' // "9am" might need normalization support which I added
  },
  {
    id: 'trip-fastest',
    text: 'Fastest route from Geneva to Lugano',
    description: 'Abstract trip query'
  },
  {
    id: 'weather',
    text: "What's the weather in St. Moritz?",
    description: 'Weather query'
  },
  {
    id: 'station-departures',
    text: 'Show departures from Zurich HB',
    description: 'Live departure board'
  },
  {
    id: 'markdown-formatted',
    text: 'Find trains from **Zurich HB** to **Bern**\n- Direct only', // Markdown stripping test
    description: 'Markdown formatted query'
  },

];

test.describe('Chat API - Critical Examples Regression Test', () => {
  test.setTimeout(60000); // 1 minute timeout per test

  for (const example of criticalExamples) {
    test(`should handle: ${example.description}`, async ({ request }) => {
      console.log(`Testing: ${example.text}`);
      
      const response = await request.post('/api/llm/chat', {
        data: {
          message: example.text,
          sessionId: `test-crit-${example.id}-${Date.now()}`,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      const body = await response.json();
      
      if (response.status() !== 200) {
          console.error(`FAILED: ${example.text}`, body);
      }

      expect(response.status()).toBe(200);
      expect(body.toolCalls).toBeDefined();
      expect(body.toolCalls.length).toBeGreaterThan(0);
      
      // Additional specific checks
      if (example.id.includes('trip')) {
          expect(body.toolCalls.some((tc: any) => tc.toolName === 'findTrips')).toBe(true);
      }
      if (example.id.includes('weather')) {
          expect(body.toolCalls.some((tc: any) => tc.toolName === 'getWeather' || tc.toolName === 'getSnowConditions')).toBe(true);
      }
      if (example.id.includes('station')) {
          expect(body.toolCalls.some((tc: any) => tc.toolName === 'getPlaceEvents' || tc.toolName === 'findStopPlacesByName')).toBe(true);
      }
    });
  }
});
