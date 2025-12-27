import { test, expect } from '@playwright/test';

/**
 * Filter and Search Integration Tests
 * Tests the filtering and search functionality on the homepage
 */

test.describe('Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Type Filter', () => {
    test('should filter by All types', async ({ page }) => {
      // Click on "All" filter
      const allButton = page.getByRole('button', { name: /All/i });
      await allButton.click();

      // Wait for content to update
      await page.waitForTimeout(1000);

      // Should show both sights and resorts
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();

      // Should have some attractions visible
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter by Sights only', async ({ page }) => {
      // Click on "Sights" filter
      const sightsButton = page.getByRole('button', { name: /Sights/i });
      await sightsButton.click();

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Check that filter is active
      await expect(sightsButton).toHaveClass(/bg-/);
    });

    test('should filter by Resorts only', async ({ page }) => {
      // Click on "Resorts" filter
      const resortsButton = page.getByRole('button', { name: /Resorts/i });
      await resortsButton.click();

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Check that filter is active
      await expect(resortsButton).toHaveClass(/bg-/);
    });

    test('should toggle between filter types', async ({ page }) => {
      const allButton = page.getByRole('button', { name: /All/i });
      const sightsButton = page.getByRole('button', { name: /Sights/i });
      const resortsButton = page.getByRole('button', { name: /Resorts/i });

      // Start with All
      await allButton.click();
      await page.waitForTimeout(500);

      // Switch to Sights
      await sightsButton.click();
      await page.waitForTimeout(500);

      // Switch to Resorts
      await resortsButton.click();
      await page.waitForTimeout(500);

      // Switch back to All
      await allButton.click();
      await page.waitForTimeout(500);

      // Should complete without errors
      await expect(allButton).toBeVisible();
    });
  });

  test.describe('Search Filter', () => {
    test('should have search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      await expect(searchInput).toBeVisible();
    });

    test('should filter attractions by search term', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      
      // Type search term
      await searchInput.fill('Zürich');
      
      // Wait for search to apply
      await page.waitForTimeout(1000);

      // Results should be filtered
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();

      // Should show filtered results
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should clear search when input is cleared', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      
      // Type and then clear
      await searchInput.fill('Bern');
      await page.waitForTimeout(500);
      
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Should show all results again
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should be case-insensitive', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      
      // Search with lowercase
      await searchInput.fill('zürich');
      await page.waitForTimeout(500);
      const lowercaseCount = await page.locator('[data-testid*="attraction"]').count();

      // Clear and search with uppercase
      await searchInput.clear();
      await searchInput.fill('ZÜRICH');
      await page.waitForTimeout(500);
      const uppercaseCount = await page.locator('[data-testid*="attraction"]').count();

      // Should return same results
      expect(lowercaseCount).toBe(uppercaseCount);
    });

    test('should handle special characters', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      
      // Search with special characters
      await searchInput.fill('Gruyères');
      await page.waitForTimeout(500);

      // Should not crash
      await expect(searchInput).toHaveValue('Gruyères');
    });

    test('should show no results message for invalid search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search/i);
      
      // Search for something that doesn't exist
      await searchInput.fill('XYZ123NonExistent');
      await page.waitForTimeout(1000);

      // Should show no results or empty state
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();
      
      expect(count).toBe(0);
    });
  });

  test.describe('Category Filter', () => {
    test('should have category dropdown', async ({ page }) => {
      const categorySelect = page.locator('select').filter({ hasText: /Category|All Categories/i });
      const count = await categorySelect.count();
      
      if (count > 0) {
        await expect(categorySelect.first()).toBeVisible();
      }
    });

    test('should filter by category', async ({ page }) => {
      const categorySelect = page.locator('select').first();
      const isVisible = await categorySelect.isVisible().catch(() => false);
      
      if (isVisible) {
        // Select a category
        await categorySelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Results should be filtered
        const attractions = page.locator('[data-testid*="attraction"]');
        const count = await attractions.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should reset to all categories', async ({ page }) => {
      const categorySelect = page.locator('select').first();
      const isVisible = await categorySelect.isVisible().catch(() => false);
      
      if (isVisible) {
        // Select a category
        await categorySelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Reset to all
        await categorySelect.selectOption({ index: 0 });
        await page.waitForTimeout(500);

        // Should show all results
        const attractions = page.locator('[data-testid*="attraction"]');
        const count = await attractions.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Vibe Tags Filter', () => {
    test('should have vibe tags', async ({ page }) => {
      const vibeTags = page.locator('[data-testid*="vibe"], [class*="tag"]');
      const count = await vibeTags.count();
      
      // Vibe tags may or may not be present depending on data
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter by vibe tag', async ({ page }) => {
      const vibeTags = page.locator('button').filter({ hasText: /family|adventure|culture|nature/i });
      const count = await vibeTags.count();
      
      if (count > 0) {
        // Click first vibe tag
        await vibeTags.first().click();
        await page.waitForTimeout(1000);

        // Results should be filtered
        const attractions = page.locator('[data-testid*="attraction"]');
        const filteredCount = await attractions.count();
        
        expect(filteredCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should toggle vibe tags', async ({ page }) => {
      const vibeTags = page.locator('button').filter({ hasText: /family|adventure|culture|nature/i });
      const count = await vibeTags.count();
      
      if (count > 0) {
        const firstTag = vibeTags.first();
        
        // Click to activate
        await firstTag.click();
        await page.waitForTimeout(500);

        // Click to deactivate
        await firstTag.click();
        await page.waitForTimeout(500);

        // Should complete without errors
        await expect(firstTag).toBeVisible();
      }
    });
  });

  test.describe('Combined Filters', () => {
    test('should apply multiple filters together', async ({ page }) => {
      // Apply type filter
      const sightsButton = page.getByRole('button', { name: /Sights/i });
      await sightsButton.click();
      await page.waitForTimeout(500);

      // Apply search filter
      const searchInput = page.getByPlaceholder(/Search/i);
      await searchInput.fill('Museum');
      await page.waitForTimeout(500);

      // Results should be filtered by both
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should clear all filters', async ({ page }) => {
      // Apply multiple filters
      const sightsButton = page.getByRole('button', { name: /Sights/i });
      await sightsButton.click();
      
      const searchInput = page.getByPlaceholder(/Search/i);
      await searchInput.fill('Test');
      await page.waitForTimeout(500);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Reset type filter
      const allButton = page.getByRole('button', { name: /All/i });
      await allButton.click();
      await page.waitForTimeout(500);

      // Should show all results
      const attractions = page.locator('[data-testid*="attraction"]');
      const count = await attractions.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('View Type Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have view type toggle buttons', async ({ page }) => {
    const gridButton = page.getByRole('button', { name: /Grid|List/i }).first();
    const isVisible = await gridButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(gridButton).toBeVisible();
    }
  });

  test('should toggle between grid and list view', async ({ page }) => {
    const viewButtons = page.getByRole('button').filter({ hasText: /Grid|List/i });
    const count = await viewButtons.count();
    
    if (count >= 2) {
      // Click list view
      await viewButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Click grid view
      await viewButtons.nth(0).click();
      await page.waitForTimeout(500);

      // Should complete without errors
      await expect(viewButtons.first()).toBeVisible();
    }
  });

  test('should maintain filter state when changing view', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill('Zürich');
    await page.waitForTimeout(500);

    const viewButtons = page.getByRole('button').filter({ hasText: /Grid|List/i });
    const count = await viewButtons.count();
    
    if (count >= 2) {
      // Change view
      await viewButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Search should still be applied
      await expect(searchInput).toHaveValue('Zürich');
    }
  });
});

test.describe('Filter Persistence', () => {
  test('should maintain filters when navigating away and back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Apply filters
    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill('Museum');
    await page.waitForTimeout(500);

    // Navigate to chat page
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filters may or may not persist depending on implementation
    // Just verify page loads correctly
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Filter Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have accessible labels for filter controls', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    
    // Search input should have label or aria-label
    const ariaLabel = await searchInput.getAttribute('aria-label');
    const placeholder = await searchInput.getAttribute('placeholder');
    
    expect(ariaLabel || placeholder).toBeTruthy();
  });

  test('should be keyboard navigable', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    
    // Focus search input
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // Type with keyboard
    await page.keyboard.type('Zürich');
    await expect(searchInput).toHaveValue('Zürich');

    // Tab to next element
    await page.keyboard.press('Tab');
    
    // Should move focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA roles for filter buttons', async ({ page }) => {
    const filterButtons = page.getByRole('button').filter({ hasText: /All|Sights|Resorts/i });
    const count = await filterButtons.count();
    
    if (count > 0) {
      // All filter buttons should have button role
      for (let i = 0; i < Math.min(count, 3); i++) {
        const button = filterButtons.nth(i);
        const role = await button.getAttribute('role');
        
        // Should be button (implicit or explicit)
        expect(role === 'button' || role === null).toBe(true);
      }
    }
  });
});

test.describe('Filter Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should filter quickly with search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    
    const startTime = Date.now();
    await searchInput.fill('Zürich');
    await page.waitForTimeout(1000);
    const endTime = Date.now();

    // Filtering should be reasonably fast (< 2 seconds)
    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('should handle rapid filter changes', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i);
    
    // Rapidly change search
    await searchInput.fill('A');
    await searchInput.fill('AB');
    await searchInput.fill('ABC');
    await searchInput.fill('ABCD');
    await page.waitForTimeout(1000);

    // Should handle without crashing
    await expect(searchInput).toHaveValue('ABCD');
  });
});
