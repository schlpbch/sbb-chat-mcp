# SBB Chat MCP - Playwright Tests

This directory contains end-to-end tests for the SBB Chat MCP application using
Playwright.

## Test Structure

- `navigation.spec.ts` - Tests for navigation, menu, map, and responsive design

## Running Tests

### Prerequisites

First, install Playwright browsers:

```bash
pnpm exec playwright install
```

### Run all tests

```bash
pnpm test
```

### Run tests in UI mode (recommended for development)

```bash
pnpm test:ui
```

### Run tests with browser visible

```bash
pnpm test:headed
```

### Run tests in specific browser

```bash
pnpm test:chromium
```

## Test Coverage

### Navigation Tests

- Homepage loading
- Navbar with language selector
- Language switching
- Dark mode toggle
- Filter sidebar
- Type filtering (All/Sights/Resorts)
- Search functionality
- Category filter dropdown

### Menu Tests

- Menu open/close
- Menu items presence
- Menu item click behavior
- Overlay click behavior

### Map Tests

- Map display
- Loading state
- Leaflet integration

### Responsive Design Tests

- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Component visibility at different screen sizes

## Writing New Tests

Follow this pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Debugging Tests

### View test report

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

### Debug a specific test

```bash
pnpm exec playwright test --debug navigation.spec.ts
```

### Generate code for new tests

```bash
pnpm exec playwright codegen http://localhost:3000
```

## CI/CD

Tests are configured to run in CI with:

- 2 retries
- Single worker
- Screenshot on failure
- Trace on first retry

The web server is automatically started before tests run.
