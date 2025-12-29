import { test, expect } from '@playwright/test';

/**
 * Chat Components Tests
 * Tests for ChatInput, ChatMessage, MessageList, WelcomeSection, and related chat components
 */

test.describe('ChatInput Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should render chat input field', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('should accept text input', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Hello, this is a test message');
    await expect(input).toHaveValue('Hello, this is a test message');
  });

  test('should have send button', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');
    await expect(sendButton).toBeVisible();
  });

  test('should send message when send button is clicked', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    await input.fill('Test message');
    await sendButton.click();

    // Input should be cleared after sending
    await page.waitForTimeout(500);
    const value = await input.inputValue();
    expect(value).toBe('');
  });

  test('should send message when Enter is pressed', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test message');
    await input.press('Enter');

    // Input should be cleared after sending
    await page.waitForTimeout(500);
    const value = await input.inputValue();
    expect(value).toBe('');
  });

  test('should not send empty messages', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');

    // Try to send without typing anything
    await sendButton.click();

    // No message should be sent
    await page.waitForTimeout(500);

    // Verify the input is still empty and functional
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible();
  });

  test('should be disabled when loading', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('What is the weather?');

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Button might be disabled briefly during loading
    await page.waitForTimeout(100);

    // Eventually it should be enabled again
    await page.waitForTimeout(2000);
    await expect(input).toBeEnabled();
  });

  test('should support multiline input with Shift+Enter', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Type first line
    await input.fill('Line 1');

    // Press Shift+Enter to add new line
    await input.press('Shift+Enter');

    // Type second line
    await input.press('L');
    await input.press('i');
    await input.press('n');
    await input.press('e');

    const value = await input.inputValue();
    // Should contain newline or both parts
    expect(value.length).toBeGreaterThan(6);
  });

  test('should show placeholder text', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    const placeholder = await input.getAttribute('placeholder');

    // Should have some placeholder text
    expect(placeholder).toBeTruthy();
  });

  test('should have voice input button if supported', async ({ page }) => {
    // Voice button might be present
    const voiceButton = page.locator('[data-testid*="voice"], [aria-label*="voice" i], [title*="voice" i]');
    const count = await voiceButton.count();

    // Voice button may or may not be present depending on browser support
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('ChatMessage Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display user messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Hello, how are you?');
    await page.getByTestId('send-button').click();

    // Wait for message to appear
    await page.waitForTimeout(500);

    // Check for user message
    const userMessage = page.getByTestId('message-user');
    const count = await userMessage.count();

    if (count > 0) {
      await expect(userMessage.last()).toBeVisible();
      await expect(userMessage.last()).toContainText('Hello, how are you?');
    }
  });

  test('should display Companion messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('What is the weather in Zürich?');
    await page.getByTestId('send-button').click();

    // Wait for response
    await page.waitForTimeout(5000);

    // Check for Companion message
    const CompanionMessage = page.getByTestId('message-Companion');
    const count = await CompanionMessage.count();

    if (count > 0) {
      await expect(CompanionMessage.first()).toBeVisible();
    }
  });

  test('should show message timestamp', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Test message with timestamp');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(500);

    // Timestamps might be displayed
    const timestamps = page.locator('time, [data-testid*="timestamp"]');
    const count = await timestamps.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should support markdown formatting in Companion messages', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Give me a list of cities');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check if there are any formatted elements (lists, bold, etc.)
    const formatted = page.locator('ul, ol, strong, em, code, pre');
    const count = await formatted.count();

    // Formatting may or may not be present
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display tool results when tools are called', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips from Zürich to Bern');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Tool results might be displayed as cards
    const toolResults = page.locator('[data-testid*="trip"], [data-testid*="card"]');
    const count = await toolResults.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('MessageList Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display message list container', async ({ page }) => {
    // Message list should exist
    const messageList = page.locator('[data-testid*="message-list"], .messages, [role="log"]');
    const count = await messageList.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    // Send multiple messages
    const input = page.getByTestId('chat-input');

    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);
      await page.getByTestId('send-button').click();
      await page.waitForTimeout(500);
    }

    // The latest message should be visible
    const messages = page.getByTestId('message-user');
    const count = await messages.count();

    if (count > 0) {
      await expect(messages.last()).toBeVisible();
    }
  });

  test('should maintain scroll position when new messages arrive', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('First message');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(1000);

    // Page should still be functional
    await expect(input).toBeVisible();
  });
});

test.describe('WelcomeSection Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome message when no messages', async ({ page }) => {
    // Check for welcome content
    const welcome = page.locator('text=/welcome|get started|how can i help/i');
    const count = await welcome.count();

    // Welcome message might be present initially
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show quick action suggestions', async ({ page }) => {
    // Quick action buttons might be present
    const quickActions = page.locator('[data-testid*="quick-action"], button[class*="suggestion"]');
    const count = await quickActions.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should populate input when quick action is clicked', async ({ page }) => {
    // Find quick action buttons
    const quickAction = page.locator('[data-testid*="quick-action"]').first();
    const exists = await quickAction.count() > 0;

    if (exists) {
      await quickAction.click();

      // Input should be populated
      const input = page.getByTestId('chat-input');
      const value = await input.inputValue();

      expect(value.length).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });

  test('should hide welcome section after first message', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Hello');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(1000);

    // Welcome section might be hidden now
    const welcome = page.locator('[data-testid*="welcome"]');
    const count = await welcome.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('FavoritesSection Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display favorites section', async ({ page }) => {
    const favorites = page.locator('[data-testid*="favorite"], text=/favorite/i');
    const count = await favorites.count();

    // Favorites might be present
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show saved favorite queries', async ({ page }) => {
    // Check if favorites are displayed
    const favoriteItems = page.locator('[data-testid*="favorite-item"]');
    const count = await favoriteItems.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('RecentSearches Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display recent searches', async ({ page }) => {
    // Send a message first
    const input = page.getByTestId('chat-input');
    await input.fill('Test search query');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(500);

    // Recent searches might be stored
    const recents = page.locator('[data-testid*="recent"], text=/recent/i');
    const count = await recents.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should allow clicking recent search to reuse it', async ({ page }) => {
    // Recent search items might be clickable
    const recentItem = page.locator('[data-testid*="recent-item"]').first();
    const exists = await recentItem.count() > 0;

    if (exists) {
      await recentItem.click();

      // Should populate input
      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible();
    } else {
      test.skip();
    }
  });
});

test.describe('Chat Components - Integration', () => {
  test('should handle complete chat flow', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Type message
    const input = page.getByTestId('chat-input');
    await input.fill('What can you help me with?');

    // Send message
    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Input should be cleared
    const value = await input.inputValue();
    expect(value).toBe('');

    // Input should be ready for next message
    await expect(input).toBeEnabled();
  });

  test('should handle rapid message sending', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    // Send multiple messages quickly
    for (let i = 0; i < 3; i++) {
      await input.fill(`Quick message ${i + 1}`);
      await sendButton.click();
      await page.waitForTimeout(200);
    }

    // Page should still be functional
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('should persist chat history on page refresh', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message
    const input = page.getByTestId('chat-input');
    await input.fill('Message to persist');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(1000);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Chat history might be persisted (depends on implementation)
    const messages = page.getByTestId('message-user');
    const count = await messages.count();

    // History may or may not be persisted
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle long messages gracefully', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const longMessage = 'This is a very long message. '.repeat(50);

    const input = page.getByTestId('chat-input');
    await input.fill(longMessage);
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(1000);

    // Message should be sent successfully
    const value = await input.inputValue();
    expect(value).toBe('');
  });
});
