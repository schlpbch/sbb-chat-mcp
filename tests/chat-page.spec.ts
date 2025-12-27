import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Structure', () => {
    test('displays page with proper semantic structure', async ({ page }) => {
      // Main landmark
      await expect(page.getByRole('main', { name: 'Chat interface' })).toBeVisible();

      // Header with title
      await expect(page.getByRole('heading', { name: 'AI Travel Assistant', level: 1 })).toBeVisible();

      // Navbar branding
      await expect(page.getByRole('heading', { name: 'SBB Chat MCP' })).toBeVisible();
    });

    test('displays welcome message when chat is empty', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Hello!', level: 2 })).toBeVisible();
      await expect(page.getByText('Ask me anything about Swiss travel', { exact: true })).toBeVisible();
    });

    test('has accessible input form', async ({ page }) => {
      // Form with aria-label
      await expect(page.getByRole('form', { name: 'Send a message' })).toBeVisible();

      // Input with proper labeling
      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('aria-describedby', 'chat-hint');

      // Send button
      const sendButton = page.getByTestId('send-button');
      await expect(sendButton).toBeVisible();
      await expect(sendButton).toHaveAttribute('aria-label', 'Send message');
    });
  });

  test.describe('Quick Start Suggestions', () => {
    test('displays all quick start buttons', async ({ page }) => {
      const suggestions = page.getByRole('navigation', { name: 'Quick start suggestions' });
      await expect(suggestions).toBeVisible();

      await expect(page.getByTestId('quick-start-ski')).toBeVisible();
      await expect(page.getByTestId('quick-start-zurich')).toBeVisible();
      await expect(page.getByTestId('quick-start-sustainable')).toBeVisible();
      await expect(page.getByTestId('quick-start-family')).toBeVisible();
      await expect(page.getByTestId('quick-start-zermatt')).toBeVisible();
    });

    test('populates input when clicking Zermatt button', async ({ page }) => {
      await page.getByTestId('quick-start-zermatt').click();

      const input = page.getByTestId('chat-input');
      await expect(input).toHaveValue('Plan a day trip to Zermatt from Zurich');
    });

    test('populates input when clicking ski resorts button', async ({ page }) => {
      await page.getByTestId('quick-start-ski').click();

      const input = page.getByTestId('chat-input');
      await expect(input).toHaveValue('What are the best ski resorts in Switzerland?');
    });

    test('quick start buttons have focus styles', async ({ page }) => {
      const skiButton = page.getByTestId('quick-start-ski');
      await skiButton.focus();

      // Check focus is on the button
      await expect(skiButton).toBeFocused();
    });
  });

  test.describe('Input Behavior', () => {
    test('send button is disabled when input is empty', async ({ page }) => {
      const sendButton = page.getByTestId('send-button');
      await expect(sendButton).toBeDisabled();
    });

    test('send button is enabled when text is entered', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Hello');

      const sendButton = page.getByTestId('send-button');
      await expect(sendButton).toBeEnabled();
    });

    test('clears input after sending message', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Test message');

      await page.getByTestId('send-button').click();

      await expect(input).toHaveValue('');
    });

    test('submits form on Enter key', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Test enter key');
      await input.press('Enter');

      // User message should appear
      await expect(page.getByTestId('message-user')).toBeVisible();
    });

    test('does not submit empty form on Enter', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.press('Enter');

      // Welcome message should still be visible
      await expect(page.getByRole('heading', { name: 'Hello!' })).toBeVisible();
    });
  });

  test.describe('Message Display', () => {
    test('displays user message after sending', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Test message');
      await page.getByTestId('send-button').click();

      const userMessage = page.getByTestId('message-user');
      await expect(userMessage).toBeVisible();
      await expect(userMessage).toContainText('Test message');
    });

    test('shows loading indicator while waiting for response', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Test loading');
      await page.getByTestId('send-button').click();

      const loadingIndicator = page.getByTestId('loading-indicator');
      await expect(loadingIndicator).toBeVisible();

      // Loading indicator has proper ARIA attributes
      await expect(loadingIndicator).toHaveAttribute('role', 'status');
      await expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    });

    test('send button shows sending state', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Test sending state');

      const sendButton = page.getByTestId('send-button');
      await sendButton.click();

      await expect(sendButton).toContainText('Sending...');
      await expect(sendButton).toHaveAttribute('aria-label', 'Sending message');
    });
  });

  test.describe('Navigation', () => {
    test('toggles menu from navbar', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: 'Toggle menu' });
      await menuButton.click();

      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Chat' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'MCP Test' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Health' })).toBeVisible();
    });

    test('toggles dark mode', async ({ page }) => {
      const themeButton = page.getByRole('button', { name: 'Toggle dark mode' });
      await themeButton.click();

      await expect(page.locator('html')).toHaveClass(/dark/);

      await themeButton.click();
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('can tab through interactive elements', async ({ page }) => {
      // Start from the input
      const input = page.getByTestId('chat-input');
      await input.focus();
      await expect(input).toBeFocused();

      // Enter text so send button is enabled (disabled buttons can't receive focus)
      await input.fill('Test');

      // Tab to send button
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('send-button')).toBeFocused();
    });

    test('quick start buttons are keyboard accessible', async ({ page }) => {
      const skiButton = page.getByTestId('quick-start-ski');
      await skiButton.focus();

      // Press Enter to activate
      await page.keyboard.press('Enter');

      const input = page.getByTestId('chat-input');
      await expect(input).toHaveValue('What are the best ski resorts in Switzerland?');
    });
  });

  test.describe('Accessibility', () => {
    test('messages region has proper ARIA attributes', async ({ page }) => {
      const messagesRegion = page.getByRole('log', { name: 'Chat messages' });
      await expect(messagesRegion).toBeVisible();
      await expect(messagesRegion).toHaveAttribute('aria-live', 'polite');
    });

    test('decorative emojis are hidden from screen readers', async ({ page }) => {
      const skiButton = page.getByTestId('quick-start-ski');
      const hiddenEmoji = skiButton.locator('span[aria-hidden="true"]');
      await expect(hiddenEmoji).toBeVisible();
    });
  });
});

test.describe('Chat Page - API Integration', () => {
  test.skip('receives AI response after sending message', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const input = page.getByTestId('chat-input');
    await input.fill('What is the capital of Switzerland?');
    await page.getByTestId('send-button').click();

    // Wait for assistant response
    await expect(page.getByTestId('message-assistant')).toBeVisible({ timeout: 30000 });
  });

  test.skip('shows tool execution for complex queries', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('quick-start-zermatt').click();
    await page.getByTestId('send-button').click();

    // Loading indicator should appear
    await expect(page.getByTestId('loading-indicator')).toBeVisible();

    // Wait for response
    await expect(page.getByTestId('message-assistant')).toBeVisible({ timeout: 60000 });
  });
});
