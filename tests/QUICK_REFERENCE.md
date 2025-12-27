# Quick Test Reference Guide

## Quick Commands

```bash
# Run all tests
pnpm test

# Run with UI (best for development)
pnpm test:ui

# Run with browser visible
pnpm test:headed

# Run specific browser
pnpm test:chromium
```

## Run Specific Test Suites

```bash
# API tests (36 tests - fast, ~2s)
pnpm test tests/api/

# Component tests (~60 tests)
pnpm test tests/components/

# Integration tests (~40 tests)
pnpm test tests/integration/

# Edge case tests (~50 tests)
pnpm test tests/edge-cases/

# Core E2E tests (~97 tests)
pnpm test tests/navigation.spec.ts
pnpm test tests/chat-page.spec.ts
pnpm test tests/context-manager.spec.ts
pnpm test tests/orchestrator.spec.ts
pnpm test tests/mcp-prompts.spec.ts
```

## Run Individual Test Files

```bash
# BoardCard component
pnpm test tests/components/board-card.spec.ts

# UI Cards
pnpm test tests/components/ui-cards.spec.ts

# API Routes
pnpm test tests/api/api-routes.spec.ts

# Filters and Search
pnpm test tests/integration/filter-search.spec.ts

# Error Handling
pnpm test tests/edge-cases/error-handling.spec.ts
```

## Debugging Tests

```bash
# Debug specific test
pnpm exec playwright test --debug tests/api/api-routes.spec.ts

# View test report
pnpm exec playwright show-report

# Generate test code
pnpm exec playwright codegen http://localhost:3000
```

## Test Patterns

### Run tests matching a pattern

```bash
# All BoardCard tests
pnpm test -g "BoardCard"

# All API tests
pnpm test -g "API"

# All accessibility tests
pnpm test -g "Accessibility"

# All error handling tests
pnpm test -g "Error"
```

### Run tests in specific mode

```bash
# Run only failed tests
pnpm test --only-failed

# Update snapshots
pnpm test --update-snapshots

# Run in parallel
pnpm test --workers=4

# Run serially
pnpm test --workers=1
```

## Test Coverage by Time

### Quick Tests (~2-5 seconds)

- API routes tests
- Navigation tests

### Medium Tests (~10-20 seconds)

- Component tests
- Filter/search tests

### Longer Tests (~30-60 seconds)

- Chat page tests
- MCP prompts tests
- Error handling tests

## Useful Flags

```bash
# Show browser
--headed

# Debug mode
--debug

# Specific browser
--project=chromium

# Timeout
--timeout=60000

# Retries
--retries=2

# Reporter
--reporter=list
--reporter=html
--reporter=json
```

## CI/CD Integration

```bash
# Run in CI mode (with retries and screenshots)
CI=true pnpm test

# Generate HTML report
pnpm test --reporter=html

# Generate JSON report
pnpm test --reporter=json
```

## Common Test Scenarios

### Before Committing

```bash
# Run all tests quickly
pnpm test --workers=4
```

### During Development

```bash
# Use UI mode for interactive debugging
pnpm test:ui
```

### Debugging Failures

```bash
# Run failed tests with browser visible
pnpm test --only-failed --headed
```

### Verifying API Changes

```bash
# Run API tests specifically
pnpm test tests/api/ --reporter=list
```

### Checking Component Changes

```bash
# Run component tests
pnpm test tests/components/ --headed
```

## Test File Structure

```
tests/
├── Core E2E Tests (5 files, ~97 tests)
│   ├── navigation.spec.ts
│   ├── chat-page.spec.ts
│   ├── context-manager.spec.ts
│   ├── orchestrator.spec.ts
│   └── mcp-prompts.spec.ts
│
├── components/ (2 files, ~60 tests)
│   ├── board-card.spec.ts
│   └── ui-cards.spec.ts
│
├── api/ (1 file, 36 tests)
│   └── api-routes.spec.ts
│
├── integration/ (1 file, ~40 tests)
│   └── filter-search.spec.ts
│
└── edge-cases/ (1 file, ~50 tests)
    └── error-handling.spec.ts
```

## Tips

1. **Use UI mode** for development - it's interactive and shows test execution
2. **Run API tests first** - they're fast and catch backend issues
3. **Use --headed** when debugging - see what the browser is doing
4. **Check the HTML report** - it has screenshots and traces for failures
5. **Run specific tests** during development - faster feedback loop

## Troubleshooting

### Tests timing out?

```bash
# Increase timeout
pnpm test --timeout=120000
```

### Browser not installed?

```bash
# Install Playwright browsers
pnpm exec playwright install
```

### Tests flaky?

```bash
# Add retries
pnpm test --retries=3
```

### Need to see what's happening?

```bash
# Run headed with slow motion
pnpm test --headed --slow-mo=1000
```

## Documentation

- **README.md** - Full test documentation
- **TEST_COVERAGE_SUMMARY.md** - Detailed coverage metrics
- **IMPLEMENTATION_COMPLETE.md** - Implementation summary

---

**Total Tests**: ~292  
**Test Files**: 9  
**Coverage**: Comprehensive
