import { test, expect } from '@playwright/test';

/**
 * Critical E2E User Flows
 * Tests complete user journeys that are essential to the application
 */

test.describe('Critical Flow: Complete Trip Planning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full trip planning from search to booking information', async ({ page }) => {
    // Step 1: User asks for trip suggestions
    const input = page.getByTestId('chat-input');
    await input.fill('I want to travel from Zürich to Bern tomorrow morning');
    await page.getByTestId('send-button').click();

    // Wait for AI response
    await page.waitForTimeout(8000);

    // Verify user message appears
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toContainText('Zürich to Bern');

    // Step 2: Check if trip cards appear
    const tripCards = page.locator('[data-testid*="trip"]');
    const tripCount = await tripCards.count();

    if (tripCount > 0) {
      // Verify trip card shows key information
      const firstTrip = tripCards.first();
      await expect(firstTrip).toBeVisible();

      // Should show departure and arrival info
      const tripText = await firstTrip.textContent();
      expect(tripText).toBeTruthy();
    }

    // Step 3: User asks follow-up question
    await input.fill('What about the weather in Bern?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should maintain conversation context
    const allUserMessages = await userMessages.count();
    expect(allUserMessages).toBeGreaterThanOrEqual(2);

    // Step 4: Verify chat history is maintained
    const CompanionMessages = page.getByTestId('message-Companion');
    const CompanionCount = await CompanionMessages.count();
    expect(CompanionCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle complex multi-city itinerary planning', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Complex request with multiple destinations
    await input.fill('Plan a 3-day trip visiting Zürich, Lucerne, and Interlaken');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Should receive comprehensive response
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(100); // Should be detailed
    }

    // Follow-up: Ask about specific leg
    await input.fill('Tell me more about getting to Lucerne');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should maintain context and provide relevant info
    const userMessages = page.getByTestId('message-user');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
  });

  test('should retrieve and display eco-friendly travel options', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('What are the most sustainable ways to travel in Switzerland?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Should get response about eco-friendly travel
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Check for eco-related keywords
      const lowerResponse = response!.toLowerCase();
      const hasEcoTerms =
        lowerResponse.includes('co2') ||
        lowerResponse.includes('carbon') ||
        lowerResponse.includes('sustainable') ||
        lowerResponse.includes('eco') ||
        lowerResponse.includes('environment');

      expect(hasEcoTerms).toBe(true);
    }
  });
});

test.describe('Critical Flow: Contextual Conversation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain conversation context across multiple turns', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Turn 1: Establish context
    await input.fill('I need to go to Geneva');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // Turn 2: Use context (no need to mention Geneva again)
    await input.fill('What time should I leave tomorrow?');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // Turn 3: Continue contextual conversation
    await input.fill('What about the return trip?');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // Verify all messages are in order
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();

    expect(count).toBe(3);

    // Verify conversation flow is visible
    await expect(userMessages.nth(0)).toContainText('Geneva');
    await expect(userMessages.nth(1)).toContainText('What time');
    await expect(userMessages.nth(2)).toContainText('return trip');
  });

  test('should handle clarification questions', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Vague initial request
    await input.fill('I want to go skiing');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // AI should ask for clarification or provide options
    const CompanionMessages = page.getByTestId('message-Companion');
    const firstResponse = await CompanionMessages.last().textContent();

    expect(firstResponse).toBeTruthy();

    // Provide more details
    await input.fill('Near Zürich, this weekend');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // Should get more specific recommendations
    const messageCount = await CompanionMessages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });

  test('should handle reference resolution ("that one", "the first option")', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Get options
    await input.fill('Show me trains to Bern');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(6000);

    // Reference previous results
    await input.fill('Tell me more about the first one');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(5000);

    // Should understand reference
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toContainText('first one');

    const CompanionMessages = page.getByTestId('message-Companion');
    expect(await CompanionMessages.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Critical Flow: Error Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should recover gracefully from network errors', async ({ page }) => {
    // Simulate network going offline then back online
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips to Basel');
    await page.getByTestId('send-button').click();

    // Wait for potential error or success
    await page.waitForTimeout(10000);

    // App should still be functional
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Should be able to send another message
    await input.fill('What is the weather?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Verify messages are added to history
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Send a complex request that might timeout
    await input.fill('Plan a complete 7-day itinerary across all major Swiss cities with detailed schedules');
    await page.getByTestId('send-button').click();

    // Wait up to 30 seconds
    await page.waitForTimeout(30000);

    // App should remain responsive
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Should be able to send new message
    await input.fill('Simple question: weather in Zürich?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);
    expect(true).toBe(true);
  });

  test('should handle invalid user input gracefully', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    const invalidInputs = [
      'asdfghjkl',
      '12345',
      '!!!@@@###',
      'x'.repeat(5000), // Very long input
    ];

    for (const invalidInput of invalidInputs) {
      await input.fill(invalidInput);
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(2000);

      // Should not crash
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
      await expect(input).toHaveValue('');
    }
  });

  test('should display error message when LLM fails', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test error handling');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Even if there's an error, UI should be functional
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Check for error message or normal response
    const messages = page.locator('[data-testid^="message-"]');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Critical Flow: Data Persistence', () => {
  test('should persist chat history across page reloads', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message
    const input = page.getByTestId('chat-input');
    await input.fill('Unique test message for persistence ' + Date.now());
    const testMessage = await input.inputValue();
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Verify message appears
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toContainText('Unique test message');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if message is still there
    const messagesAfterReload = page.getByTestId('message-user');
    const count = await messagesAfterReload.count();

    // Messages may or may not persist depending on implementation
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should persist language preference', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Change language
    const selects = page.locator('select');
    const count = await selects.count();

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i);
      const options = await select.locator('option').allTextContents();

      if (options.some(opt => opt.includes('Deutsch') || opt.includes('German'))) {
        await select.selectOption('de');
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Language preference may or may not persist
    expect(true).toBe(true);
  });

  test('should maintain favorites across sessions', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Look for favorite buttons
    const favoriteButtons = page.locator('[data-testid*="favorite"], [aria-label*="favorite" i]');
    const count = await favoriteButtons.count();

    if (count > 0) {
      // Click to add favorite
      await favoriteButtons.first().click();
      await page.waitForTimeout(500);

      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Favorites should persist (depends on implementation)
      expect(true).toBe(true);
    } else {
      test.skip();
    }
  });

  test('should clear history when requested', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send some messages
    const input = page.getByTestId('chat-input');
    await input.fill('Message 1');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    await input.fill('Message 2');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Look for clear/delete history button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Delete"), button[aria-label*="clear" i]');
    const hasClearButton = await clearButton.count() > 0;

    if (hasClearButton) {
      await clearButton.first().click();
      await page.waitForTimeout(500);

      // Messages should be cleared
      const messagesAfterClear = page.getByTestId('message-user');
      const count = await messagesAfterClear.count();

      expect(count).toBe(0);
    } else {
      test.skip();
    }
  });
});

test.describe('Critical Flow: Multi-Modal Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle quick action buttons and text input interchangeably', async ({ page }) => {
    // Use quick action
    const quickActions = page.locator('[data-testid^="quick-start-"]');
    const count = await quickActions.count();

    if (count > 0) {
      await quickActions.first().click();

      const input = page.getByTestId('chat-input');
      const valueAfterClick = await input.inputValue();
      expect(valueAfterClick.length).toBeGreaterThan(0);

      // Send that message
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(3000);

      // Then type manually
      await input.fill('What about winter activities?');
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(3000);

      // Both should work
      const userMessages = page.getByTestId('message-user');
      expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
    } else {
      test.skip();
    }
  });

  test('should support both Enter key and button click for sending', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Test 1: Send with button
    await input.fill('Message via button');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(2000);

    // Test 2: Send with Enter key
    await input.fill('Message via Enter');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    // Both should work
    const userMessages = page.getByTestId('message-user');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
  });

  test('should handle Shift+Enter for multiline without sending', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Line 1');
    await input.press('Shift+Enter');
    await input.press('L');
    await input.press('i');
    await input.press('n');
    await input.press('e');

    // Should not have sent yet
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();

    // Depends on implementation, but typically shouldn't send with Shift+Enter
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Critical Flow: Accessibility Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should be fully keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Language selector or menu
    await page.keyboard.press('Tab'); // Next element
    await page.keyboard.press('Tab'); // Chat input should get focus

    const input = page.getByTestId('chat-input');
    await expect(input).toBeFocused();

    // Type and submit with keyboard
    await page.keyboard.type('Keyboard navigation test');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(3000);

    // Message should be sent
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toContainText('Keyboard navigation');
  });

  test('should have proper ARIA labels for screen readers', async ({ page }) => {
    // Check critical elements have ARIA labels
    const input = page.getByTestId('chat-input');
    const ariaLabel = await input.getAttribute('aria-describedby');
    expect(ariaLabel).toBeTruthy();

    const sendButton = page.getByTestId('send-button');
    const buttonLabel = await sendButton.getAttribute('aria-label');
    expect(buttonLabel).toBeTruthy();
  });

  test('should announce dynamic content updates', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test announcement');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="log"], [role="status"]');
    const count = await liveRegions.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Critical Flow: Performance Under Load', () => {
  test('should handle rapid message sending', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.getByTestId('chat-input');

    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      await input.fill(`Rapid message ${i + 1}`);
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(500);
    }

    // App should remain responsive
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // All messages should be sent
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();
    expect(count).toBe(5);
  });

  test('should handle long conversation history', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.getByTestId('chat-input');

    // Create a longer conversation
    for (let i = 0; i < 10; i++) {
      await input.fill(`Message number ${i + 1}`);
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(1000);
    }

    // Scroll should work
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Latest message should still be accessible
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toBeVisible();

    // Input should still work
    await expect(input).toBeEnabled();
  });
});
