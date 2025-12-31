/**
 * Streaming ChatPanel E2E Tests
 *
 * Run with: pnpm run test streaming-chat-panel.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Streaming ChatPanel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the MAP page (where ChatPanel is used)
    await page.goto('http://localhost:3000/map');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Open the ChatPanel - look for chat toggle button
    // The button is controlled by onChatToggle in Navbar
    const chatButton = page.locator('[aria-label*="chat" i], button:has-text("Chat")').first();
    await chatButton.click();

    // Wait for panel to be visible
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
  });

  test('should display ChatPanel when opened', async ({ page }) => {
    // Verify panel elements
    await expect(page.locator('text=SBB Companion')).toBeVisible();
    await expect(page.locator('text=Grüezi!')).toBeVisible();

    // Verify input is present
    await expect(page.locator('textarea, input[type="text"]')).toBeVisible();
  });

  test('should send message and receive streaming response', async ({ page }) => {
    // Type and send a simple message
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Hello');

    // Submit (look for send button or press Enter)
    await page.keyboard.press('Enter');

    // Wait for user message to appear
    await expect(page.locator('text=Hello').first()).toBeVisible();

    // Wait for companion response (should stream in)
    await page.waitForSelector('[data-testid="streaming-markdown-card"], text=/Grüezi|Hello|Hi/', {
      timeout: 10000
    });

    // Verify response is visible
    const responses = page.locator('[role="log"] > div');
    await expect(responses).toHaveCount(2, { timeout: 15000 }); // User + Companion
  });

  test('should show skeleton for tool execution', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Find station Zurich HB');
    await page.keyboard.press('Enter');

    // Wait for user message
    await expect(page.locator('text=Find station Zurich HB')).toBeVisible();

    // Check for skeleton (animated pulse)
    const skeleton = page.locator('.animate-pulse').first();

    // Skeleton should appear briefly
    await expect(skeleton).toBeVisible({ timeout: 5000 });

    // Wait for actual card to replace skeleton
    await page.waitForSelector('[data-testid="station-card"]', {
      timeout: 10000,
      state: 'visible'
    });

    // Verify skeleton is gone (replaced by card)
    await expect(page.locator('[data-testid="station-card"]')).toBeVisible();
  });

  test('should handle multiple tool calls with skeletons', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Show trips to Zurich and weather in Bern');
    await page.keyboard.press('Enter');

    // Wait for user message
    await expect(page.locator('text=/trips.*Zurich.*weather.*Bern/i')).toBeVisible();

    // Multiple skeletons should appear
    await page.waitForSelector('.animate-pulse', { timeout: 5000 });

    // Wait for cards to appear
    await page.waitForSelector('[data-testid="trip-card"], [data-testid="weather-card"]', {
      timeout: 15000,
      state: 'visible'
    });

    // Verify at least one card is visible
    const cards = page.locator('[data-testid$="-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should show typing indicator during streaming', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Tell me about Swiss railways');
    await page.keyboard.press('Enter');

    // Look for "Thinking..." or animated dots
    const thinkingIndicator = page.locator('text=/Thinking|Loading/i, .animate-bounce').first();

    // Should appear briefly while waiting for response
    await expect(thinkingIndicator).toBeVisible({ timeout: 3000 });
  });

  test('should disable input while streaming', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Hello');
    await page.keyboard.press('Enter');

    // Input should be disabled during streaming
    await expect(input).toBeDisabled({ timeout: 2000 });

    // Wait for response to complete
    await page.waitForTimeout(3000);

    // Input should be enabled again
    await expect(input).toBeEnabled({ timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('This should fail');
    await page.keyboard.press('Enter');

    // Wait for error message
    await page.waitForSelector('text=/error|network|connection/i', { timeout: 5000 });

    // Verify error is visible
    await expect(page.locator('text=/No internet|network|connection/i')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
  });

  test('should clear chat history', async ({ page }) => {
    // Send a message first
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Test message');
    await page.keyboard.press('Enter');

    // Wait for message to appear
    await expect(page.locator('text=Test message')).toBeVisible();

    // Click clear/trash button
    const clearButton = page.locator('[aria-label="Clear chat history"]');
    await clearButton.click();

    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Page should reload and show empty state
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Grüezi!')).toBeVisible();
  });

  test('should close panel with escape key', async ({ page }) => {
    // Panel should be open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Panel should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
  });

  test('should close panel with close button', async ({ page }) => {
    // Panel should be open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Click close button (X)
    const closeButton = page.locator('[aria-label="Close chat"]');
    await closeButton.click();

    // Panel should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Streaming Visual Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[aria-label="Open chat"]').catch(() =>
      page.click('button:has-text("Chat")')
    );
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  });

  test('should show animated cursor during text streaming', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Hello');
    await page.keyboard.press('Enter');

    // Look for blinking cursor (animated element)
    const cursor = page.locator('.animate-pulse').filter({ hasText: '' }).first();

    // Cursor should appear during streaming
    await expect(cursor).toBeVisible({ timeout: 3000 });
  });

  test('should auto-scroll to bottom on new messages', async ({ page }) => {
    // Send multiple messages to test scroll
    const input = page.locator('textarea, input[type="text"]').first();

    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Last message should be visible (scrolled to bottom)
    await expect(page.locator('text=Message 3')).toBeVisible();
  });
});

test.describe('Streaming Performance', () => {
  test('should handle rapid messages without crashes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[aria-label="Open chat"]').catch(() =>
      page.click('button:has-text("Chat")')
    );
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const input = page.locator('textarea, input[type="text"]').first();

    // Send 3 messages rapidly (second message should abort first stream)
    await input.fill('First message');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);

    await input.fill('Second message');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);

    await input.fill('Third message');
    await page.keyboard.press('Enter');

    // All messages should appear
    await expect(page.locator('text=First message')).toBeVisible();
    await expect(page.locator('text=Second message')).toBeVisible();
    await expect(page.locator('text=Third message')).toBeVisible();

    // No console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });
});
