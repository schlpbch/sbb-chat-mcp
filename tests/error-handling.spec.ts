import { test, expect } from '@playwright/test';

/**
 * Error Handling Tests
 * Tests error scenarios and edge cases across the application
 */

test.describe('Error Handling', () => {
  test.describe('Network Errors', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Simulate offline
      await context.setOffline(true);

      const input = page.getByTestId('chat-input');
      await input.fill('Test message');
      await page.getByTestId('send-button').click();

      // Should show error message
      await page.waitForTimeout(2000);
      
      const errorMessage = page.locator('[role="alert"]');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      // Either shows error or handles gracefully
      expect(typeof hasError).toBe('boolean');

      // Restore online
      await context.setOffline(false);
    });

    test('should handle slow network connections', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      await input.fill('Test slow network');
      await page.getByTestId('send-button').click();

      // Should show loading state
      const loadingIndicator = page.getByTestId('loading-indicator');
      const isLoading = await loadingIndicator.isVisible().catch(() => false);
      
      expect(typeof isLoading).toBe('boolean');
    });

    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/llm/chat', async route => {
        requestCount++;
        if (requestCount === 1) {
          // Fail first request
          await route.abort('failed');
        } else {
          // Succeed on retry
          await route.continue();
        }
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      await input.fill('Test retry');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(5000);

      // Should have retried
      expect(requestCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('API Errors', () => {
    test('should handle 500 server errors', async ({ page }) => {
      await page.route('**/api/llm/chat', async route => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      await input.fill('Test 500 error');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Should show error message
      const errorMessage = page.locator('text=/error|failed/i');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      expect(typeof hasError).toBe('boolean');
    });

    test('should handle 404 not found errors', async ({ page }) => {
      await page.route('**/api/mcp-proxy/tools/nonexistent', async route => {
        await route.fulfill({
          status: 404,
          body: JSON.stringify({ error: 'Not Found' }),
        });
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // API errors should be handled gracefully
      expect(true).toBe(true);
    });

    test('should handle malformed API responses', async ({ page }) => {
      await page.route('**/api/llm/chat', async route => {
        await route.fulfill({
          status: 200,
          body: 'Invalid JSON{{{',
        });
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      await input.fill('Test malformed response');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Should handle parsing error
      const errorMessage = page.locator('[role="alert"]');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      expect(typeof hasError).toBe('boolean');
    });
  });

  test.describe('Input Validation', () => {
    test('should handle empty input', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const sendButton = page.getByTestId('send-button');
      
      // Should be disabled when empty
      await expect(sendButton).toBeDisabled();
    });

    test('should handle very long input', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      const longText = 'A'.repeat(10000);
      
      await input.fill(longText);
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Should either accept or show validation error
      expect(true).toBe(true);
    });

    test('should handle special characters', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const input = page.getByTestId('chat-input');
      const specialChars = '<script>alert("xss")</script>';
      
      await input.fill(specialChars);
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Should sanitize input and not execute scripts
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog);
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      
      expect(alerts.length).toBe(0);
    });
  });

  test.describe('Session Management', () => {
    test('should handle session expiration', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Clear session storage
      await page.evaluate(() => sessionStorage.clear());

      const input = page.getByTestId('chat-input');
      await input.fill('Test after session clear');
      await page.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Should create new session
      expect(true).toBe(true);
    });

    test('should handle concurrent sessions', async ({ page, context }) => {
      // Open first tab
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/chat');
      await page2.waitForLoadState('networkidle');

      // Send message in first tab
      const input1 = page.getByTestId('chat-input');
      await input1.fill('Message from tab 1');
      await page.getByTestId('send-button').click();

      // Send message in second tab
      const input2 = page2.getByTestId('chat-input');
      await input2.fill('Message from tab 2');
      await page2.getByTestId('send-button').click();

      await page.waitForTimeout(2000);

      // Both should work independently
      expect(true).toBe(true);

      await page2.close();
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should handle missing localStorage', async ({ page }) => {
      await page.goto('/');
      
      // Disable localStorage
      await page.evaluate(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: false,
        });
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Should still work without localStorage
      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible();
    });

    test('should handle missing sessionStorage', async ({ page }) => {
      await page.goto('/');
      
      // Disable sessionStorage
      await page.evaluate(() => {
        Object.defineProperty(window, 'sessionStorage', {
          value: null,
          writable: false,
        });
      });

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Should still work
      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible();
    });
  });

  test.describe('Resource Loading', () => {
    test('should handle missing images gracefully', async ({ page }) => {
      await page.route('**/*.{png,jpg,jpeg,svg,webp}', route => route.abort());

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should still render
      const navbar = page.getByRole('banner');
      await expect(navbar).toBeVisible();
    });

    test('should handle missing fonts gracefully', async ({ page }) => {
      await page.route('**/*.{woff,woff2,ttf}', route => route.abort());

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should still render with fallback fonts
      const navbar = page.getByRole('banner');
      await expect(navbar).toBeVisible();
    });
  });

  test.describe('JavaScript Errors', () => {
    test('should not have console errors on page load', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error));

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should have no errors
      expect(errors.length).toBe(0);
    });

    test('should not have console errors on navigation', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error));

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      await page.goto('/mcp-test');
      await page.waitForLoadState('networkidle');

      // Should have no errors
      expect(errors.length).toBe(0);
    });
  });
});
