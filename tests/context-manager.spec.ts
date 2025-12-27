import { test, expect } from '@playwright/test';

/**
 * Tests for the context manager functionality
 * These tests verify session handling, preference tracking, and reference resolution
 */

test.describe('Context Manager - Session Handling', () => {
  test('should generate unique session IDs for each chat page visit', async ({
    page,
  }) => {
    // Visit chat page
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Get session ID from network request when sending a message
    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );
    await input.fill('Hello');

    // Capture the request
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );

    await page.locator('button:has-text("Send")').click();
    const request = await requestPromise;
    const body1 = request.postDataJSON();

    expect(body1.sessionId).toBeDefined();
    expect(body1.sessionId).toMatch(/^session-\d+-[a-z0-9]+$/);

    // Reload page for new session
    await page.reload();
    await page.waitForLoadState('networkidle');

    await input.fill('Hello again');

    const requestPromise2 = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );

    await page.locator('button:has-text("Send")').click();
    const request2 = await requestPromise2;
    const body2 = request2.postDataJSON();

    // New page should have different session ID
    expect(body2.sessionId).toBeDefined();
    expect(body2.sessionId).not.toBe(body1.sessionId);
  });

  test('should maintain same session ID across multiple messages', async ({
    page,
  }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );

    // Send first message
    await input.fill('First message');
    const request1Promise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );
    await page.locator('button:has-text("Send")').click();
    const request1 = await request1Promise;
    const body1 = request1.postDataJSON();

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes('/api/llm/chat'),
      { timeout: 30000 }
    ).catch(() => {});

    // Send second message
    await input.fill('Second message');
    const request2Promise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );
    await page.locator('button:has-text("Send")').click();
    const request2 = await request2Promise;
    const body2 = request2.postDataJSON();

    // Same session ID
    expect(body2.sessionId).toBe(body1.sessionId);
  });
});

test.describe('Context Manager - Orchestration Flag', () => {
  test('should send useOrchestration=true by default', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );
    await input.fill('Test message');

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );

    await page.locator('button:has-text("Send")').click();
    const request = await requestPromise;
    const body = request.postDataJSON();

    expect(body.useOrchestration).toBe(true);
  });

  test('should include language context from navbar', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );
    await input.fill('Test message');

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );

    await page.locator('button:has-text("Send")').click();
    const request = await requestPromise;
    const body = request.postDataJSON();

    expect(body.context).toBeDefined();
    expect(body.context.language).toBeDefined();
  });
});

test.describe('Context Manager - Message History', () => {
  test('should send conversation history with each message', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );

    // Send first message
    await input.fill('First message');
    const request1Promise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );
    await page.locator('button:has-text("Send")').click();
    const request1 = await request1Promise;
    const body1 = request1.postDataJSON();

    // First message should have empty history
    expect(body1.history).toEqual([]);

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes('/api/llm/chat'),
      { timeout: 30000 }
    ).catch(() => {});

    // Wait a bit for UI to update
    await page.waitForTimeout(1000);

    // Send second message
    await input.fill('Second message');
    const request2Promise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );
    await page.locator('button:has-text("Send")').click();
    const request2 = await request2Promise;
    const body2 = request2.postDataJSON();

    // Second message should include history
    expect(body2.history.length).toBeGreaterThan(0);
    expect(body2.history[0].role).toBe('user');
    expect(body2.history[0].content).toBe('First message');
  });
});

test.describe('Context Manager - Quick Start Buttons', () => {
  const quickStartButtons = [
    { text: 'Connections to Bern', expected: 'Find next connections from Zurich HB to Bern' },
    { text: 'Eco Impact: Geneva', expected: 'What is the environmental impact of a trip to Geneva?' },
    { text: 'Basel Departures', expected: 'Show me departures from Basel SBB' },
    { text: 'Nearby Stations', expected: 'Stations near my current location' },
  ];

  for (const button of quickStartButtons) {
    test(`should populate input for: ${button.text}`, async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      await page.locator(`button:has-text("${button.text}")`).click();

      const input = page.locator(
        'input[placeholder="Ask me about Swiss public transport..."]'
      );
      await expect(input).toHaveValue(button.expected);
    });
  }
});

test.describe('Context Manager - Language Support', () => {
  test('should include language context in requests', async ({
    page,
  }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message and check language context is included
    const input = page.locator(
      'input[placeholder="Ask me about Swiss public transport..."]'
    );
    await input.fill('Test');

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/llm/chat') && request.method() === 'POST'
    );

    await page.locator('button:has-text("Send")').click();
    const request = await requestPromise;
    const body = request.postDataJSON();

    // Language should be in context
    expect(body.context.language).toBeDefined();
  });
});
