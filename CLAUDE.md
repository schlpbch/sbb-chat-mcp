# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**sbb-travel-companion** is a Next.js 16 application that provides a Swiss
travel Companion with MCP (Model Context Protocol) integration. It features an
AI-powered chat interface with automatic language detection, a REST API for easy
integration, an interactive map with tourist attractions, and comprehensive
testing tools for MCP servers.

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
│   │   ├── v1/query/      # REST API query endpoint (NEW)
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
│   ├── i18n/              # Internationalization (6 languages, split by language)
│   │   ├── index.ts       # Barrel export with types
│   │   ├── en.ts          # English translations (type source)
│   │   ├── de.ts          # German translations
│   │   ├── fr.ts          # French translations
│   │   ├── it.ts          # Italian translations
│   │   ├── zh.ts          # Chinese translations
│   │   └── hi.ts          # Hindi translations
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
console.log(t.chat.send); // Translated string
```

**File Structure:**

- `src/lib/i18n/index.ts` - Barrel export with types
- `src/lib/i18n/en.ts` - English (type source, ~490 lines)
- `src/lib/i18n/de.ts` - German (~490 lines)
- `src/lib/i18n/fr.ts` - French (~490 lines)
- `src/lib/i18n/it.ts` - Italian (~490 lines)
- `src/lib/i18n/zh.ts` - Chinese (~490 lines)
- `src/lib/i18n/hi.ts` - Hindi (~490 lines)

**Supported languages:** `en`, `de`, `fr`, `it`, `zh`, `hi`

**Adding a New Language:**

1. Create `src/lib/i18n/[code].ts`
2. Import `Translation` type from `en.ts`
3. Export const with type annotation: `export const [code]: Translation = {...}`
4. Add to `translations` object in `index.ts`

**Type Safety:**

- All translations must match the English structure
- TypeScript enforces structural equality at compile time
- The `Translation` type is derived from English translations

## Branding & Theme

### Brand Colors

All brand colors are centralized in `src/config/theme.ts`:

- **SBB Red (Primary)**: `#A5061C` - Main brand color
- **SBB Red (Hover)**: `#820415` - Darker shade for hover states
- **Logo**: Red square with white "SBB" text
- **App Name**: "Swiss Travel Companion"

### Usage

**In Components (TypeScript/TSX):**

```typescript
import { COLORS } from '@/config/theme';

// Use in inline styles
<div style={{ color: COLORS.brand.primary }} />

// Or prefer Tailwind classes
<button className="bg-sbb-red hover:bg-sbb-red-hover" />
```

**In Tailwind Config:**

The theme constants are already imported and used in `tailwind.config.ts`:

- `bg-sbb-red` - Primary red background
- `bg-sbb-red-hover` - Darker hover state
- `bg-sbb-red-light` - Light tint
- `bg-sbb-red-dark` - Dark shade

**Available Theme Constants:**

- `COLORS` - Brand, semantic, and neutral colors
- `SPACING` - Consistent spacing scale (xs to 5xl)
- `RADIUS` - Border radius values
- `TYPOGRAPHY` - Font families, sizes, weights
- `SHADOWS` - Box shadow presets
- `Z_INDEX` - Layering scale
- `BREAKPOINTS` - Responsive breakpoints
- `TRANSITIONS` - Animation timing
- `LAYOUT` - Layout constraints
- `APP_CONSTANTS` - App-specific magic numbers

See `src/config/theme.ts` for the complete theme configuration.

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
