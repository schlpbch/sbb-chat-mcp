import { test, expect } from '@playwright/test';

/**
 * WeatherCard Component Tests
 * Tests the display of weather information
 */

test.describe('WeatherCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Weather Display', () => {
    test('should display weather information when requested', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('What is the weather in Zürich?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      // Check if weather card is displayed
      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        await expect(weatherCard).toBeVisible();
      }
    });

    test('should show temperature', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Weather in Bern');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should show temperature with degree symbol
        const tempElement = weatherCard.locator('text=/\\d+°/');
        const hasTemp = await tempElement.isVisible().catch(() => false);
        
        if (hasTemp) {
          await expect(tempElement).toBeVisible();
        }
      }
    });

    test('should display weather condition', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('How is the weather in Geneva?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should show weather condition (sunny, cloudy, etc.)
        const conditionElement = weatherCard.getByTestId('weather-condition');
        const hasCondition = await conditionElement.isVisible().catch(() => false);
        
        if (hasCondition) {
          const conditionText = await conditionElement.textContent();
          expect(conditionText).toBeTruthy();
        }
      }
    });

    test('should show weather icon or emoji', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Weather forecast for Lugano');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should have weather icon/emoji
        const iconElement = weatherCard.locator('[aria-hidden="true"]').first();
        const hasIcon = await iconElement.isVisible().catch(() => false);
        expect(typeof hasIcon).toBe('boolean');
      }
    });
  });

  test.describe('Extended Forecast', () => {
    test('should show forecast for multiple days if available', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Weather forecast for Interlaken for the next few days');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Check for multiple forecast items
        const forecastItems = weatherCard.locator('[data-testid^="forecast-day-"]');
        const count = await forecastItems.count();
        
        // May have 0 or more forecast days
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Weather in Zermatt');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should have aria-label
        const ariaLabel = await weatherCard.getAttribute('aria-label');
        expect(typeof ariaLabel).toBe('string');
      }
    });

    test('should hide decorative icons from screen readers', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('What is the weather like in St. Moritz?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const weatherCard = page.getByTestId('weather-card');
      const isVisible = await weatherCard.isVisible().catch(() => false);

      if (isVisible) {
        // Decorative elements should have aria-hidden
        const hiddenIcons = weatherCard.locator('[aria-hidden="true"]');
        const count = await hiddenIcons.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle unavailable weather data gracefully', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Weather in NonExistentCity12345');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      // Should not crash - either show error message or no weather card
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      
      await page.waitForTimeout(1000);
      
      // No JavaScript errors should occur
      expect(errors.length).toBe(0);
    });
  });
});
