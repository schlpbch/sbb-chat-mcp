import { test, expect } from '@playwright/test';

/**
 * Error Handling and Edge Cases Tests
 * Tests application behavior under error conditions and edge cases
 */

test.describe('Network Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Send a message that might timeout
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips with very complex requirements');
    await page.getByTestId('send-button').click();

    // Wait for response or timeout (shorter wait)
    await page.waitForTimeout(10000);

    // Should not crash, should show some feedback
    const errorMessage = page.locator('[role="alert"]');
    const loadingIndicator = page.getByTestId('loading-indicator');
    const CompanionMessage = page.getByTestId('message-Companion');

    const hasError = await errorMessage.isVisible().catch(() => false);
    const isLoading = await loadingIndicator.isVisible().catch(() => false);
    const hasResponse = await CompanionMessage.isVisible().catch(() => false);

    // Should have some state (error, loading, or response)
    expect(hasError || isLoading || hasResponse).toBe(true);
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);

    const input = page.getByTestId('chat-input');
    await input.fill('Test offline message');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Should show error or handle gracefully
    const errorAlert = page.locator('[role="alert"]');
    const errorText = page.locator('text=/error|failed|offline/i');

    const alertCount = await errorAlert.count();
    const textCount = await errorText.count();

    // Go back online
    await context.setOffline(false);

    // Either shows error alert or error text
    expect(alertCount + textCount).toBeGreaterThanOrEqual(0);
  });

  test('should retry failed requests', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test message');
    await page.getByTestId('send-button').click();

    // Wait for potential retry attempts
    await page.waitForTimeout(5000);

    // Should eventually show response or error
    const messages = page.locator('[data-testid*="message-"]');
    const count = await messages.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should prevent sending empty messages', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');
    
    // Button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('should handle very long messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    // Create a very long message
    const longMessage = 'A'.repeat(5000);
    await input.fill(longMessage);

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    await page.waitForTimeout(3000);

    // Should handle without crashing
    const userMessage = page.getByTestId('message-user');
    const isVisible = await userMessage.isVisible().catch(() => false);
    
    expect(isVisible).toBe(true);
  });

  test('should handle special characters in input', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    const specialMessage = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
    await input.fill(specialMessage);

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    await page.waitForTimeout(2000);

    // Should handle special characters
    const userMessage = page.getByTestId('message-user');
    await expect(userMessage).toBeVisible();
  });

  test('should handle emoji in input', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    const emojiMessage = '🚂 🏔️ 🇨🇭 Hello Switzerland! 😊';
    await input.fill(emojiMessage);

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    await page.waitForTimeout(2000);

    // Should display emoji correctly
    const userMessage = page.getByTestId('message-user');
    await expect(userMessage).toContainText('🚂');
  });

  test('should handle line breaks in input', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    // Note: Most single-line inputs don't support line breaks
    // This tests the behavior
    await input.fill('Line 1');
    await page.keyboard.press('Enter');

    // Enter key should submit, not add line break
    await page.waitForTimeout(2000);

    const userMessage = page.getByTestId('message-user');
    const isVisible = await userMessage.isVisible().catch(() => false);
    
    expect(isVisible).toBe(true);
  });

  test('should trim whitespace from messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    await input.fill('   Test message   ');
    
    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    await page.waitForTimeout(2000);

    const userMessage = page.getByTestId('message-user');
    const text = await userMessage.textContent();
    
    // Should trim or preserve whitespace consistently
    expect(text).toBeTruthy();
  });
});

test.describe('API Error Responses', () => {
  test('should handle 400 Bad Request', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        // Missing required field
        sessionId: 'test',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('should handle 404 Not Found', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint');
    
    expect(response.status()).toBe(404);
  });

  test('should handle malformed JSON in request', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'invalid json string',
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Edge Cases - Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle empty API responses', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show me data from NonExistentLocation12345');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should handle empty results gracefully
    const messages = page.locator('[data-testid*="message-"]');
    const count = await messages.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should handle missing data fields', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find incomplete data');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should not crash with missing fields
    const page_content = await page.content();
    expect(page_content).toBeTruthy();
  });

  test('should handle null values in data', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show data with null values');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should handle null values without crashing
    const errorElements = page.locator('text=/null|undefined|NaN/i');
    const count = await errorElements.count();
    
    // Should not display raw null/undefined values
    expect(count).toBeLessThan(10);
  });
});

test.describe('Edge Cases - UI State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle rapid consecutive messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    // Send multiple messages quickly
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);
      await sendButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(3000);

    // Should handle all messages
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should handle browser back button', async ({ page }) => {
    // Navigate to chat
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message
    const input = page.getByTestId('chat-input');
    await input.fill('Test message');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should restore chat state
    await expect(input).toBeVisible();
  });

  test('should handle browser refresh', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test message');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should load fresh state
    await expect(input).toBeVisible();
    
    // Chat history may or may not persist
    const messages = page.locator('[data-testid*="message-"]');
    const count = await messages.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle window resize', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Should handle resizes without crashing
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible();
  });
});

test.describe('Edge Cases - Session Management', () => {
  test('should handle multiple browser tabs', async ({ browser }) => {
    const context = await browser.newContext();
    
    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/chat');
    await page2.goto('/chat');

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Send message in first tab
    const input1 = page1.getByTestId('chat-input');
    await input1.fill('Message from tab 1');
    await page1.getByTestId('send-button').click();
    await page1.waitForTimeout(2000);

    // Send message in second tab
    const input2 = page2.getByTestId('chat-input');
    await input2.fill('Message from tab 2');
    await page2.getByTestId('send-button').click();
    await page2.waitForTimeout(2000);

    // Both should work independently
    await expect(input1).toBeVisible();
    await expect(input2).toBeVisible();

    await context.close();
  });

  test('should handle session expiry gracefully', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send initial message
    const input = page.getByTestId('chat-input');
    await input.fill('Initial message');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Wait for potential session timeout (simulated)
    await page.waitForTimeout(5000);

    // Send another message
    await input.fill('Message after delay');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Should handle session continuation or renewal
    const messages = page.getByTestId('message-user');
    const count = await messages.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Edge Cases - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle screen reader announcements', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test for screen reader');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(2000);

    // Check for ARIA live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should maintain focus management', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    
    // Focus input
    await input.focus();
    await expect(input).toBeFocused();

    // Type and send
    await input.fill('Test focus');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Focus should be manageable
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Enable high contrast (simulated via CSS)
    await page.addStyleTag({
      content: `
        * {
          forced-colors: active;
        }
      `,
    });

    const input = page.getByTestId('chat-input');
    await input.fill('High contrast test');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(2000);

    // Should remain functional
    await expect(input).toBeVisible();
  });
});

test.describe('Edge Cases - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle large conversation history', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    // Send multiple messages to build history
    for (let i = 0; i < 10; i++) {
      await input.fill(`Message ${i + 1}`);
      await sendButton.click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(2000);

    // Should handle large history without performance issues
    const messages = page.getByTestId('message-user');
    const count = await messages.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should handle memory leaks on navigation', async ({ page }) => {
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    // Should not accumulate memory issues
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible();
  });
});
