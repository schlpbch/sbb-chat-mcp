import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Structure', () => {
    test('displays landing page with proper structure', async ({ page }) => {
      // Hero section
      await expect(
        page.getByRole('heading', { name: 'Swiss Travel Companion', level: 1 })
      ).toBeVisible();

      // Description
      await expect(
        page.getByText('Your intelligent companion for Swiss public transport')
      ).toBeVisible();

      // Primary CTA
      await expect(
        page.getByRole('button', { name: 'Start Chatting →' })
      ).toBeVisible();
    });

    test('displays featured examples section', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Try These Examples', level: 2 })
      ).toBeVisible();

      await expect(
        page.getByText('Click any example to get started')
      ).toBeVisible();
    });

    test('displays features section', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Everything You Need', level: 2 })
      ).toBeVisible();

      // Check for feature titles
      await expect(page.getByText('Journey Planning')).toBeVisible();
      await expect(page.getByText('Weather & Snow')).toBeVisible();
      await expect(page.getByText('Multilingual')).toBeVisible();
      await expect(page.getByText('Accessible')).toBeVisible();
    });

    test('displays CTA section', async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: 'Ready to Explore Switzerland?',
          level: 2,
        })
      ).toBeVisible();

      await expect(
        page.getByRole('button', { name: 'Start Your Journey' })
      ).toBeVisible();
    });
  });

  test.describe('Featured Examples', () => {
    test('shows exactly 6 featured examples', async ({ page }) => {
      // Count example cards
      const examples = page
        .locator('[class*="grid"] button[class*="bg-white"]')
        .filter({
          has: page.locator('span[class*="text-xl"]'), // Icon span
        });

      await expect(examples).toHaveCount(6);
    });

    test('example cards are clickable', async ({ page }) => {
      const firstExample = page
        .locator('[class*="grid"] button[class*="bg-white"]')
        .first();
      await expect(firstExample).toBeVisible();
      await expect(firstExample).toBeEnabled();
    });
  });

  test.describe('Navigation', () => {
    test('hero CTA navigates to chat page', async ({ page }) => {
      await page.getByRole('button', { name: 'Start Chatting →' }).click();
      await page.waitForURL('/chat');

      expect(page.url()).toContain('/chat');
    });

    test('bottom CTA navigates to chat page', async ({ page }) => {
      await page.getByRole('button', { name: 'Start Your Journey' }).click();
      await page.waitForURL('/chat');

      expect(page.url()).toContain('/chat');
    });

    test('clicking example navigates to chat with query', async ({ page }) => {
      // Click first example
      const firstExample = page
        .locator('[class*="grid"] button[class*="bg-white"]')
        .first();
      await firstExample.click();

      await page.waitForURL(/\/chat\?q=.+/);

      // Should be on chat page with query parameter
      expect(page.url()).toContain('/chat?q=');
    });

    test('navbar home link goes to landing page', async ({ page }) => {
      // Navigate to chat first
      await page.goto('/chat');

      // Click home link in navbar
      await page.getByRole('link', { name: 'Swiss Travel Companion' }).click();
      await page.waitForURL('/');

      expect(page.url()).not.toContain('/chat');
    });
  });

  test.describe('Responsive Design', () => {
    test('displays correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Hero should be visible
      await expect(
        page.getByRole('heading', { name: 'Swiss Travel Companion', level: 1 })
      ).toBeVisible();

      // CTA should be visible
      await expect(
        page.getByRole('button', { name: 'Start Chatting →' })
      ).toBeVisible();
    });

    test('displays correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(
        page.getByRole('heading', { name: 'Swiss Travel Companion', level: 1 })
      ).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('has proper heading hierarchy', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);

      const h2s = page.getByRole('heading', { level: 2 });
      await expect(h2s).toHaveCount(3); // Try These Examples, Everything You Need, Ready to Explore
    });

    test('all interactive elements are keyboard accessible', async ({
      page,
    }) => {
      const heroCTA = page.getByRole('button', { name: 'Start Chatting →' });
      await heroCTA.focus();
      await expect(heroCTA).toBeFocused();

      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await page.waitForURL('/chat');
    });
  });
});
