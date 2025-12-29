
import { test, expect } from '@playwright/test';

test.describe('Navigation and Map', () => {
  test('should navigate to map page', async ({ page }) => {
    await page.goto('/');

    // Brute force remove Onboarding Modal if present (overlay interception fix)
    await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        if (modal) modal.remove();
        // Also ensure body scroll is restored
        document.body.style.overflow = 'unset';
    });
    
    // Open Menu
    await page.getByLabel('Open menu').click();
    
    // Navigate to Map
    await page.getByRole('link', { name: 'Map' }).click();
    
    await expect(page).toHaveURL('/map');
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
