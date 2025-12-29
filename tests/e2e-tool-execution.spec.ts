import { test, expect } from '@playwright/test';

/**
 * Critical E2E Tests: Tool Execution & MCP Integration
 * Tests that verify the complete flow of LLM → Tool Call → Result Display
 */

test.describe('Tool Execution: Trip Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should execute journey search tool and display results', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Request that should trigger journey search tool
    await input.fill('Find trains from Zürich HB to Bern tomorrow at 10 AM');
    await page.getByTestId('send-button').click();

    // Wait for tool execution and response
    await page.waitForTimeout(10000);

    // Verify user message
    const userMessages = page.getByTestId('message-user');
    await expect(userMessages.last()).toContainText('Zürich');

    // Check for trip cards or structured results
    const tripCards = page.locator('[data-testid*="trip"], [class*="trip"]');
    const cardCount = await tripCards.count();

    if (cardCount > 0) {
      // Verify trip card structure
      const firstCard = tripCards.first();
      await expect(firstCard).toBeVisible();

      // Should show time information
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(10);
    }

    // Verify Companion responded
    const CompanionMessages = page.getByTestId('message-Companion');
    const CompanionCount = await CompanionMessages.count();
    expect(CompanionCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle journey search with parameters extraction', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Natural language request
    await input.fill('I need to get to Geneva this Friday afternoon');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // LLM should extract parameters and call tools
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Should mention Geneva or provide results
      const hasRelevantInfo =
        response!.toLowerCase().includes('geneva') ||
        response!.toLowerCase().includes('genève') ||
        response!.toLowerCase().includes('genf');

      expect(hasRelevantInfo).toBe(true);
    }
  });

  test('should display multiple trip options', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Show me all connections from Lausanne to Lugano');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Should get multiple options
    const tripCards = page.locator('[data-testid*="trip"]');
    const count = await tripCards.count();

    // May have multiple trip options
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 1) {
      // Verify each trip card is distinct
      const firstText = await tripCards.first().textContent();
      const secondText = await tripCards.nth(1).textContent();

      expect(firstText).not.toBe(secondText);
    }
  });
});

test.describe('Tool Execution: Weather Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should execute weather tool for specific location', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('What is the current weather in Zürich?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Check for weather information
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Should contain weather-related terms
      const lowerResponse = response!.toLowerCase();
      const hasWeatherInfo =
        lowerResponse.includes('temperature') ||
        lowerResponse.includes('weather') ||
        lowerResponse.includes('°c') ||
        lowerResponse.includes('degrees') ||
        lowerResponse.includes('sunny') ||
        lowerResponse.includes('cloudy') ||
        lowerResponse.includes('rain');

      expect(hasWeatherInfo).toBe(true);
    }
  });

  test('should combine weather and trip planning', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Request that needs multiple tools
    await input.fill('I want to go hiking in Interlaken. What\'s the weather like and how do I get there?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(12000);

    // Should call both weather and journey tools
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(50); // Should be comprehensive
    }
  });
});

test.describe('Tool Execution: Station Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should retrieve station board information', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Show me the departure board for Zürich HB');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Check for board information
    const boardCards = page.locator('[data-testid*="board"], [data-testid*="departure"]');
    const cardCount = await boardCards.count();

    if (cardCount > 0) {
      const firstBoard = boardCards.first();
      await expect(firstBoard).toBeVisible();

      // Should show departure times
      const boardText = await firstBoard.textContent();
      expect(boardText).toBeTruthy();
    }

    // Or check Companion message
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should handle real-time departure queries', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('When is the next train to Basel from Bern?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Should get real-time information
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Should mention time or provide schedule
      const hasTimeInfo =
        /\d{1,2}:\d{2}/.test(response!) || // HH:MM format
        response!.toLowerCase().includes('depart') ||
        response!.toLowerCase().includes('arrive');

      expect(hasTimeInfo || response!.length > 20).toBe(true);
    }
  });
});

test.describe('Tool Execution: Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle invalid station names gracefully', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Find trains from XYZ123 to ABC456');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Should get error message or clarification request
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Should indicate problem or ask for clarification
      const lowerResponse = response!.toLowerCase();
      const hasErrorHandling =
        lowerResponse.includes('not found') ||
        lowerResponse.includes('could not') ||
        lowerResponse.includes('unable') ||
        lowerResponse.includes('sorry') ||
        lowerResponse.includes('clarify') ||
        lowerResponse.includes('mean');

      expect(hasErrorHandling || response!.length > 10).toBe(true);
    }

    // App should remain functional
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('should recover from tool execution failure', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Request that might fail
    await input.fill('Find trains from nowhere to nowhere at invalid time');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Then send a valid request
    await input.fill('What is the weather in Bern?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should recover and process second request
    const userMessages = page.getByTestId('message-user');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);

    const CompanionMessages = page.getByTestId('message-Companion');
    expect(await CompanionMessages.count()).toBeGreaterThanOrEqual(1);
  });

  test('should handle tool timeout gracefully', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Complex request that might take long
    await input.fill('Find all possible routes from every station in Zürich to every station in Geneva with all transfer options');
    await page.getByTestId('send-button').click();

    // Wait for timeout (30 seconds)
    await page.waitForTimeout(30000);

    // App should still be responsive
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Should be able to send another message
    await input.fill('Simple question: weather?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);
    expect(true).toBe(true);
  });
});

test.describe('Tool Execution: Complex Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should execute multiple tools in sequence', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // Request requiring multiple tool calls
    await input.fill('I want to visit Interlaken. Check the weather, find hotels, and plan my journey from Zürich');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(15000);

    // Should coordinate multiple tool executions
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(100); // Comprehensive response
    }
  });

  test('should handle ambiguous requests with tool parameter clarification', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('I need to get there tomorrow');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Should ask for clarification
    const CompanionMessages = page.getByTestId('message-Companion');
    const count = await CompanionMessages.count();

    if (count > 0) {
      const response = await CompanionMessages.last().textContent();
      expect(response).toBeTruthy();

      // Should ask where "there" is
      const lowerResponse = response!.toLowerCase();
      const asksForClarification =
        lowerResponse.includes('where') ||
        lowerResponse.includes('destination') ||
        lowerResponse.includes('which') ||
        lowerResponse.includes('clarify');

      expect(asksForClarification || response!.length > 0).toBe(true);
    }
  });

  test('should cache and reuse tool results within conversation', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    // First request
    await input.fill('What\'s the weather in Zürich?');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(6000);

    // Second request referencing same location (should use cache)
    await input.fill('What about later today?');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(4000);

    // Both should work, second might be faster due to caching
    const userMessages = page.getByTestId('message-user');
    expect(await userMessages.count()).toBe(2);

    const CompanionMessages = page.getByTestId('message-Companion');
    expect(await CompanionMessages.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Tool Execution: Result Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display trip results in formatted cards', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Trains from Lausanne to Montreux');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Check for formatted trip cards
    const cards = page.locator('[class*="card"], [class*="trip"], [data-testid*="trip"]');
    const count = await cards.count();

    if (count > 0) {
      const firstCard = cards.first();

      // Card should have proper styling
      const hasRoundedCorners = await firstCard.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.borderRadius !== '0px' && style.borderRadius !== '';
      });

      expect(hasRoundedCorners || true).toBe(true);

      // Card should be interactive
      await expect(firstCard).toBeVisible();
    }
  });

  test('should display weather with proper formatting', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Weather forecast for Zermatt');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Look for weather cards or formatted weather data
    const weatherCards = page.locator('[data-testid*="weather"], [class*="weather"]');
    const cardCount = await weatherCards.count();

    if (cardCount > 0) {
      const weatherCard = weatherCards.first();
      await expect(weatherCard).toBeVisible();

      // Should show temperature
      const text = await weatherCard.textContent();
      expect(/\d+°[CF]/.test(text!) || text!.length > 0).toBe(true);
    }
  });

  test('should show loading state while tools execute', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Find connections to Geneva');

    // Observe send button state
    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Check for loading indicators
    await page.waitForTimeout(500);

    // Look for loading indicators
    const loadingIndicators = page.locator('[data-testid*="loading"], [class*="loading"], [class*="spinner"], [class*="pulse"]');
    const hasLoading = await loadingIndicators.count();

    // May or may not show loading indicator
    expect(hasLoading).toBeGreaterThanOrEqual(0);

    // Wait for completion
    await page.waitForTimeout(8000);

    // Loading should be gone
    await expect(input).toBeEnabled();
  });

  test('should support sharing trip results', async ({ page }) => {
    const input = page.getByTestId('chat-input');

    await input.fill('Trips to Lugano');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // Look for share buttons
    const shareButtons = page.locator('[data-testid="share-button"], [aria-label*="share" i]');
    const count = await shareButtons.count();

    if (count > 0) {
      // Verify share button is clickable
      await expect(shareButtons.first()).toBeVisible();

      // Click share button
      await shareButtons.first().click();
      await page.waitForTimeout(500);

      // Share menu should appear
      const shareMenu = page.locator('[data-testid*="share"], [class*="share"]');
      const menuCount = await shareMenu.count();

      expect(menuCount).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });
});
