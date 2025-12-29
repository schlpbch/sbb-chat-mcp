
import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test('should allow saving commute preferences', async ({ page }) => {
    await page.goto('/settings');
    
    // Check initial state
    const homeInput = page.getByPlaceholder('e.g. Bern');
    await expect(homeInput).toBeVisible();
    
    // Enter Home Station
    await homeInput.fill('Bern');
    
    // Enter Work Station
    const workInput = page.getByPlaceholder('e.g. Zürich HB');
    await workInput.fill('Zürich HB');
    
    // Reload page to verify persistence
    await page.reload();
    
    await expect(homeInput).toHaveValue('Bern');
    await expect(workInput).toHaveValue('Zürich HB');
  });

  test('should allow changing theme', async ({ page }) => {
    await page.goto('/settings');
    
    // Click Dark Mode
    await page.getByRole('button', { name: 'Dark' }).click();
    
    // Verify class persistence (this assumes the theme change applies a class to html/body or persists in storage)
    // Checking the button state is active
    await expect(page.getByRole('button', { name: 'Dark' })).toHaveClass(/bg-white text-gray-900 shadow-sm/); // Based on recent visual updates logic
    
    // Click Light Mode
    await page.getByRole('button', { name: 'Light' }).click();
    await expect(page.getByRole('button', { name: 'Light' })).toHaveClass(/bg-white text-gray-900 shadow-sm/);
  });
});
