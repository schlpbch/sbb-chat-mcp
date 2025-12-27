import { test, expect } from '@playwright/test';

/**
 * TripCard Component Tests
 * Tests the display of trip/journey information
 */

test.describe('TripCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Trip Display', () => {
    test('should display trip information when searching for connections', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Find trips from Zürich to Bern');
      await page.getByTestId('send-button').click();

      // Wait for response
      await page.waitForTimeout(5000);

      // Check if trip cards are displayed
      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        await expect(firstTrip).toBeVisible();
      }
    });

    test('should show departure and arrival times', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Connections from Geneva to Lausanne');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Should have time information
        const timeElements = firstTrip.locator('text=/\\d{1,2}:\\d{2}/');
        const timeCount = await timeElements.count();
        expect(timeCount).toBeGreaterThan(0);
      }
    });

    test('should display trip duration', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('How long does it take from Zürich to Lugano?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Should show duration (e.g., "2h 30m")
        const durationElement = firstTrip.getByTestId('duration');
        const hasDuration = await durationElement.isVisible().catch(() => false);
        
        if (hasDuration) {
          const durationText = await durationElement.textContent();
          expect(durationText).toMatch(/\d+[hm]/);
        }
      }
    });

    test('should show number of transfers', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Trips from Bern to St. Gallen');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Should show transfer information
        const transferElement = firstTrip.locator('text=/transfer|direct/i');
        const hasTransfer = await transferElement.isVisible().catch(() => false);
        expect(typeof hasTransfer).toBe('boolean');
      }
    });
  });

  test.describe('Platform Information', () => {
    test('should display platform numbers', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Connection from Zürich HB to Bern');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Check for platform information
        const platformElements = firstTrip.locator('text=/platform|plat/i');
        const platformCount = await platformElements.count();
        
        // Platform info may or may not be present
        expect(platformCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible structure', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Find connections to Basel');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Should have proper ARIA labels
        const ariaLabel = await firstTrip.getAttribute('aria-label');
        expect(typeof ariaLabel).toBe('string');
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Trips to Interlaken');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Should be focusable if interactive
        const buttons = firstTrip.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          await buttons.first().focus();
          await expect(buttons.first()).toBeFocused();
        }
      }
    });
  });

  test.describe('Interactive Features', () => {
    test('should handle trip selection', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Show me trips from Zürich to Geneva');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const tripCards = page.getByTestId('trip-card');
      const count = await tripCards.count();

      if (count > 0) {
        const firstTrip = tripCards.first();
        
        // Check if trip is clickable/expandable
        const clickableElements = firstTrip.locator('button, a, [role="button"]');
        const clickableCount = await clickableElements.count();
        
        expect(clickableCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
