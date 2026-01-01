# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**sbb-travel-companion** is a Next.js 16 application that provides a Swiss
travel Companion with MCP (Model Context Protocol) integration. It features an
AI-powered chat interface, interactive map with tourist attractions, and tools
for testing MCP servers.

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **UI**: Custom components with dark mode support
- **Maps**: Leaflet for interactive maps
- **LLM**: Google Gemini API for AI chat
- **Testing**: Playwright for E2E tests
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── llm/chat/      # Gemini LLM chat endpoint
│   │   ├── mcp-proxy/     # MCP server proxy routes
│   │   └── mcp/           # Local data routes (sights, resorts)
│   ├── chat/              # AI Travel Companion page
│   ├── health/            # Health dashboard page
│   ├── mcp-test/          # MCP Inspector page
│   ├── prompts/[name]/    # Prompt testing page
│   ├── resources/[uri]/   # Resource viewing page
│   ├── tools/[name]/      # Tool testing page
│   └── page.tsx           # Main map page
├── components/
│   ├── cards/             # Display cards (Trip, Station, Weather, etc.)
│   ├── chat/              # Chat UI components
│   ├── filters/           # Filter components for map
│   ├── ui/                # Base UI components (Button, Card, Input, etc.)
│   ├── Navbar.tsx         # Main navigation with SBB branding
│   ├── Menu.tsx           # Slide-out menu
│   └── ThemeProvider.tsx  # Dark mode context
├── config/
│   └── env.ts             # Environment configuration
├── contexts/
│   └── FilterContext.tsx  # Filter state management
├── hooks/                 # Custom React hooks
├── lib/
│   ├── llm/               # LLM integration (Gemini service, tools)
│   ├── i18n.ts            # Internationalization (6 languages)
│   ├── mcp-client.ts      # MCP client utilities
│   └── toolDefaults.ts    # Default values for MCP tools
└── tests/                 # Playwright test files
```

## Key Commands

```bash
# Development
pnpm run dev          # Start dev server (port 3000)

# Build
pnpm run build        # Production build
pnpm run start        # Start production server

# Testing
pnpm run test         # Run Playwright tests
pnpm run test:ui      # Run tests with UI
pnpm run test:headed  # Run tests in headed mode

# Linting
pnpm run lint         # Run ESLint
```

## Environment Variables

Create `.env.local` with:

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
MCP_SERVER_URL_STAGING=https://journey-service-mcp-staging-xxx.run.app
MCP_SERVER_URL_DEV=http://localhost:8080
```

## Important Patterns

### Dark Mode (Tailwind v4)

Dark mode is configured via `@variant` in `globals.css`:

```css
@variant dark (&:where(.dark, .dark *));
```

The `ThemeProvider` toggles the `.dark` class on `<html>`. Use `dark:` prefix
for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900">
```

### Page Layout Pattern

All pages should include Navbar and Menu for consistent navigation:

```tsx
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';

export default function Page() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <main className="flex-1">{/* Page content */}</main>
    </div>
  );
}
```

### MCP Server Communication

Use the proxy routes to avoid CORS issues:

```typescript
// Fetch tools
fetch(`/api/mcp-proxy/tools?server=${encodeURIComponent(mcpServerUrl)}`);

// Execute a tool
fetch(
  `/api/mcp-proxy/tools/${toolName}?server=${encodeURIComponent(mcpServerUrl)}`,
  {
    method: 'POST',
    body: JSON.stringify(params),
  }
);
```

### Internationalization

Import translations from `@/lib/i18n`:

```typescript
import { Language, translations } from '@/lib/i18n';

const t = translations[language];
console.log(t.title); // Translated string
```

Supported languages: `en`, `de`, `fr`, `it`, `zh`, `hi`

## Branding

- **SBB Red**: `#A5061C`
- **Logo**: Red square with white "SBB" text
- **App Name**: "Swiss Travel Companion"

## Known Issues

1. **Local data files**: The `/api/mcp/sights` and `/api/mcp/resorts` routes
   expect data files that may not exist locally. These are fallback routes;
   primary data comes from the MCP server.

2. **MCP Server Selection**: The selected MCP server URL is stored in
   `localStorage` under `mcpServerUrl`.

## Testing Notes

- Tests are in the `tests/` directory
- Use `data-testid` attributes for test selectors
- The dev server must be running for E2E tests

## File Naming Conventions

- Components: PascalCase (`Navbar.tsx`)
- Pages: lowercase with brackets for dynamic routes (`[name]/page.tsx`)
- Utilities: camelCase (`toolDefaults.ts`)
- CSS: `globals.css` in app directory
