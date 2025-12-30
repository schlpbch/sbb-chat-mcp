import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display the hero section with correct content', async ({
    page,
  }) => {
    // Check for hero title - it appears in both navbar and hero section
    const heroTitle = page.locator(
      'section h1:has-text("Swiss Travel Companion")'
    );
    await expect(heroTitle).toBeVisible();

    // Check for hero subtitle
    await expect(
      page.getByText(
        /Your AI-powered journey planner for Swiss public transport/i
      )
    ).toBeVisible();

    // Check for CTA button
    const ctaButton = page.getByRole('link', { name: /Start Chatting/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/chat');
  });

  test('should display category filters', async ({ page }) => {
    // Check for navigation with category filters
    const categoryNav = page.locator('nav[aria-label="Category filters"]');
    await expect(categoryNav).toBeVisible();

    // Check for all category filter buttons using aria-label
    await expect(
      page.getByRole('button', { name: 'Show all examples' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Filter by Trips' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Filter by Weather' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Filter by Stations' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Filter by Advanced' })
    ).toBeVisible();
  });

  test('should filter examples by category', async ({ page }) => {
    // Click on Trips category using aria-label
    const tripsButton = page.getByRole('button', { name: 'Filter by Trips' });
    await tripsButton.click();

    // Verify Trips button has aria-pressed="true"
    await expect(tripsButton).toHaveAttribute('aria-pressed', 'true');

    // Click on Weather category
    const weatherButton = page.getByRole('button', {
      name: 'Filter by Weather',
    });
    await weatherButton.click();

    // Verify Weather button is now pressed
    await expect(weatherButton).toHaveAttribute('aria-pressed', 'true');
    // Verify Trips button is no longer pressed
    await expect(tripsButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should display example queries', async ({ page }) => {
    // Wait for examples grid to be visible
    const examplesGrid = page.locator(
      'section[aria-label="Example queries"] > div > div'
    );
    await expect(examplesGrid).toBeVisible();

    // Check that at least one example card is visible
    const exampleCards = page.locator(
      'section[aria-label="Example queries"] button'
    );
    await expect(exampleCards.first()).toBeVisible();
  });

  test('should navigate to chat when clicking an example', async ({ page }) => {
    // Find and click the first example query button
    const firstExample = page
      .locator('section[aria-label="Example queries"] button')
      .first();
    await firstExample.click();

    // Should navigate to /chat with query parameter
    await page.waitForURL(/\/chat\?q=.+&autoSend=true/);
    expect(page.url()).toMatch(/\/chat\?q=.+&autoSend=true/);
  });

  test('should display footer with links', async ({ page }) => {
    // Check for footer with contentinfo role
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();

    // Check for footer content
    await expect(
      page.getByText(/© 2024 Swiss Travel Companion/i)
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Privacy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Terms/i })).toBeVisible();
  });

  test('should have navbar with language selector', async ({ page }) => {
    // Check for navbar
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Language selector button exists (it shows flag emoji and language code)
    const languageButtons = page.locator('nav button');
    await expect(languageButtons.first()).toBeVisible();
  });

  test('should have main content with proper accessibility', async ({
    page,
  }) => {
    // Check main element has proper role and aria-label
    const main = page.locator('main[role="main"][aria-label="Main content"]');
    await expect(main).toBeVisible();

    // Check hero section has aria-label
    const heroSection = page.locator('section[aria-label="Hero section"]');
    await expect(heroSection).toBeVisible();

    // Check category filters nav has proper attributes
    const categoryNav = page.locator(
      'nav[role="navigation"][aria-label="Category filters"]'
    );
    await expect(categoryNav).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Hero section should still be visible
    const heroTitle = page.locator(
      'section h1:has-text("Swiss Travel Companion")'
    );
    await expect(heroTitle).toBeVisible();

    // CTA button should be visible
    await expect(
      page.getByRole('link', { name: /Start Chatting/i })
    ).toBeVisible();

    // Category filters should be visible
    await expect(
      page.getByRole('button', { name: 'Show all examples' })
    ).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that main content has proper structure
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('aria-label', 'Main content');

    // Check footer has contentinfo role
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveAttribute('aria-label', 'Site footer');

    // Check buttons have accessible names
    const ctaButton = page.getByRole('link', { name: /Start Chatting/i });
    await expect(ctaButton).toHaveAccessibleName();

    // Check filter buttons have aria-pressed
    const allExamplesButton = page.getByRole('button', {
      name: 'Show all examples',
    });
    await expect(allExamplesButton).toHaveAttribute('aria-pressed');
  });
});
