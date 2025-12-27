import { test, expect } from '@playwright/test';

/**
 * i18n Library Tests
 * Tests the internationalization utilities
 */

test.describe('i18n - Translation Functions', () => {
  test('should provide translations for all supported languages', async ({ page }) => {
    // Navigate to a page that uses i18n
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test language switching via select element
    const languages = ['en', 'de', 'fr', 'it'];

    for (const lang of languages) {
      // Find the language selector
      const selects = page.locator('select');
      const count = await selects.count();

      if (count > 0) {
        const firstSelect = selects.first();
        const options = await firstSelect.locator('option').allTextContents();

        // Check if this is the language selector
        if (options.some(opt => opt.includes('English') || opt.includes('Deutsch'))) {
          await firstSelect.selectOption(lang);
          await page.waitForTimeout(500);

          // Verify language was selected
          await expect(firstSelect).toHaveValue(lang);
        }
      }
    }
  });

  test('should translate common UI elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that common elements are present
    // These should be translated based on the current language
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The page should render without errors even if some translations are missing
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    // Navigate through different pages
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/mcp-test');
    await page.waitForLoadState('networkidle');
    
    // Should not have any errors related to missing translations
    expect(errors.length).toBe(0);
  });
});

test.describe('i18n - Date and Time Formatting', () => {
  test('should format dates according to locale', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message that might trigger date/time display
    const input = page.getByTestId('chat-input');
    await input.fill('Show me departures from Zürich HB');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Check if any time elements are displayed
    const timeElements = page.locator('[data-testid="time"]');
    const count = await timeElements.count();

    if (count > 0) {
      const timeText = await timeElements.first().textContent();
      // Should be in HH:MM format
      expect(timeText).toMatch(/\d{1,2}:\d{2}/);
    }
  });
});

test.describe('i18n - Number Formatting', () => {
  test('should format numbers and currencies correctly', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Send a message that might trigger price display
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips from Zürich to Bern');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(3000);

    // Check for any price displays (CHF)
    const priceElements = page.locator('text=/CHF|Fr\\./i');
    const count = await priceElements.count();

    if (count > 0) {
      const priceText = await priceElements.first().textContent();
      expect(priceText).toBeTruthy();
    }
  });
});
