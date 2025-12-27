import { test, expect } from '@playwright/test';

test.describe('LLM Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display chat toggle button in navbar', async ({ page }) => {
    // Look for the chat toggle button
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await expect(chatButton).toBeVisible();
  });

  test('should open and close chat panel', async ({ page }) => {
    // Click chat toggle button
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await chatButton.click();

    // Chat panel should be visible
    const chatPanel = page.locator('text=Travel Assistant');
    await expect(chatPanel).toBeVisible();

    // Close button should be visible
    const closeButton = page.locator('button[aria-label="Close chat"]');
    await expect(closeButton).toBeVisible();

    // Click close button
    await closeButton.click();

    // Chat panel should be hidden
    await expect(chatPanel).not.toBeVisible();
  });

  test('should display empty state when chat is opened', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await chatButton.click();

    // Should show welcome message
    await expect(page.locator('text=Hello!')).toBeVisible();
    await expect(page.locator('text=Ask me anything about Swiss travel')).toBeVisible();
  });

  test('should have input field and send button', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await chatButton.click();

    // Check for input field
    const input = page.locator('input[placeholder="Ask me anything..."]');
    await expect(input).toBeVisible();

    // Check for send button
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible();
    
    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when text is entered', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await chatButton.click();

    // Type in input
    const input = page.locator('input[placeholder="Ask me anything..."]');
    await input.fill('Hello');

    // Send button should be enabled
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeEnabled();
  });

  test.skip('should send message and receive response', async ({ page }) => {
    // Skip this test if GEMINI_API_KEY is not configured
    // This test requires actual API calls
    
    // Open chat
    const chatButton = page.locator('button[aria-label="Toggle chat"]');
    await chatButton.click();

    // Type and send message
    const input = page.locator('input[placeholder="Ask me anything..."]');
    await input.fill('Hello');
    
    const sendButton = page.locator('button:has-text("Send")');
    await sendButton.click();

    // User message should appear
    await expect(page.locator('text=Hello').first()).toBeVisible();

    // Wait for AI response (with longer timeout for API call)
    await expect(page.locator('.max-w-\\[80\\%\\]').nth(1)).toBeVisible({ timeout: 10000 });
  });
});
