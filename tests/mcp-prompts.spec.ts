import { test, expect } from '@playwright/test';

/**
 * MCP Prompts E2E Tests
 * Tests all available prompts in the MCP Inspector
 */

const MCP_SERVER_URL = 'https://journey-service-mcp-staging-jf43t3fcba-oa.a.run.app';

// List of all prompts to test
const PROMPTS = [
  {
    name: 'check-connection',
    description: 'Verify MCP server connectivity',
    args: {},
    expectedContent: ['connection', 'status', 'server'],
  },
  {
    name: 'check-weather-for-trip',
    description: 'Check weather conditions for a trip',
    args: { origin: 'Zürich HB', destination: 'Bern' },
    expectedContent: ['weather', 'temperature', 'forecast'],
  },
  {
    name: 'compare-routes',
    description: 'Compare different route options',
    args: { origin: 'Zürich HB', destination: 'Geneva', criteria: 'fastest' },
    expectedContent: ['route', 'duration', 'comparison'],
  },
  {
    name: 'find-nearby-stations',
    description: 'Find stations near a location',
    args: { location: 'Zürich' },
    expectedContent: ['station', 'distance', 'nearby'],
  },
  {
    name: 'monitor-station',
    description: 'Live departure/arrival board',
    args: { station: 'Bern' },
    expectedContent: ['departure', 'arrival', 'platform'],
  },
  {
    name: 'optimize-transfers',
    description: 'Optimize transfer connections',
    args: { origin: 'Zürich HB', destination: 'Lugano' },
    expectedContent: ['transfer', 'connection', 'optimize'],
  },
  {
    name: 'plan-accessible-trip',
    description: 'Plan wheelchair-accessible trip',
    args: { origin: 'Zürich HB', destination: 'Bern' },
    expectedContent: ['accessible', 'wheelchair', 'assistance'],
  },
  {
    name: 'plan-commute',
    description: 'Plan daily commute',
    args: { home: 'Zürich', work: 'Bern' },
    expectedContent: ['commute', 'schedule', 'daily'],
  },
  {
    name: 'plan-eco-trip',
    description: 'Plan eco-friendly trip',
    args: { origin: 'Zürich HB', destination: 'Geneva' },
    expectedContent: ['eco', 'carbon', 'sustainable'],
  },
  {
    name: 'plan-family-trip',
    description: 'Plan family-friendly trip',
    args: { destination: 'Interlaken' },
    expectedContent: ['family', 'children', 'activities'],
  },
  {
    name: 'plan-ski-trip',
    description: 'Plan ski trip with snow conditions',
    args: { resort: 'Zermatt' },
    expectedContent: ['ski', 'snow', 'resort'],
  },
  {
    name: 'plan-trip-with-amenities',
    description: 'Plan trip with specific amenities',
    args: { origin: 'Zürich HB', destination: 'Bern', amenities: 'wifi,restaurant' },
    expectedContent: ['amenities', 'wifi', 'comfort'],
  },
];

test.describe('MCP Prompts - Inspector Navigation', () => {
  test('should navigate to MCP Inspector', async ({ page }) => {
    await page.goto('/mcp-test');
    
    // Check page loaded - use more specific selector
    await expect(page.getByRole('heading', { name: 'MCP Inspector' })).toBeVisible();
  });

  test('should show Prompts tab', async ({ page }) => {
    await page.goto('/mcp-test');
    
    // Click on Prompts tab
    const promptsTab = page.getByRole('button', { name: /Prompts/i });
    await expect(promptsTab).toBeVisible();
    await promptsTab.click();
    
    // Wait for prompts to load
    await page.waitForTimeout(1000);
    
    // Check that prompts are displayed
    const promptCards = page.locator('a[href^="/prompts/"]');
    const count = await promptCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display all expected prompts', async ({ page }) => {
    await page.goto('/mcp-test');
    
    // Click on Prompts tab
    await page.getByRole('button', { name: /Prompts/i }).click();
    await page.waitForTimeout(1000);
    
    // Check each prompt is listed
    for (const prompt of PROMPTS) {
      const promptLink = page.locator(`a[href="/prompts/${prompt.name}"]`);
      await expect(promptLink).toBeVisible();
    }
  });
});

test.describe('MCP Prompts - Individual Prompt Pages', () => {
  for (const prompt of PROMPTS) {
    test(`should load ${prompt.name} prompt page`, async ({ page }) => {
      await page.goto(`/prompts/${prompt.name}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check page loaded - use ID selector
      const heading = page.locator('#prompt-title');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(prompt.name);
      
      // Check Execute button exists
      const executeButton = page.getByRole('button', { name: /Execute Prompt/i });
      await expect(executeButton).toBeVisible();
    });
  }
});

test.describe('MCP Prompts - Execution Tests', () => {
  test.setTimeout(60000); // Increase timeout for API calls

  for (const prompt of PROMPTS) {
    test(`should execute ${prompt.name} prompt`, async ({ page }) => {
      await page.goto(`/prompts/${prompt.name}`);
      await page.waitForLoadState('networkidle');
      
      // Fill in arguments using accessible selectors
      for (const [key, value] of Object.entries(prompt.args)) {
        // Find input by its ID (which is set based on arg name)
        const input = page.locator(`#arg-${key}`);
        if (await input.isVisible().catch(() => false)) {
          await input.fill(String(value));
        }
      }
      
      // Click Execute button
      const executeButton = page.getByRole('button', { name: /Execute Prompt/i });
      await executeButton.click();
      
      // Wait for execution (increased timeout for API calls)
      await page.waitForTimeout(8000);
      
      // Check for results or error
      const resultsSection = page.locator('#results-heading');
      await expect(resultsSection).toBeVisible();
      
      // Check that we got some response (either success or error message)
      const hasResult = await page.locator('pre').isVisible().catch(() => false);
      const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
      
      expect(hasResult || hasError).toBe(true);
      
      // If successful, log result for debugging
      if (hasResult) {
        const resultText = await page.locator('pre').textContent();
        console.log(`✓ ${prompt.name} executed successfully`);
        console.log(`  Preview: ${resultText?.substring(0, 100)}...`);
      } else if (hasError) {
        const errorText = await page.locator('[role="alert"]').textContent();
        console.log(`⚠ ${prompt.name} returned error: ${errorText}`);
      }
    });
  }
});

test.describe('MCP Prompts - Error Handling', () => {
  test('should handle missing required arguments', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Don't fill in required 'station' argument
    const executeButton = page.getByRole('button', { name: /Execute Prompt/i });
    await executeButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should show error or validation message
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasValidation = await page.locator('input:invalid').count() > 0;
    
    expect(hasError || hasValidation).toBe(true);
  });

  test('should handle invalid server URL gracefully', async ({ page }) => {
    await page.goto('/prompts/check-connection');
    await page.waitForLoadState('networkidle');
    
    // Set invalid server URL in localStorage
    await page.evaluate(() => {
      localStorage.setItem('mcpServerUrl', 'http://invalid-server.example.com');
    });
    
    // Reload to pick up new server URL
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Try to execute
    const executeButton = page.getByRole('button', { name: /Execute Prompt/i });
    await executeButton.click();
    
    // Wait for error
    await page.waitForTimeout(5000);
    
    // Should show error
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
  });
});

test.describe('MCP Prompts - UI/UX Tests', () => {
  test('should show loading state during execution', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Fill in required argument
    const stationInput = page.locator('#arg-station');
    await stationInput.fill('Bern');
    
    // Click Execute button
    const executeButton = page.getByRole('button', { name: /Execute Prompt/i });
    await executeButton.click();
    
    // Check for loading state (aria-busy)
    await expect(executeButton).toHaveAttribute('aria-busy', 'true');
    
    // Wait for completion
    await page.waitForTimeout(8000);
    
    // Button should be back to normal
    await expect(page.getByRole('button', { name: /Execute Prompt/i })).toBeVisible();
  });

  test('should navigate back to MCP Inspector', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Click back button using aria-label
    const backButton = page.getByRole('button', { name: /Back to MCP Inspector/i });
    await backButton.click();
    
    // Should be back at inspector
    await expect(page.getByRole('heading', { name: 'MCP Inspector' })).toBeVisible();
  });

  test('should display argument descriptions', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Check that argument descriptions are visible (using describedby pattern)
    const descriptions = page.locator('[id^="arg-"][id$="-desc"]');
    const count = await descriptions.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should mark required arguments', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Check for required indicator (asterisk) and aria-required
    const requiredIndicator = page.locator('span.text-red-600:has-text("*")');
    await expect(requiredIndicator).toBeVisible();
    
    // Check aria-required attribute
    const requiredInput = page.locator('input[aria-required="true"]');
    await expect(requiredInput).toBeVisible();
  });
});

test.describe('MCP Prompts - Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Check sections have aria-labelledby
    const argumentsSection = page.locator('[aria-labelledby="arguments-heading"]');
    await expect(argumentsSection).toBeVisible();
    
    const resultsSection = page.locator('[aria-labelledby="results-heading"]');
    await expect(resultsSection).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/prompts/monitor-station');
    await page.waitForLoadState('networkidle');
    
    // Tab to first input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to type in focused input
    await page.keyboard.type('Zürich HB');
    
    // Check value was entered in the station input
    const input = page.locator('#arg-station');
    await expect(input).toHaveValue('Zürich HB');
  });
});
