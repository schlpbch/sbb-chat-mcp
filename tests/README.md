# SBB Chat MCP - Playwright Tests

This directory contains end-to-end tests for the SBB Chat MCP application using
Playwright.

## Test Structure

### Core E2E Tests

- `navigation.spec.ts` - Tests for navigation, menu, map, and responsive design
- `chat-page.spec.ts` - Tests for chat interface, input, messages, and quick start
- `context-manager.spec.ts` - Tests for session handling and context management
- `orchestrator.spec.ts` - Tests for LLM orchestration and tool execution
- `mcp-prompts.spec.ts` - Tests for MCP prompt execution and inspector

### Component Tests (`components/`)

- `board-card.spec.ts` - Tests for BoardCard component (departures/arrivals)
- `ui-cards.spec.ts` - Tests for TripCard, WeatherCard, StationCard, EcoCard, ItineraryCard

### API Tests (`api/`)

- `api-routes.spec.ts` - Tests for MCP proxy, LLM chat, and tourist data APIs

### Integration Tests (`integration/`)

- `filter-search.spec.ts` - Tests for filtering, search, and view toggles

### Edge Cases (`edge-cases/`)

- `error-handling.spec.ts` - Tests for error handling, validation, and edge cases

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

### Navigation Tests (`navigation.spec.ts`)

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

### Chat Page Tests (`chat-page.spec.ts`)

- Page structure and semantics
- Quick start suggestions
- Input behavior and validation
- Message display
- Loading indicators
- Keyboard navigation
- Accessibility features

### Context Manager Tests (`context-manager.spec.ts`)

- Session ID generation and persistence
- Orchestration flag handling
- Message history management
- Language context support

### Orchestrator Tests (`orchestrator.spec.ts`)

- Orchestration detection
- Intent extraction
- Session context management
- Multi-step plan execution

### MCP Prompts Tests (`mcp-prompts.spec.ts`)

- Prompt listing and navigation
- Individual prompt pages
- Prompt execution
- Error handling
- UI/UX features
- Accessibility

### API Routes Tests (`api/api-routes.spec.ts`)

- MCP proxy tools API
- MCP proxy resources API
- MCP proxy prompts API
- LLM chat API
- Tourist data APIs
- Error handling

### Component Tests

#### BoardCard (`components/board-card.spec.ts`)

- Departure/arrival display
- Transport icons
- Platform information
- Delay indicators
- Platform changes
- Cancellations
- Accessibility

#### TripCard (`components/trip-card.spec.ts`)

- Trip information display
- Departure/arrival times
- Duration and transfers
- Platform information
- Accessibility
- Interactive features

#### WeatherCard (`components/weather-card.spec.ts`)

- Weather information display
- Temperature and conditions
- Weather icons
- Extended forecast
- Accessibility
- Error handling

#### EcoCard (`components/eco-card.spec.ts`)

- Eco-friendly travel info
- CO2 emissions comparison
- Savings calculations
- Visual design
- Accessibility

#### Filters (`components/filters.spec.ts`)

- Filter sidebar
- Category filtering
- Search functionality
- View type switching
- Vibe tags filtering
- Accessibility
- Performance (debouncing)

### Library Tests

#### i18n (`lib/i18n.spec.ts`)

- Translation functions
- Language switching
- Date/time formatting
- Number/currency formatting
- Missing translation handling

### Error Handling Tests (`error-handling.spec.ts`)

- Network errors (offline, slow, retries)
- API errors (500, 404, malformed)
- Input validation
- Session management
- Browser compatibility
- Resource loading
- JavaScript error monitoring

### Chat Interface Tests

- Page structure and semantics
- Welcome message display
- Input form accessibility
- Quick start suggestions
- Input behavior (enable/disable, clear, submit)
- Message display (user/assistant)
- Loading indicators
- Keyboard navigation
- ARIA labels and live regions

### Context Manager Tests

- Session ID generation and persistence
- Orchestration flag handling
- Language context propagation
- Conversation history management
- Quick start button integration

### Orchestrator Tests

- Orchestration detection for keywords
- Intent extraction (trip planning, itinerary)
- Session context maintenance
- Multi-language support

### MCP Prompts Tests

- Inspector navigation
- Prompt listing and display
- Individual prompt pages
- Prompt execution with arguments
- Error handling (missing args, invalid server)
- Loading states
- Accessibility (ARIA labels, keyboard navigation)

### BoardCard Component Tests

- Departures and arrivals display
- Transport icons and line badges
- Platform information and changes
- Departure/arrival times
- Delay indicators
- Cancellation markers
- Accessibility (ARIA labels, list semantics)
- Empty state handling

### UI Cards Tests

- TripCard: trip info, times, transfers
- WeatherCard: temperature, conditions
- StationCard: station names and info
- EcoCard: eco-friendly info, carbon footprint
- ItineraryCard: multi-step itineraries
- Common features: styling, dark mode, responsiveness, hover effects
- Accessibility: semantic HTML, heading hierarchy, labels

### API Routes Tests

- MCP Proxy Tools: listing, execution, error handling
- MCP Proxy Resources: listing, reading, URI validation
- MCP Proxy Prompts: listing, execution
- LLM Chat API: validation, orchestration, language support, history
- Tourist Data APIs: sights and resorts fetching

### Filter and Search Tests

- Type filter (All/Sights/Resorts)
- Search input (filtering, clearing, case-insensitive)
- Category filter dropdown
- Vibe tags filtering
- Combined filters
- View type toggle (grid/list)
- Filter persistence
- Accessibility (labels, keyboard navigation)
- Performance (speed, rapid changes)

### Error Handling Tests

- Network errors (timeout, offline, retry)
- Input validation (empty, long, special chars, emoji)
- API error responses (400, 404, malformed JSON)
- Data display edge cases (empty, missing fields, null values)
- UI state edge cases (rapid messages, back button, refresh, resize)
- Session management (multiple tabs, expiry)
- Accessibility edge cases (screen readers, focus, high contrast)
- Performance edge cases (large history, memory leaks)

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
