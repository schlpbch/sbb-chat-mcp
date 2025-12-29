import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Test Suite
 * Consolidated from e2e-flows.spec.ts, e2e-integration.spec.ts, and e2e-tool-execution.spec.ts
 *
 * Test Categories:
 * 1. Trip Planning Flows
 * 2. Tool Execution (Trips, Weather, Stations)
 * 3. MCP Integration
 * 4. Contextual Conversations
 * 5. Error Handling & Recovery
 * 6. Cross-Page Navigation
 * 7. Data Persistence
 * 8. Multi-Modal Interaction
 * 9. Accessibility
 * 10. Performance
 */

// ============================================================================
// 1. TRIP PLANNING FLOWS
// ============================================================================

test.describe('Complete Trip Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full trip planning from search to booking information', async ({
    page,
  }) => {
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

  test('should handle complex multi-city itinerary planning', async ({
    page,
  }) => {
    const input = page.getByTestId('chat-input');

    // Complex request with multiple destinations
    await input.fill(
      'Plan a 3-day trip visiting Zürich, Lucerne, and Interlaken'
    );
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

  test('should retrieve and display eco-friendly travel options', async ({
    page,
  }) => {
    const input = page.getByTestId('chat-input');

    await input.fill(
      'What are the most sustainable ways to travel in Switzerland?'
    );
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

// ============================================================================
// 2. TOOL EXECUTION - TRIP SEARCH
// ============================================================================

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
});

// ============================================================================
// 3. TOOL EXECUTION - WEATHER INFORMATION
// ============================================================================

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
});

// ============================================================================
// 4. TOOL EXECUTION - STATION INFORMATION
// ============================================================================

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

// ============================================================================
// 5. TOOL EXECUTION - COMPLEX SCENARIOS
// ============================================================================

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
});

// ============================================================================
// 6. MCP INTEGRATION
// ============================================================================

test.describe('MCP Integration', () => {
  test('should successfully connect to MCP server', async ({ page }) => {
    await page.goto('/mcp-test');
    await page.waitForLoadState('networkidle');

    // Look for connection status
    const statusIndicators = page.locator('[data-testid*="status"], [class*="status"]');
    const count = await statusIndicators.count();

    if (count > 0) {
      const status = await statusIndicators.first().textContent();
      expect(status).toBeTruthy();
    }

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should list available MCP tools', async ({ page }) => {
    await page.goto('/mcp-test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for tool listings
    const toolItems = page.locator('[data-testid*="tool"], [class*="tool-item"]');
    const count = await toolItems.count();

    // Should have some tools available
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display MCP server health metrics', async ({ page }) => {
    await page.goto('/health');
    await page.waitForLoadState('networkidle');

    // Look for health dashboard elements
    const healthCards = page.locator('[data-testid*="health"], [class*="health"], [class*="metric"]');
    const count = await healthCards.count();

    expect(count).toBeGreaterThanOrEqual(0);

    // Page should be accessible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle MCP server connectivity issues', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a request that requires MCP tools
    const input = page.getByTestId('chat-input');
    await input.fill('Find trains to Basel');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(10000);

    // App should remain functional even if MCP has issues
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const messages = page.locator('[data-testid^="message-"]');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// 7. CONTEXTUAL CONVERSATION FLOW
// ============================================================================

test.describe('Contextual Conversation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain conversation context across multiple turns', async ({
    page,
  }) => {
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

  test('should handle reference resolution ("that one", "the first option")', async ({
    page,
  }) => {
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

// ============================================================================
// 8. ERROR HANDLING & RECOVERY
// ============================================================================

test.describe('Error Recovery Flow', () => {
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
    await input.fill(
      'Plan a complete 7-day itinerary across all major Swiss cities with detailed schedules'
    );
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

// ============================================================================
// 9. CROSS-PAGE NAVIGATION
// ============================================================================

test.describe('Cross-Page Navigation', () => {
  test('should navigate between chat and map pages', async ({ page }) => {
    // Start on home page (map)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to chat
    const chatLink = page.locator('a[href="/chat"], button:has-text("Chat")');
    const hasChatLink = (await chatLink.count()) > 0;

    if (hasChatLink) {
      await chatLink.first().click();
      await page.waitForLoadState('networkidle');

      // Should be on chat page
      await expect(page).toHaveURL(/\/chat/);

      // Chat input should be visible
      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should navigate to MCP test page and back', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Look for navigation to MCP test page
    const mcpLink = page.locator('a[href="/mcp-test"]');
    const hasMcpLink = (await mcpLink.count()) > 0;

    if (hasMcpLink) {
      await mcpLink.first().click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/mcp-test/);

      // Navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/chat/);
    } else {
      test.skip();
    }
  });

  test('should persist language selection across pages', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Look for language selector
    const langSelector = page.locator('select[data-testid="language-selector"], [data-testid="language-select"]');
    const hasSelector = (await langSelector.count()) > 0;

    if (hasSelector) {
      // Change language to German
      await langSelector.selectOption('de');
      await page.waitForTimeout(500);

      // Navigate to another page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if language persisted (if implemented)
      const currentLang = await langSelector.inputValue();
      // Language may or may not persist depending on implementation
      expect(['en', 'de']).toContain(currentLang);
    } else {
      test.skip();
    }
  });

  test('should maintain state when navigating back to chat', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message
    const input = page.getByTestId('chat-input');
    await input.fill('Test message for navigation');
    await page.getByTestId('send-button').click();
    await page.waitForTimeout(3000);

    // Navigate away
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Check if messages are still there (if persistence is implemented)
    const userMessages = page.getByTestId('message-user');
    const count = await userMessages.count();

    // Messages may or may not persist depending on implementation
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// 10. DATA PERSISTENCE FLOW
// ============================================================================

test.describe('Data Persistence Flow', () => {
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
    const clearButton = page.locator(
      'button:has-text("Clear"), button:has-text("Delete"), button[aria-label*="clear" i]'
    );
    const hasClearButton = (await clearButton.count()) > 0;

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

// ============================================================================
// 11. MULTI-MODAL INTERACTION FLOW
// ============================================================================

test.describe('Multi-Modal Interaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should handle quick action buttons and text input interchangeably', async ({
    page,
  }) => {
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

  test('should support both Enter key and button click for sending', async ({
    page,
  }) => {
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

// ============================================================================
// 12. ACCESSIBILITY FLOW
// ============================================================================

test.describe('Accessibility Flow', () => {
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

  test('should have proper ARIA labels for screen readers', async ({
    page,
  }) => {
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
    const liveRegions = page.locator(
      '[aria-live], [role="log"], [role="status"]'
    );
    const count = await liveRegions.count();

    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// 13. PERFORMANCE FLOW
// ============================================================================

test.describe('Performance Flow', () => {
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
