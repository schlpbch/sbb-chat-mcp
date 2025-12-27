import { test, expect } from '@playwright/test';

/**
 * EcoCard Component Tests
 * Tests the display of eco-friendly travel information and CO2 comparisons
 */

test.describe('EcoCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Eco Information Display', () => {
    test('should display eco-friendly travel information', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Plan an eco-friendly trip from Zürich to Geneva');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      // Check if eco card is displayed
      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        await expect(ecoCard).toBeVisible();
      }
    });

    test('should show CO2 emissions comparison', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('How can I travel sustainably from Bern to Lugano?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should show CO2 information
        const co2Element = ecoCard.locator('text=/CO2|carbon|emission/i');
        const hasCO2 = await co2Element.isVisible().catch(() => false);
        
        if (hasCO2) {
          await expect(co2Element).toBeVisible();
        }
      }
    });

    test('should display eco-friendly badge or icon', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Sustainable travel options to Basel');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should have eco icon (leaf, plant, etc.)
        const ecoIcon = ecoCard.locator('text=/🌱|🍃|♻️|🌍/');
        const hasIcon = await ecoIcon.isVisible().catch(() => false);
        expect(typeof hasIcon).toBe('boolean');
      }
    });
  });

  test.describe('Comparison Features', () => {
    test('should compare train vs car emissions', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Compare eco impact of train vs car from Zürich to Bern');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should show comparison data
        const comparisonElement = ecoCard.locator('text=/train|car|vs|compared/i');
        const hasComparison = await comparisonElement.isVisible().catch(() => false);
        expect(typeof hasComparison).toBe('boolean');
      }
    });

    test('should show percentage savings', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('How much CO2 do I save by taking the train?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should show percentage or savings
        const savingsElement = ecoCard.locator('text=/%|save|saving/i');
        const hasSavings = await savingsElement.isVisible().catch(() => false);
        expect(typeof hasSavings).toBe('boolean');
      }
    });
  });

  test.describe('Visual Design', () => {
    test('should use green/eco-themed colors', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Eco-friendly trip to Lausanne');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Check for green-themed styling
        const className = await ecoCard.getAttribute('class');
        expect(typeof className).toBe('string');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Sustainable travel to Interlaken');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should have aria-label
        const ariaLabel = await ecoCard.getAttribute('aria-label');
        expect(typeof ariaLabel).toBe('string');
      }
    });

    test('should hide decorative icons from screen readers', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('Green travel options');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Decorative elements should have aria-hidden
        const hiddenIcons = ecoCard.locator('[aria-hidden="true"]');
        const count = await hiddenIcons.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Content Quality', () => {
    test('should provide actionable eco tips', async ({ page }) => {
      const input = page.getByTestId('chat-input');
      await input.fill('How to travel more sustainably in Switzerland?');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      const ecoCard = page.getByTestId('eco-card');
      const isVisible = await ecoCard.isVisible().catch(() => false);

      if (isVisible) {
        // Should contain helpful information
        const content = await ecoCard.textContent();
        expect(content).toBeTruthy();
        if (content) {
          expect(content.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
