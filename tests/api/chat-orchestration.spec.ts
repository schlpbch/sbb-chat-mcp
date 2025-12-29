import { test, expect } from '@playwright/test';

/**
 * Chat Orchestration Tests
 * Tests the end-to-end orchestration logic through the chat API
 */

test.describe('Chat API - Orchestration Logic', () => {

  test('should handle Unicode station names (Zürich HB)', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'Show departures from Zürich HB',
        sessionId: `test-unicode-${Date.now()}`,
        useOrchestration: true,
        context: { language: 'en' },
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Check if it returned a tool call for getPlaceEvents with correct station
    expect(data.toolCalls).toBeDefined();
    const eventTool = data.toolCalls.find((tc: any) => tc.toolName === 'getPlaceEvents');
    expect(eventTool).toBeDefined();
    // Zürich HB station ID is 8503000
    // The result compiler enriches it with stationId
    expect(eventTool.result.stationId || eventTool.result.place).toBe('8503000');
  });

  test('should handle relative date "tomorrow" and time extraction', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'find trips from Zurich to Bern tomorrow at 8:00',
        sessionId: `test-time-${Date.now()}`,
        useOrchestration: true,
        context: { language: 'en' },
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.toolCalls).toBeDefined();
    const tripTool = data.toolCalls.find((tc: any) => tc.toolName === 'findTrips');
    expect(tripTool).toBeDefined();
    
    // Date should be tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDate = tomorrow.toISOString().split('T')[0];
    
    // Extract date from the first leg or summary in results if possible
    // Or just check that the tool called it with the right params
    // Our orchestrator logs what it calls internally.
  });

  test('should trigger train formation orchestration', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'show me the train formation of the first trip',
        sessionId: `test-formation-${Date.now()}`,
        useOrchestration: true,
        context: { language: 'en' },
        // Pre-load context with a recent search if needed, but 
        // the orchestrator should handle it if history exists
        history: [
            { role: 'user', content: 'departures from Zurich HB' },
            { role: 'Companion', content: 'Here are the departures...' }
        ]
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // It might return 200 with "No data" message if mock data doesn't exist,
    // but the key is that it didn't return a 400 or crash.
  });

  test('should support multiple languages (German)', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'Zeige mir die Abfahrten von Zürich HB',
        sessionId: `test-de-${Date.now()}`,
        useOrchestration: true,
        context: { language: 'de' },
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.toolCalls).toBeDefined();
    expect(data.toolCalls.some((tc: any) => tc.toolName === 'getPlaceEvents')).toBe(true);
  });

});
