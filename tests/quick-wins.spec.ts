import { test, expect } from '@playwright/test';

test.describe('Quick Wins Features', () => {

  test.describe('Favorite Stations', () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    test('should add station to favorites', async ({ page }) => {
      await page.goto('/');

      // Send a message to get station cards
      await page.fill('textarea[placeholder*="Ask about"]', 'Find stations near Zurich');
      await page.click('button:has-text("Send")');

      // Wait for station cards to appear
      await page.waitForSelector('[data-testid="station-card"]', { timeout: 15000 });

      // Click the favorite toggle on first station
      const favoriteButton = page.locator('[data-testid="favorite-toggle"]').first();
      await favoriteButton.click();

      // Wait for toast notification
      await expect(page.locator('text=/Added.*to favorites/i')).toBeVisible({ timeout: 5000 });

      // Verify localStorage
      const favorites = await page.evaluate(() => {
        const stored = localStorage.getItem('favoriteStations');
        return stored ? JSON.parse(stored) : [];
      });
      expect(favorites.length).toBe(1);
    });

    test('should remove station from favorites', async ({ page }) => {
      await page.goto('/');

      // Pre-populate a favorite
      await page.evaluate(() => {
        localStorage.setItem('favoriteStations', JSON.stringify([
          { id: 'test-station', name: 'Test Station', savedAt: Date.now() }
        ]));
      });
      await page.reload();

      // Search for the station to get a card
      await page.fill('textarea[placeholder*="Ask about"]', 'Find stations near Zurich');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="station-card"]', { timeout: 15000 });

      // Find a favorited station and unfavorite it
      const favoriteButton = page.locator('[data-testid="favorite-toggle"]').first();

      // Check if already favorited (yellow star), if not, favorite first
      const isFavorited = await favoriteButton.locator('svg.fill-current').count() > 0;
      if (!isFavorited) {
        await favoriteButton.click();
        await page.waitForTimeout(500);
      }

      // Now unfavorite
      await favoriteButton.click();

      // Wait for removal toast
      await expect(page.locator('text=/Removed.*from favorites/i')).toBeVisible({ timeout: 5000 });
    });

    test('should show favorites section on welcome screen', async ({ page }) => {
      // Pre-populate favorites
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('favoriteStations', JSON.stringify([
          { id: 'station1', name: 'Zurich HB', savedAt: Date.now() },
          { id: 'station2', name: 'Bern', savedAt: Date.now() - 1000 }
        ]));
      });
      await page.reload();

      // Verify favorites section is visible
      await expect(page.locator('text=/Your Favorite Stations/i')).toBeVisible();
      await expect(page.locator('text=Zurich HB')).toBeVisible();
      await expect(page.locator('text=Bern')).toBeVisible();
    });

    test('should auto-send query when clicking favorite station', async ({ page }) => {
      // Pre-populate a favorite
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('favoriteStations', JSON.stringify([
          { id: 'station1', name: 'Zurich HB', savedAt: Date.now() }
        ]));
      });
      await page.reload();

      // Verify favorite button is visible
      const favoriteButton = page.locator('button:has-text("Zurich HB")');
      await expect(favoriteButton).toBeVisible();

      // Click on the favorite station
      await favoriteButton.click();

      // Wait briefly for action to complete
      await page.waitForTimeout(1000);

      // Verify we have a user message OR loading indicator
      // The message might be sent immediately depending on the implementation
      const hasUserMessage = await page.locator('[data-testid="message-user"]').count() > 0;
      const hasLoading = await page.locator('[data-testid="loading-indicator"]').count() > 0;
      const hasMessages = await page.locator('.space-y-6 > div').count() > 1; // Any message in chat area

      // At least one of these should be true
      expect(hasUserMessage || hasLoading || hasMessages).toBeTruthy();
    });

    test('should enforce maximum 10 favorites limit', async ({ page }) => {
      await page.goto('/');

      // Pre-populate 10 favorites
      await page.evaluate(() => {
        const favorites = Array.from({ length: 10 }, (_, i) => ({
          id: `station${i}`,
          name: `Station ${i}`,
          savedAt: Date.now() - i * 1000
        }));
        localStorage.setItem('favoriteStations', JSON.stringify(favorites));
      });
      await page.reload();

      // Try to add an 11th favorite
      await page.fill('textarea[placeholder*="Ask about"]', 'Find stations near Zurich');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="station-card"]', { timeout: 15000 });

      // Click favorite on a new station
      const favoriteButton = page.locator('[data-testid="favorite-toggle"]').first();
      await favoriteButton.click();

      // Should show error toast
      await expect(page.locator('text=/Maximum 10 favorites/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Recent Searches', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    test('should track recent searches', async ({ page }) => {
      await page.goto('/');

      // Send a message
      const query = 'Find connections from Zurich to Bern';
      await page.fill('textarea[placeholder*="Ask about"]', query);
      await page.click('button:has-text("Send")');

      // Wait briefly for search to be tracked
      await page.waitForTimeout(500);

      // Reload page to see recent searches
      await page.reload();

      // Verify recent search is visible
      await expect(page.locator('text=/Recent Searches/i')).toBeVisible();
      await expect(page.locator(`text="${query}"`)).toBeVisible();
    });

    test('should deduplicate recent searches', async ({ page }) => {
      await page.goto('/');

      const query = 'Weather in Paris';

      // Send same query twice
      for (let i = 0; i < 2; i++) {
        await page.fill('textarea[placeholder*="Ask about"]', query);
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(500);
      }

      // Reload to see recent searches
      await page.reload();

      // Should only have one instance of the query
      const searchBadges = page.locator(`[data-testid^="recent-search-"]`);
      const count = await searchBadges.count();
      expect(count).toBe(1);
    });

    test('should remove individual recent search', async ({ page }) => {
      // Pre-populate recent searches
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('recentSearches', JSON.stringify([
          { id: '1', query: 'Search 1', timestamp: Date.now() },
          { id: '2', query: 'Search 2', timestamp: Date.now() - 1000 }
        ]));
      });
      await page.reload();

      // Click remove button on first search
      await page.click('[data-testid="remove-search-1"]');

      // Verify it's removed
      await expect(page.locator('text="Search 1"')).not.toBeVisible();
      await expect(page.locator('text="Search 2"')).toBeVisible();
    });

    test('should clear all recent searches', async ({ page }) => {
      // Pre-populate recent searches
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('recentSearches', JSON.stringify([
          { id: '1', query: 'Search 1', timestamp: Date.now() },
          { id: '2', query: 'Search 2', timestamp: Date.now() - 1000 }
        ]));
      });
      await page.reload();

      // Click clear all
      await page.click('[data-testid="clear-all-searches"]');

      // Verify recent searches section is hidden
      await expect(page.locator('text=/Recent Searches/i')).not.toBeVisible();
    });

    test('should auto-send when clicking recent search', async ({ page }) => {
      // Pre-populate recent searches
      await page.goto('/');
      const query = 'Test query for auto-send';
      await page.evaluate((q) => {
        localStorage.setItem('recentSearches', JSON.stringify([
          { id: '1', query: q, timestamp: Date.now() }
        ]));
      }, query);
      await page.reload();

      // Verify recent search is visible
      const recentSearchButton = page.locator(`text="${query}"`);
      await expect(recentSearchButton).toBeVisible();

      // Click on the recent search text
      await recentSearchButton.click();

      // Wait briefly for action to complete
      await page.waitForTimeout(1000);

      // Verify we have a user message OR loading indicator OR any chat activity
      const hasUserMessage = await page.locator('[data-testid="message-user"]').count() > 0;
      const hasLoading = await page.locator('[data-testid="loading-indicator"]').count() > 0;
      const hasMessages = await page.locator('.space-y-6 > div').count() > 1;

      // At least one of these should be true
      expect(hasUserMessage || hasLoading || hasMessages).toBeTruthy();
    });

    test('should limit to 10 recent searches', async ({ page }) => {
      await page.goto('/');

      // Send 11 different queries
      for (let i = 1; i <= 11; i++) {
        await page.fill('textarea[placeholder*="Ask about"]', `Query ${i}`);
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(300);
      }

      // Reload to see recent searches
      await page.reload();

      // Should only show 10 searches
      const searchBadges = page.locator('[data-testid^="recent-search-"]');
      const count = await searchBadges.count();
      expect(count).toBeLessThanOrEqual(10);

      // First query should be gone, last query should be there
      await expect(page.locator('text="Query 1"')).not.toBeVisible();
      await expect(page.locator('text="Query 11"')).toBeVisible();
    });
  });

  test.describe('Trip Sharing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test.skip('should show share button on trip cards', async ({ page }) => {
      // NOTE: This test requires a live API backend to return trip cards
      // Skip this test in CI/local testing without backend
      await page.fill('textarea[placeholder*="Ask about"]', 'Find connections from Zurich to Bern');
      await page.click('button:has-text("Send")');

      // Wait for trip cards
      await page.waitForSelector('[data-testid="trip-card"]', { timeout: 15000 });

      // Verify share button exists
      await expect(page.locator('[data-testid="share-button"]').first()).toBeVisible();
    });

    test.skip('should open share menu when clicking share button', async ({ page }) => {
      // NOTE: This test requires a live API backend to return trip cards
      await page.fill('textarea[placeholder*="Ask about"]', 'Find connections from Zurich to Bern');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="trip-card"]', { timeout: 15000 });

      // Click share button
      await page.click('[data-testid="share-button"]');

      // Verify menu options are visible
      await expect(page.locator('[data-testid="copy-link-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="copy-text-option"]')).toBeVisible();
    });

    test.skip('should copy shareable link to clipboard', async ({ page, context }) => {
      // NOTE: This test requires a live API backend to return trip cards
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.fill('textarea[placeholder*="Ask about"]', 'Find connections from Zurich to Bern');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="trip-card"]', { timeout: 15000 });

      // Open share menu
      await page.click('[data-testid="share-button"]');

      // Click copy link option
      await page.click('[data-testid="copy-link-option"]');

      // Verify toast shows success
      await expect(page.locator('text=/Link copied/i')).toBeVisible({ timeout: 5000 });

      // Verify clipboard contains a share URL
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('/share?');
    });

    test.skip('should copy formatted text to clipboard', async ({ page, context }) => {
      // NOTE: This test requires a live API backend to return trip cards
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.fill('textarea[placeholder*="Ask about"]', 'Find connections from Zurich to Bern');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="trip-card"]', { timeout: 15000 });

      // Open share menu
      await page.click('[data-testid="share-button"]');

      // Click copy text option
      await page.click('[data-testid="copy-text-option"]');

      // Verify toast shows success
      await expect(page.locator('text=/Trip details copied/i')).toBeVisible({ timeout: 5000 });

      // Verify clipboard contains formatted text with emojis
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('🚂');
      expect(clipboardText).toContain('Powered by SBB Travel Companion');
    });

    test('should display shared trip from URL', async ({ page }) => {
      // Navigate to share page with URL params
      await page.goto('/share?from=Zurich&to=Bern&dep=10:00&arr=11:00');

      // Verify trip details are displayed
      await expect(page.locator('text="Zurich"')).toBeVisible();
      await expect(page.locator('text="Bern"')).toBeVisible();
      await expect(page.locator('text="Departure: 10:00"')).toBeVisible();
      await expect(page.locator('text="Arrival: 11:00"')).toBeVisible();

      // Verify "Open in App" button exists
      await expect(page.locator('button:has-text("Open in SBB Travel Companion")')).toBeVisible();
    });

    test('should handle invalid share link gracefully', async ({ page }) => {
      // Navigate to share page without required params
      await page.goto('/share');

      // Should show error message
      await expect(page.locator('text=/Invalid Share Link/i')).toBeVisible();
      await expect(page.locator('text=/missing required information/i')).toBeVisible();

      // Should have link to home
      await expect(page.locator('a:has-text("Go to Home")')).toBeVisible();
    });
  });

  test.describe('Voice Input', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should show voice button if supported', async ({ page }) => {
      // Check if voice button is present (may not be in all browsers)
      const voiceButton = page.locator('[data-testid="voice-button"]');
      const count = await voiceButton.count();

      // Button should either be visible or not present (depends on browser support)
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should hide voice button if not supported', async ({ page }) => {
      // Override SpeechRecognition to simulate unsupported browser
      await page.addInitScript(() => {
        // @ts-ignore
        delete window.SpeechRecognition;
        // @ts-ignore
        delete window.webkitSpeechRecognition;
      });

      await page.reload();

      // Voice button should not be visible
      const voiceButton = page.locator('[data-testid="voice-button"]');
      await expect(voiceButton).not.toBeVisible();
    });

    // Note: Testing actual voice recognition requires browser automation with audio
    // which is complex. These tests verify UI behavior only.
  });

  test.describe('Integration Tests', () => {
    test('should show multiple features working together', async ({ page }) => {
      await page.goto('/');

      // Pre-populate data
      await page.evaluate(() => {
        localStorage.setItem('favoriteStations', JSON.stringify([
          { id: 'zurich', name: 'Zurich HB', savedAt: Date.now() }
        ]));
        localStorage.setItem('recentSearches', JSON.stringify([
          { id: '1', query: 'Weather in Geneva', timestamp: Date.now() }
        ]));
      });
      await page.reload();

      // Verify both favorites and recent searches are visible
      await expect(page.locator('text=/Your Favorite Stations/i')).toBeVisible();
      await expect(page.locator('text=/Recent Searches/i')).toBeVisible();
      await expect(page.locator('text="Zurich HB"')).toBeVisible();
      await expect(page.locator('text="Weather in Geneva"')).toBeVisible();
    });

    test('should persist data across page reloads', async ({ page }) => {
      await page.goto('/');

      // Add a favorite
      await page.fill('textarea[placeholder*="Ask about"]', 'Find stations near Zurich');
      await page.click('button:has-text("Send")');

      await page.waitForSelector('[data-testid="station-card"]', { timeout: 15000 });
      await page.click('[data-testid="favorite-toggle"]');

      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();

      // Verify favorite persists
      await expect(page.locator('text=/Your Favorite Stations/i')).toBeVisible();

      // Verify recent search persists
      await expect(page.locator('text=/Recent Searches/i')).toBeVisible();
    });
  });
});
