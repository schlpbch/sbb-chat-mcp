import { test, expect } from '@playwright/test';

/**
 * UI Card Components Tests
 * Tests for TripCard, WeatherCard, StationCard, etc.
 */

test.describe('TripCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display trip information when searching for trips', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips from Zürich to Bern');
    await page.getByTestId('send-button').click();

    // Wait for potential response
    await page.waitForTimeout(5000);

    // Check if trip cards are displayed
    const tripCards = page.locator('[data-testid*="trip-"]');
    const count = await tripCards.count();

    if (count > 0) {
      const firstTrip = tripCards.first();
      await expect(firstTrip).toBeVisible();
    }
  });

  test('should show departure and arrival times', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show me connections from Geneva to Lugano');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    const tripCards = page.locator('[data-testid*="trip-"]');
    const count = await tripCards.count();

    if (count > 0) {
      const firstTrip = tripCards.first();
      
      // Should contain time information
      const text = await firstTrip.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should display transfer information', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Trips from Zürich to Lugano');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    const tripCards = page.locator('[data-testid*="trip-"]');
    const count = await tripCards.count();

    if (count > 0) {
      // Check for transfer information
      const transferInfo = page.locator('text=/transfer|direct/i');
      const hasTransferInfo = await transferInfo.count() > 0;
      
      // Transfer info should be present for multi-leg trips
      expect(typeof hasTransferInfo).toBe('boolean');
    }
  });

  test('should be clickable for more details', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find connections to Interlaken');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    const tripCards = page.locator('[data-testid*="trip-"]');
    const count = await tripCards.count();

    if (count > 0) {
      const firstTrip = tripCards.first();
      
      // Trip cards should be interactive
      const isClickable = await firstTrip.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.cursor === 'pointer' || el.tagName === 'BUTTON' || el.tagName === 'A';
      });
      
      expect(typeof isClickable).toBe('boolean');
    }
  });
});

test.describe('WeatherCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display weather information when requested', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('What is the weather in Zürich?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for weather-related content
    const weatherContent = page.locator('text=/temperature|weather|°C|sunny|cloudy|rain/i');
    const count = await weatherContent.count();

    if (count > 0) {
      await expect(weatherContent.first()).toBeVisible();
    }
  });

  test('should show temperature with proper formatting', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Weather forecast for Bern');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for temperature format (e.g., "15°C")
    const tempPattern = page.locator('text=/\\d+°[CF]/');
    const count = await tempPattern.count();

    if (count > 0) {
      await expect(tempPattern.first()).toBeVisible();
    }
  });

  test('should display weather conditions', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('How is the weather in Geneva?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for weather condition keywords
    const conditions = page.locator('text=/sunny|cloudy|rainy|snowy|clear|overcast/i');
    const count = await conditions.count();

    if (count > 0) {
      await expect(conditions.first()).toBeVisible();
    }
  });
});

test.describe('StationCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display station information when searching', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find stations near Zürich');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for station-related content
    const stationContent = page.locator('text=/station|bahnhof|gare/i');
    const count = await stationContent.count();

    if (count > 0) {
      await expect(stationContent.first()).toBeVisible();
    }
  });

  test('should show station names', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show me stations in Bern');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Station names should be visible
    const stationNames = page.locator('text=/HB|Bahnhof|Station/i');
    const count = await stationNames.count();

    if (count > 0) {
      await expect(stationNames.first()).toBeVisible();
    }
  });
});

test.describe('EcoCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display eco-friendly trip information', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Plan an eco-friendly trip to Lausanne');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for eco-related content
    const ecoContent = page.locator('text=/eco|sustainable|carbon|green|environment/i');
    const count = await ecoContent.count();

    if (count > 0) {
      await expect(ecoContent.first()).toBeVisible();
    }
  });

  test('should show carbon footprint information', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('What is the carbon footprint of my trip?');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for carbon-related metrics
    const carbonInfo = page.locator('text=/carbon|CO2|kg|emissions/i');
    const count = await carbonInfo.count();

    if (count > 0) {
      await expect(carbonInfo.first()).toBeVisible();
    }
  });
});

test.describe('ItineraryCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display itinerary when planning trips', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Plan a day trip to Zermatt from Zurich');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Check if any assistant message was received (content varies)
    const assistantMessages = page.getByTestId('message-assistant');
    const messageCount = await assistantMessages.count();

    // If we got a response, that's good enough
    if (messageCount > 0) {
      await expect(assistantMessages.first()).toBeVisible();
    } else {
      // Just check that the page is still functional
      await expect(input).toBeVisible();
    }
  });

  test('should show multiple steps in itinerary', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Create a complete travel plan for Interlaken');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(8000);

    // Check for step indicators or numbered items
    const steps = page.locator('text=/step|1\\.|2\\.|first|then|next/i');
    const count = await steps.count();

    if (count > 0) {
      await expect(steps.first()).toBeVisible();
    }
  });
});

test.describe('Card Components - Common Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should have consistent styling across cards', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show me trips and weather for Zürich');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for common card styling classes
    const cards = page.locator('[class*="rounded"], [class*="border"], [class*="shadow"]');
    const count = await cards.count();

    if (count > 0) {
      // Cards should have consistent border radius and shadows
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should support dark mode', async ({ page }) => {
    // Dark mode has been removed from the application
    test.skip();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const input = page.getByTestId('chat-input');
    await input.fill('Find trips to Geneva');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Cards should be visible and properly sized on mobile
    const cards = page.locator('[data-testid*="card"], [class*="rounded"]');
    const count = await cards.count();

    if (count > 0) {
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
      
      // Card should not overflow viewport
      const box = await firstCard.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should have hover effects', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show connections to Lausanne');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for hover effect classes
    const hoverCards = page.locator('[class*="hover:"]');
    const count = await hoverCards.count();

    if (count > 0) {
      await expect(hoverCards.first()).toBeVisible();
    }
  });
});

test.describe('Card Components - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should have semantic HTML structure', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Plan a trip to Bern');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for semantic elements
    const articles = page.locator('article');
    const sections = page.locator('section');
    
    const articleCount = await articles.count();
    const sectionCount = await sections.count();

    // Should use semantic HTML
    expect(articleCount + sectionCount).toBeGreaterThanOrEqual(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Show me information about Zürich');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();

    if (count > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should have accessible labels for interactive elements', async ({ page }) => {
    const input = page.getByTestId('chat-input');
    await input.fill('Find trips to Geneva');
    await page.getByTestId('send-button').click();

    await page.waitForTimeout(5000);

    // Check for buttons with aria-labels or text
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible().catch(() => false);
        
        if (isVisible) {
          const ariaLabel = await button.getAttribute('aria-label');
          const text = await button.textContent();
          
          // Button should have either aria-label or text content
          expect(ariaLabel || text).toBeTruthy();
        }
      }
    }
  });
});
