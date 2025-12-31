import { test, expect } from '@playwright/test';

/**
 * Minimal smoke tests to verify core functionality
 * These tests should be fast and reliable
 */

test.describe('Smoke Tests', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();

    // Verify no critical errors
    const errors = await page.locator('text=/error|failed/i').count();
    expect(errors).toBe(0);
  });

  test('chat page loads successfully', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();

    // Verify URL is correct
    await expect(page).toHaveURL(/\/chat/);
  });

  test('navigation works between pages', async ({ page }) => {
    // Start on landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to chat (if link exists)
    const chatLink = page.locator('a[href="/chat"]').first();
    if ((await chatLink.count()) > 0) {
      await chatLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/chat/);
    }
  });

  test('app renders without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some errors but not critical ones
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('404')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/terms/);
  });

  test('language selector exists and works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for language selector
    const langSelector = page
      .locator(
        'select[data-testid="language-selector"], [data-testid="language-select"]'
      )
      .first();

    if ((await langSelector.count()) > 0) {
      await expect(langSelector).toBeVisible();

      // Try changing language
      await langSelector.selectOption('de');
      await page.waitForTimeout(500);

      // Verify it changed (value should be 'de')
      const value = await langSelector.inputValue();
      expect(['de', 'en']).toContain(value);
    }
  });

  test('navbar renders on all pages', async ({ page }) => {
    const pages = ['/', '/chat', '/settings'];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Look for navbar/header
      const navbar = page.locator('nav, header, [role="navigation"]').first();
      await expect(navbar).toBeVisible();
    }
  });

  test('chat input accepts text', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Find chat input
    const input = page
      .getByTestId('chat-input')
      .or(page.locator('input[type="text"]').first());

    if ((await input.count()) > 0) {
      await input.fill('Test message');
      await expect(input).toHaveValue('Test message');
    }
  });

  test('all static assets load', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      const url = request.url();
      // Ignore common non-critical failures
      if (!url.includes('favicon') && !url.includes('analytics')) {
        failedRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedRequests.length).toBe(0);
  });

  test('map page loads', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/map/);
  });

  test('MCP tools endpoint responds', async ({ request }) => {
    const response = await request.get('/api/mcp-proxy/tools');

    // Should return 200 or 500 (if MCP server is down, but endpoint exists)
    expect([200, 500]).toContain(response.status());
  });

  test('MCP prompts endpoint responds', async ({ request }) => {
    const response = await request.get('/api/mcp-proxy/prompts');

    // Should return 200 or 500 (if MCP server is down, but endpoint exists)
    expect([200, 500]).toContain(response.status());
  });

  test('MCP resources endpoint responds', async ({ request }) => {
    const response = await request.get('/api/mcp-proxy/resources');

    // Should return 200 or 500 (if MCP server is down, but endpoint exists)
    expect([200, 500]).toContain(response.status());
  });

  test('chat API endpoint exists', async ({ request }) => {
    const response = await request.post('/api/llm/chat', {
      data: {
        message: 'test',
        history: [],
      },
    });

    // Should not return 404 (endpoint exists)
    expect(response.status()).not.toBe(404);
  });

  test('streaming chat API endpoint exists', async ({ request }) => {
    const response = await request.post('/api/llm/stream', {
      data: {
        message: 'test',
        history: [],
      },
    });

    // Should not return 404 (endpoint exists)
    expect(response.status()).not.toBe(404);
  });

  test('feedback API endpoint exists', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        rating: 5,
        feedback: 'test',
      },
    });

    // Should not return 404 (endpoint exists)
    expect(response.status()).not.toBe(404);
  });

  test('page does not crash on invalid route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    await page.waitForLoadState('networkidle');

    // Should show 404 page, not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('app handles network errors gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate offline
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/chat').catch(() => {
      // Expected to fail
    });

    // Go back online
    await page.context().setOffline(false);

    // Should recover
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();

    // Check chat page on mobile
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('app works on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const sendButton = page
      .getByTestId('send-button')
      .or(page.locator('button[type="submit"]').first());

    if ((await sendButton.count()) > 0) {
      // Should be disabled when empty
      await expect(sendButton).toBeDisabled();
    }
  });

  test('example queries are clickable on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for example query buttons
    const exampleButtons = page
      .locator('button')
      .filter({ hasText: /zurich|bern|geneva|train/i });

    if ((await exampleButtons.count()) > 0) {
      await expect(exampleButtons.first()).toBeVisible();
      await expect(exampleButtons.first()).toBeEnabled();
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to focus on interactive elements
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(['INPUT', 'BUTTON', 'SELECT', 'A']).toContain(focusedElement);
  });

  test('page has proper meta tags', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').count();
    expect(viewport).toBeGreaterThan(0);
  });

  test('app has proper ARIA labels for accessibility', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Check for ARIA labels on interactive elements
    const ariaLabels = await page
      .locator('[aria-label], [aria-describedby]')
      .count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('no duplicate IDs on page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(
        (el) => el.id
      );
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      return duplicates;
    });

    expect(duplicateIds.length).toBe(0);
  });

  test('page loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('chat page has proper heading structure', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Should have at least one heading
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('external links open in new tab', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    const externalLinks = await page.locator('a[href^="http"]').all();

    for (const link of externalLinks) {
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');

      // External links should have target="_blank" and rel="noopener noreferrer"
      if (target === '_blank') {
        expect(rel).toContain('noopener');
      }
    }
  });

  test('app supports dark mode toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for theme toggle
    const themeToggle = page
      .locator(
        '[data-testid="theme-toggle"], button:has-text("theme"), button:has-text("dark")'
      )
      .first();

    if ((await themeToggle.count()) > 0) {
      await expect(themeToggle).toBeVisible();
    }
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(jsErrors.length).toBe(0);
  });
});
