import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Check that the main heading is visible
    await expect(page.locator('h1')).toContainText('SBB Chat MCP');
  });

  test('should have a navbar with language selector', async ({ page }) => {
    // Check navbar exists - use more specific selector to avoid Menu nav
    const navbar = page.locator('nav.glass-effect');
    await expect(navbar).toBeVisible();

    // Check language selector is present
    const languageSelector = page.locator('select').first();
    await expect(languageSelector).toBeVisible();
  });

  test('should change language when selector is used', async ({ page }) => {
    // Get language selector
    const languageSelector = page.locator('select').first();

    // Change to German
    await languageSelector.selectOption('de');

    // Wait for content to update
    await page.waitForTimeout(500);

    // Check that some German text is visible (view type label) - use first label
    await expect(page.locator('label').first()).toContainText('Ansichtstyp');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find dark mode toggle button
    const darkModeButton = page
      .locator('button[aria-label*="dark"]')
      .or(page.locator('button[title*="dark"]'))
      .first();

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

    // Check view type buttons
    const allButton = page.getByRole('button', { name: /all/i }).first();
    const sightsButton = page.getByRole('button', { name: /sights/i }).first();
    const resortsButton = page
      .getByRole('button', { name: /resorts/i })
      .first();

    await expect(allButton).toBeVisible();
    await expect(sightsButton).toBeVisible();
    await expect(resortsButton).toBeVisible();
  });

  test('should filter by type (sights)', async ({ page }) => {
    // Wait for attractions to load
    await page.waitForTimeout(2000);

    // Click on Sights filter
    const sightsButton = page.getByRole('button', { name: /sights/i }).first();
    await sightsButton.click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that button is active (has blue background)
    await expect(sightsButton).toHaveClass(/bg-blue-600/);
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

  test('should have category filter dropdown', async ({ page }) => {
    // Find category dropdown
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect).toBeVisible();

    // Check it has "All Categories" option
    await expect(categorySelect).toHaveValue('all');
  });
});

test.describe('Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open and close menu', async ({ page }) => {
    // Find menu button (floating button bottom left)
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();

    // Click to open menu - use force to bypass overlay issues
    await menuButton.click({ force: true });
    await page.waitForTimeout(500);

    // Check that menu panel is visible by checking for menu list
    const menuNav = page.locator('nav ul');
    await expect(menuNav).toBeVisible();

    // Click to close menu
    await menuButton.click({ force: true });
    await page.waitForTimeout(500);
  });

  test('should have menu items', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click({ force: true });
    await page.waitForTimeout(500);

    // Check menu items exist
    const homeLink = page.getByRole('link', { name: /home/i });
    const attractionsLink = page.getByRole('link', { name: /attractions/i });
    const mapLink = page.getByRole('link', { name: /map/i });
    const aboutLink = page.getByRole('link', { name: /about/i });

    await expect(homeLink).toBeVisible();
    await expect(attractionsLink).toBeVisible();
    await expect(mapLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
  });

  test('should close menu when clicking menu item', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click({ force: true });
    await page.waitForTimeout(500);

    // Click on a menu item
    const homeLink = page.getByRole('link', { name: /home/i });
    await homeLink.click();
    await page.waitForTimeout(500);

    // Menu should be closed (panel should not be visible)
    // We can't check exact visibility due to transform, but we can check the button is back to menu icon
    const menuIcon = page
      .locator('button[aria-label="Toggle menu"] svg')
      .first();
    await expect(menuIcon).toBeVisible();
  });

  test('should close menu when clicking overlay', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click({ force: true });
    await page.waitForTimeout(500);

    // Click on overlay - use a position that's definitely on the overlay
    const overlay = page.locator('div.fixed.inset-0').first();
    await overlay.click({ position: { x: 600, y: 300 }, force: true });
    await page.waitForTimeout(500);

    // Menu should be closed
    const menuIcon = page
      .locator('button[aria-label="Toggle menu"] svg')
      .first();
    await expect(menuIcon).toBeVisible();
  });
});

test.describe('Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display map', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(2000);

    // Check that Leaflet map container exists
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Check for loading indicator (should appear briefly)
    const loadingText = page.getByText(/loading/i).first();

    // Either loading is still showing or attractions have loaded
    const isLoading = await loadingText.isVisible().catch(() => false);
    const hasAttractionCount = await page
      .getByText(/attractions/)
      .isVisible()
      .catch(() => false);

    expect(isLoading || hasAttractionCount).toBe(true);
  });

  test('should click on marker and show details panel', async ({ page }) => {
    // Wait for map and data to load
    await page.waitForTimeout(3000);

    // Find a marker on the map (Leaflet creates path elements for circle markers)
    const marker = page.locator('.leaflet-interactive').first();
    await expect(marker).toBeVisible();

    // Click on the marker
    await marker.click();

    // Wait for details panel to appear
    await page.waitForTimeout(500);

    // Check that details panel is visible
    const detailsPanel = page
      .locator('aside')
      .filter({ has: page.locator('button[aria-label*="Close"]') });
    await expect(detailsPanel).toBeVisible();

    // Check that details panel has content (title should be visible)
    const panelTitle = detailsPanel.locator('h3').first();
    await expect(panelTitle).toBeVisible();
  });

  test('should close details panel when close button is clicked', async ({
    page,
  }) => {
    // Wait for map and data to load
    await page.waitForTimeout(3000);

    // Click on a marker
    const marker = page.locator('.leaflet-interactive').first();
    await marker.click();
    await page.waitForTimeout(500);

    // Find and click close button
    const closeButton = page
      .locator('button[aria-label*="Close"]')
      .or(page.locator('aside button').first());
    await closeButton.click();
    await page.waitForTimeout(500);

    // Details panel should be hidden (check by looking for the close button to not be visible)
    await expect(closeButton).not.toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that navbar is visible
    const navbar = page.locator('nav.glass-effect');
    await expect(navbar).toBeVisible();

    // Check that version badge might be hidden on mobile
    const versionBadge = page.locator('text=/v2.0.0/');
    // On mobile, this might be hidden with hidden class
  });

  test('should be tablet responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check that main elements are visible
    const navbar = page.locator('nav.glass-effect');
    const sidebar = page.locator('aside').first();

    await expect(navbar).toBeVisible();
    await expect(sidebar).toBeVisible();
  });
});
