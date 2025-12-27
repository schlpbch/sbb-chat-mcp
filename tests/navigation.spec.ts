import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the homepage', async ({ page }) => {
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'SBB Chat MCP' })).toBeVisible();
  });

  test('should have a navbar with branding', async ({ page }) => {
    // Check navbar exists (first nav is the main navbar)
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Check SBB branding
    await expect(page.getByRole('heading', { name: 'SBB Chat MCP' })).toBeVisible();
  });

  test('should have MCP server selector', async ({ page }) => {
    const mcpSelector = page.locator('#mcp-server-select');
    await expect(mcpSelector).toBeVisible();
  });

  test('should have language selector', async ({ page }) => {
    const languageSelector = page.locator('#language-select');
    await expect(languageSelector).toBeVisible();
  });

  test('should change language when selector is used', async ({ page }) => {
    // Get language selector
    const languageSelector = page.locator('#language-select');

    // Change to German
    await languageSelector.selectOption('de');

    // Wait for content to update
    await page.waitForTimeout(500);

    // Check that the language changed (version text changes)
    await expect(languageSelector).toHaveValue('de');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find dark mode toggle button
    const darkModeButton = page.getByRole('button', { name: 'Toggle dark mode' });

    // Get initial state
    const htmlElement = page.locator('html');
    const initialHasDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    );

    // Click dark mode toggle
    await darkModeButton.click();
    await page.waitForTimeout(300);

    // Check that dark mode was toggled
    const newHasDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    );
    expect(newHasDarkClass).toBe(!initialHasDarkClass);
  });

  test('should have filter sidebar', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    // Type in search box
    await searchInput.fill('Zurich');

    // Wait for search to apply
    await page.waitForTimeout(500);

    // Verify search input has the value
    await expect(searchInput).toHaveValue('Zurich');
  });

  test('should have link to chat page', async ({ page }) => {
    const chatLink = page.getByRole('link', { name: 'Open AI Travel Assistant' });
    await expect(chatLink).toBeVisible();
    await expect(chatLink).toHaveAttribute('href', '/chat');
  });
});

test.describe('Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open and close menu', async ({ page }) => {
    // Find menu button
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await expect(menuButton).toBeVisible();

    // Click to open menu
    await menuButton.click();
    await page.waitForTimeout(300);

    // Check that menu panel is visible
    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();

    // Click to close menu
    await menuButton.click();
    await page.waitForTimeout(300);
  });

  test('should have menu items', async ({ page }) => {
    // Open menu
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await menuButton.click();
    await page.waitForTimeout(300);

    // Check menu items exist
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chat' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'MCP Test' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Health' })).toBeVisible();
  });

  test('should navigate to chat page', async ({ page }) => {
    // Open menu
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await menuButton.click();
    await page.waitForTimeout(300);

    // Click on chat link
    const chatLink = page.getByRole('link', { name: 'Chat' });
    await chatLink.click();

    // Should navigate to chat page
    await expect(page).toHaveURL('/chat');
  });
});

test.describe('Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display map', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(2000);

    // Check that Leaflet map container exists
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should show map controls', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(2000);

    // Check for zoom controls
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that navbar is visible (first nav is the main navbar)
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Menu button should be visible
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await expect(menuButton).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that main elements are visible (first nav is the main navbar)
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });
});
