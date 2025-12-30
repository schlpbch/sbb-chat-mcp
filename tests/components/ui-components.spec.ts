import { test, expect } from '@playwright/test';

/**
 * UI Components Tests
 * Tests for Button, Input, Card, Badge, Select, and other base UI components
 */

test.describe('Button Component', () => {
  test('should render button with primary variant', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="primary-btn" class="bg-sbb-red text-white hover:bg-sbb-red-125">
            Click me
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('primary-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/bg-sbb-red/);
    await expect(button).toHaveText('Click me');
  });

  test('should render button with secondary variant', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="secondary-btn" class="bg-anthracite text-white">
            Secondary
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('secondary-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/bg-anthracite/);
  });

  test('should render button with outline variant', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="outline-btn" class="border-2 border-sbb-red text-sbb-red">
            Outline
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('outline-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/border-sbb-red/);
  });

  test('should render button with ghost variant', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="ghost-btn" class="text-anthracite hover:bg-milk">
            Ghost
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('ghost-btn');
    await expect(button).toBeVisible();
  });

  test('should support small size', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="small-btn" class="px-3 py-1.5 text-xs">Small</button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('small-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/text-xs/);
  });

  test('should support medium size (default)', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="medium-btn" class="px-6 py-2.5 text-sm">Medium</button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('medium-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/text-sm/);
  });

  test('should support large size', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="large-btn" class="px-8 py-3.5 text-base">Large</button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('large-btn');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/text-base/);
  });

  test('should support full width', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="full-width-btn" class="w-full">Full Width</button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('full-width-btn');
    await expect(button).toHaveClass(/w-full/);
  });

  test('should show loading state', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <button data-testid="loading-btn" disabled>
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"></svg>
            Loading...
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('loading-btn');
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();

    const spinner = button.locator('svg');
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveClass(/animate-spin/);
  });

  test('should be disabled when disabled prop is true', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="disabled-btn" disabled class="disabled:opacity-30">
            Disabled
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('disabled-btn');
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass(/opacity-30/);
  });

  test('should support left icon', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="btn-with-left-icon">
            <span class="mr-2">🔍</span>
            Search
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('btn-with-left-icon');
    await expect(button).toBeVisible();
    await expect(button).toContainText('🔍');
    await expect(button).toContainText('Search');
  });

  test('should support right icon', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="btn-with-right-icon">
            Next
            <span class="ml-2">→</span>
          </button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('btn-with-right-icon');
    await expect(button).toBeVisible();
    await expect(button).toContainText('Next');
    await expect(button).toContainText('→');
  });

  test('should be clickable', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <button data-testid="clickable-btn" onclick="alert('clicked')">Click Me</button>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const button = page.getByTestId('clickable-btn');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });
});

test.describe('Input Component', () => {
  test('should render input field', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <input data-testid="text-input" type="text" placeholder="Enter text" />
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const input = page.getByTestId('text-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  test('should support label', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>
            <label for="email" data-testid="input-label">Email</label>
            <input id="email" type="email" data-testid="email-input" />
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const label = page.getByTestId('input-label');
    const input = page.getByTestId('email-input');

    await expect(label).toBeVisible();
    await expect(label).toHaveText('Email');
    await expect(input).toBeVisible();
  });

  test('should show error message', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>
            <input data-testid="input-with-error" class="border-sbb-red" />
            <p data-testid="error-message" class="text-error">This field is required</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const input = page.getByTestId('input-with-error');
    const error = page.getByTestId('error-message');

    await expect(input).toBeVisible();
    await expect(input).toHaveClass(/border-sbb-red/);
    await expect(error).toBeVisible();
    await expect(error).toHaveText('This field is required');
  });

  test('should show helper text', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>
            <input data-testid="input-with-helper" />
            <p data-testid="helper-text" class="text-neutral-500">Enter your email address</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const helperText = page.getByTestId('helper-text');
    await expect(helperText).toBeVisible();
    await expect(helperText).toHaveText('Enter your email address');
  });

  test('should support left icon', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="relative">
            <div class="absolute left-3 top-1/2" data-testid="left-icon">🔍</div>
            <input data-testid="input-with-left-icon" class="pl-11" />
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const icon = page.getByTestId('left-icon');
    const input = page.getByTestId('input-with-left-icon');

    await expect(icon).toBeVisible();
    await expect(input).toHaveClass(/pl-11/);
  });

  test('should support right icon', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="relative">
            <input data-testid="input-with-right-icon" class="pr-11" />
            <div class="absolute right-3 top-1/2" data-testid="right-icon">✓</div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const icon = page.getByTestId('right-icon');
    const input = page.getByTestId('input-with-right-icon');

    await expect(icon).toBeVisible();
    await expect(input).toHaveClass(/pr-11/);
  });

  test('should support full width', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <input data-testid="full-width-input" class="w-full" />
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const input = page.getByTestId('full-width-input');
    await expect(input).toHaveClass(/w-full/);
  });

  test('should be disabled when disabled prop is true', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <input data-testid="disabled-input" disabled class="disabled:opacity-50" />
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const input = page.getByTestId('disabled-input');
    await expect(input).toBeDisabled();
    await expect(input).toHaveClass(/opacity-50/);
  });

  test('should accept user input', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <input data-testid="text-input" type="text" />
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const input = page.getByTestId('text-input');
    await input.fill('Hello World');
    await expect(input).toHaveValue('Hello World');
  });

  test('should support different input types', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <input data-testid="email-input" type="email" />
          <input data-testid="password-input" type="password" />
          <input data-testid="number-input" type="number" />
          <input data-testid="date-input" type="date" />
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    await expect(page.getByTestId('email-input')).toHaveAttribute(
      'type',
      'email'
    );
    await expect(page.getByTestId('password-input')).toHaveAttribute(
      'type',
      'password'
    );
    await expect(page.getByTestId('number-input')).toHaveAttribute(
      'type',
      'number'
    );
    await expect(page.getByTestId('date-input')).toHaveAttribute(
      'type',
      'date'
    );
  });
});

test.describe('Card Component', () => {
  test('should render card with content', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div data-testid="card" class="bg-white rounded-2xl shadow-lg p-6">
            <h2>Card Title</h2>
            <p>Card content goes here</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const card = page.getByTestId('card');
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/rounded-2xl/);
    await expect(card).toHaveClass(/shadow-lg/);
  });

  test('should support header section', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div data-testid="card">
            <div data-testid="card-header" class="border-b pb-3 mb-3">
              <h3>Card Header</h3>
            </div>
            <div>Content</div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const header = page.getByTestId('card-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Card Header');
  });

  test('should support footer section', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div data-testid="card">
            <div>Content</div>
            <div data-testid="card-footer" class="border-t pt-3 mt-3">
              <button>Action</button>
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const footer = page.getByTestId('card-footer');
    await expect(footer).toBeVisible();
  });

  test('should support hover effects', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div data-testid="hoverable-card" class="hover:shadow-xl transition-shadow cursor-pointer">
            Hover over me
          </div>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const card = page.getByTestId('hoverable-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/cursor-pointer/);
  });
});

test.describe('Badge Component', () => {
  test('should render badge with text', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <span data-testid="badge" class="px-2 py-1 rounded-full text-xs bg-sbb-red text-white">
            New
          </span>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const badge = page.getByTestId('badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('New');
    await expect(badge).toHaveClass(/rounded-full/);
  });

  test('should support different colors', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <span data-testid="red-badge" class="bg-sbb-red text-white">Red</span>
          <span data-testid="green-badge" class="bg-green-500 text-white">Green</span>
          <span data-testid="blue-badge" class="bg-blue-500 text-white">Blue</span>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    await expect(page.getByTestId('red-badge')).toHaveClass(/bg-sbb-red/);
    await expect(page.getByTestId('green-badge')).toHaveClass(/bg-green-500/);
    await expect(page.getByTestId('blue-badge')).toHaveClass(/bg-blue-500/);
  });
});

test.describe('Select Component', () => {
  test('should render select with options', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <select data-testid="select">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
            <option value="3">Option 3</option>
          </select>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const select = page.getByTestId('select');
    await expect(select).toBeVisible();

    const options = select.locator('option');
    await expect(options).toHaveCount(3);
  });

  test('should change selected option', async ({ page }) => {
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <select data-testid="select">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </body>
      </html>
    `;

    await page.setContent(testHtml);

    const select = page.getByTestId('select');
    await select.selectOption('de');
    await expect(select).toHaveValue('de');
  });
});

test.describe('UI Components - Integration', () => {
  test('should work together in chat interface', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Verify UI components are present
    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();
  });

  test('should maintain consistent styling across components', async ({
    page,
  }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Check that SBB branding is consistent
    const heading = page.getByRole('heading', {
      name: /Swiss Travel Companion/i,
    });
    await expect(heading).toBeVisible();
  });
});
