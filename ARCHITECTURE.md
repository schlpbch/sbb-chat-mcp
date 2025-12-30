# Swiss Travel Companion - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Data Flow](#data-flow)
8. [Styling Architecture](#styling-architecture)
9. [Responsive Design](#responsive-design)
10. [Testing Strategy](#testing-strategy)
11. [Performance Optimizations](#performance-optimizations)
12. [Future Enhancements](#future-enhancements)

---

## Overview

Swiss Travel Companion is a modern web application for discovering tourist attractions in
Switzerland. Built with Next.js 16, React 19, and Tailwind CSS Plus, it provides
an interactive map-based interface with powerful filtering and search
capabilities across multiple languages.

### Key Features

- Interactive Leaflet map with 300+ Swiss tourist attractions
- Multi-language support (EN, DE, FR, IT, ZH, HI)
- Advanced filtering (type, category, vibe tags, search)
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Real-time filtering with optimized performance
- Accessibility-focused UI components
- **MCP Testing Infrastructure** - Interactive testing suite for MCP tools,
  resources, and prompts

---

## Technology Stack

### Core Framework

- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library with latest features
- **TypeScript 5** - Type-safe development

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **Tailwind CSS Plus** - Enhanced design system with custom theme
- **Custom CSS Variables** - Dynamic theming support
- **Google Fonts (Outfit)** - Modern typography

### Mapping

- **Leaflet 1.9.4** - Interactive map library
- **OpenStreetMap** - Map tiles provider

### Data & Communication

- **Model Context Protocol (MCP)** - Tourist data integration
- **@modelcontextprotocol/sdk** - MCP client implementation

### Development & Testing

- **Playwright 1.57** - End-to-end testing framework
- **ESLint 9** - Code linting
- **pnpm** - Fast package manager

---

## Project Structure

```
swiss-explorer-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   └── mcp/            # MCP endpoints
│   │   │       ├── sights/     # Sights data endpoint
│   │   │       └── resorts/    # Resorts data endpoint
│   │   ├── globals.css         # Global styles & Tailwind config
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Home page (main dashboard)
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx      # Button component with variants
│   │   │   ├── Badge.tsx       # Badge/tag component
│   │   │   ├── Card.tsx        # Card container component
│   │   │   ├── Input.tsx       # Form input component
│   │   │   ├── Select.tsx      # Select dropdown component
│   │   │   └── index.ts        # UI components barrel export
│   │   ├── Map.tsx             # Leaflet map integration
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   └── Menu.tsx            # Slide-out menu
│   └── lib/                    # Utility libraries
│       ├── mcp-client.ts       # MCP client & types
│       └── i18n.ts             # Internationalization
├── tests/                      # Playwright tests
│   ├── navigation.spec.ts      # Navigation & UI tests
│   └── README.md               # Testing documentation
├── public/                     # Static assets
├── playwright.config.ts        # Playwright configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
└── ARCHITECTURE.md             # This file
```

---

## Design System

### Color Palette

The application uses a comprehensive color system based on Tailwind CSS Plus
principles:

#### Primary Colors (Blue)

- **Primary-50 to Primary-950**: Interactive elements, CTAs, active states
- Used for: Buttons, active filters, links, focus rings

#### Secondary Colors (Green)

- **Secondary-50 to Secondary-950**: Success states, resort markers
- Used for: Resort type badges, success messages

#### Neutral Colors (Slate)

- **Neutral-50 to Neutral-950**: Text, backgrounds, borders
- Used for: Text hierarchy, cards, borders, backgrounds

#### Semantic Colors

- **Success**: `#10b981` - Positive feedback
- **Warning**: `#f59e0b` - Warnings and alerts
- **Error**: `#ef4444` - Error states
- **Info**: `#3b82f6` - Informational messages

### Typography

- **Font Family**: Outfit (Google Fonts)
- **Scale**: xs (0.75rem) to 4xl (2.25rem)
- **Line Heights**: Optimized for readability
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing

Consistent spacing scale using CSS variables:

- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem
- 3xl: 4rem

### Border Radius

- sm: 0.25rem
- md: 0.375rem
- lg: 0.5rem
- xl: 0.75rem
- 2xl: 1rem
- 3xl: 1.5rem
- full: 9999px

### Shadows

Progressive shadow system for depth:

- sm: Subtle elevation
- md: Standard elevation
- lg: Prominent elevation
- xl: High elevation
- 2xl: Maximum elevation

---

## Component Architecture

### Component Hierarchy

```
App (page.tsx)
├── Navbar
│   ├── Logo
│   ├── Version Badge
│   ├── Language Selector
│   └── Dark Mode Toggle
├── Menu (Floating)
│   ├── Menu Button
│   ├── Overlay
│   └── Menu Panel
│       ├── Header
│       ├── Navigation Items
│       └── Footer
├── Sidebar (Filters)
│   ├── View Type Buttons
│   ├── Search Input
│   ├── Category Select
│   ├── Vibe Tags Cloud
│   └── Stats Footer
├── Map (Main Area)
│   ├── Leaflet Container
│   ├── Markers (CircleMarkers)
│   ├── Tooltips
│   └── Loading Overlay
└── Details Panel (Conditional)
    ├── Close Button
    ├── Image
    ├── Title & Badges
    ├── Description
    ├── Vibe Tags
    ├── Location Info
    └── CTA Button
```

### UI Component Library

All UI components follow a consistent API pattern:

#### Button Component

```typescript
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  fullWidth={boolean}
  isLoading={boolean}
  leftIcon={ReactNode}
  rightIcon={ReactNode}
/>
```

#### Badge Component

```typescript
<Badge
  variant="default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size="sm" | "md" | "lg"
  icon={ReactNode}
  removable={boolean}
  onRemove={() => void}
/>
```

#### Card Component

```typescript
<Card
  hover={boolean}
  onClick={() => void}
  padding="none" | "sm" | "md" | "lg"
  shadow="none" | "sm" | "md" | "lg" | "xl"
>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

---

## State Management

### Local State (React Hooks)

The application uses React hooks for state management:

#### Data State

- `attractions`: All loaded tourist attractions
- `filteredAttractions`: Results after applying filters
- `selectedAttraction`: Currently displayed attraction details

#### UI State

- `activeType`: Current type filter ('all' | 'sight' | 'resort')
- `searchQuery`: Search input value
- `selectedCategory`: Current category filter
- `activeTags`: Set of selected vibe tags
- `language`: Current UI language
- `loading`: Loading state indicator
- `error`: Error message state

### State Update Flow

```
User Interaction
    ↓
Event Handler (callback)
    ↓
State Update (useState)
    ↓
Effect Trigger (useEffect)
    ↓
Filtered Results Calculation
    ↓
Component Re-render
    ↓
UI Update
```

### Performance Optimizations

- **useMemo**: Tag counts and category lists are memoized
- **useCallback**: Event handlers are memoized to prevent unnecessary re-renders
- **useEffect Deps**: Carefully managed to prevent infinite loops

---

## Data Flow

### Initial Load

```
1. Component Mount
2. useEffect triggered
3. mcpClient.connect() → Establish MCP connection
4. mcpClient.getAllAttractions() → Fetch data
5. Parse sights and resorts
6. Set attractions state
7. Set filteredAttractions state
8. Render map markers
```

### Filtering Flow

```
User Changes Filter
    ↓
Update Filter State (activeType/searchQuery/etc.)
    ↓
useEffect([attractions, filters...]) triggers
    ↓
Apply filters in sequence:
  1. Type filter (sight/resort/all)
  2. Category filter
  3. Tag filter (AND operation with active tags)
  4. Text search (title + description, multi-language)
    ↓
Update filteredAttractions
    ↓
Map re-renders with new markers
    ↓
Stats updated
```

### Marker Interaction

```
User Clicks Marker
    ↓
onMarkerClick callback
    ↓
setSelectedAttraction(attraction)
    ↓
Details Panel slides in
    ↓
Marker style updates (highlighted)
```

---

## Styling Architecture

### Global Styles (globals.css)

#### Structure

1. **@theme block**: Design tokens and variables
2. **:root**: Light theme variables
3. **@media (prefers-color-scheme: dark)**: System dark mode
4. **.dark**: Manual dark mode override
5. **Base styles**: Reset and defaults
6. **Custom scrollbar**: Themed scrollbar
7. **Animations**: Keyframes and utility classes
8. **Utility classes**: Glass effect, gradients, etc.

### Tailwind Configuration

Using Tailwind CSS 4 with `@tailwindcss/postcss` plugin:

- Inline theme definition via `@theme` block
- CSS custom properties for dynamic theming
- Automatic dark mode variants
- Extended color palette
- Custom animation utilities

### Dark Mode Strategy

Dual approach for maximum compatibility:

1. **Automatic**: `@media (prefers-color-scheme: dark)`
2. **Manual**: `.dark` class on `<html>`

All components support both modes via Tailwind's `dark:` prefix.

---

## Responsive Design

### Breakpoints

Following Tailwind's default breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 768px (md)
- **Desktop**: 768px - 1024px (lg)
- **Large Desktop**: > 1024px (xl)

### Responsive Patterns

#### Mobile (< 640px)

- Stacked layout
- Full-width sidebar (can be toggled)
- Touch-optimized controls
- Reduced padding
- Simplified navigation

#### Tablet (640px - 1024px)

- Side-by-side layout
- Visible sidebar
- Standard spacing
- All features accessible

#### Desktop (> 1024px)

- Multi-column layout
- Fixed sidebar (320px)
- Floating menu
- Maximum content width
- Enhanced hover states

### Component Responsiveness

#### Navbar

```css
- Logo: Always visible
- Version badge: hidden sm:flex
- Controls: Responsive sizing
```

#### Sidebar

```css
- Width: w-full md:w-80
- Position: fixed md:relative
- Visibility: Toggle on mobile
```

#### Map

```css
- Height: Flex-based, adapts to screen
- Controls: Position adjusted per breakpoint
```

#### Details Panel

```css
- Width: w-full sm:w-96
- Position: fixed
- Slide animation from right
```

---

## Testing Strategy

### End-to-End Tests (Playwright)

#### Test Coverage

1. **Navigation**: Page load, routing, language switching
2. **Filters**: Type, category, tags, search
3. **Map**: Display, markers, interactions
4. **Menu**: Open/close, navigation
5. **Responsive**: Mobile, tablet, desktop viewports
6. **Dark Mode**: Toggle functionality
7. **Accessibility**: Keyboard navigation, ARIA labels

#### Test Execution

- **Browsers**: Chromium, Firefox, WebKit
- **Viewports**: Desktop, mobile (Pixel 5), mobile (iPhone 12)
- **CI/CD**: Automated on push with retries
- **Reporting**: HTML reports with screenshots

### Test Files

- `tests/navigation.spec.ts`: Core navigation and UI tests
- Future: `interaction.spec.ts`, `data.spec.ts`, `accessibility.spec.ts`

---

## Performance Optimizations

### Current Optimizations

1. **Code Splitting**

   - Dynamic import for Map component (Leaflet)
   - Reduces initial bundle size
   - Prevents SSR issues

2. **Memoization**

   - `useMemo` for expensive calculations (tag counts, categories)
   - `useCallback` for event handlers
   - Prevents unnecessary re-renders

3. **Map Rendering**

   - Canvas renderer for better performance with many markers
   - Marker recycling instead of recreation
   - Optimized tooltip binding

4. **Image Loading**

   - Lazy loading for attraction images
   - Aspect ratio containers to prevent layout shift

5. **CSS Optimization**
   - Tailwind CSS purging removes unused styles
   - Critical CSS inlined
   - Font optimization via next/font

### Metrics Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## MCP Testing Infrastructure

### Overview

The MCP Testing Infrastructure provides a comprehensive, interactive testing
suite for the Model Context Protocol (MCP) server. It enables developers to
discover, test, and debug MCP tools, resources, and prompts through a
user-friendly web interface.

### Architecture

```
MCP Testing Infrastructure
├── MCP Inspector (/mcp-test)
│   ├── Tools Tab (13 tools)
│   ├── Resources Tab (3 resources)
│   └── Prompts Tab (12 prompts)
├── Tool Test Pages (/tools/[name])
│   ├── Dynamic parameter forms
│   ├── Sensible defaults
│   ├── Result display with copy functionality
│   └── Full schema viewer
├── Resource Viewers (/resources/[uri])
│   ├── Resource metadata
│   ├── Fetch functionality
│   └── Content display
├── Prompt Testers (/prompts/[name])
│   ├── Argument forms
│   ├── Prompt execution
│   └── Result display
└── API Proxy Routes
    ├── /api/mcp-proxy/tools
    ├── /api/mcp-proxy/resources
    └── /api/mcp-proxy/prompts
```

### Components

#### 1. MCP Inspector (`/mcp-test`)

The central hub for MCP testing, providing an overview of all available
capabilities.

**Features:**

- **Server Selection**: Switch between GCloud Staging, Local, and API Routes
- **Tabbed Interface**: Separate views for Tools, Resources, and Prompts
- **Improved Layout**:
  - Tool names and badges on same line
  - Descriptions truncated to 2 lines for scannability
  - Parameter badges showing types and required status
  - Visual indicators for clickable items
- **Real-time Loading**: Fetches capabilities from MCP server on load
- **Clickable Cards**: Each item links to its dedicated test page

**Technical Details:**

```typescript
// State management
const [tools, setTools] = useState<ToolSchema[]>([]);
const [resources, setResources] = useState<ResourceSchema[]>([]);
const [prompts, setPrompts] = useState<PromptSchema[]>([]);
const [activeTab, setActiveTab] = useState<'tools' | 'resources' | 'prompts'>(
  'tools'
);
const [mcpServerUrl, setMcpServerUrl] = useState(defaultUrl);

// Fetching from proxy
const loadCapabilities = async () => {
  const response = await fetch(
    `/api/mcp-proxy/${activeTab}?server=${mcpServerUrl}`
  );
  const data = await response.json();
  // Update state
};
```

#### 2. Tool Test Pages (`/tools/[name]`)

Dynamic pages for testing individual MCP tools with full parameter support.

**Features:**

- **Sensible Defaults**: Pre-filled with realistic values (e.g., "Zürich HB" →
  "Bern")
- **Dynamic Forms**: Auto-generated from tool schema
- **Accessibility**:
  - Proper `htmlFor` linking labels to inputs
  - `aria-label` for required field indicators
  - `aria-describedby` for parameter descriptions
  - `required` attribute on mandatory inputs
  - `aria-busy` on submit button during execution
  - Enhanced focus rings for keyboard navigation
- **Copy Functionality**: One-click JSON copy with visual feedback
- **Schema Viewer**: Collapsible full schema display
- **Error Handling**: Clear error messages and validation

**Default Values** (`src/lib/toolDefaults.ts`):

```typescript
export const toolDefaults: Record<string, Record<string, any>> = {
  findTrips: {
    from: 'Zürich HB',
    to: 'Bern',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  },
  getWeather: {
    latitude: 47.3769, // Zürich
    longitude: 8.5417,
    forecastDays: 3,
  },
  // ... 11 more tools
};
```

**Copy to Clipboard Implementation:**

```typescript
<button
  onClick={(e) => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    const btn = e.currentTarget;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = originalText || 'Copy JSON';
    }, 2000);
  }}
  aria-label="Copy JSON result to clipboard"
>
  Copy JSON
</button>
```

#### 3. Resource Viewers (`/resources/[uri]`)

Pages for viewing and fetching MCP resources.

**Features:**

- Resource metadata display (URI, name, description)
- "Fetch Resource" button for on-demand loading
- JSON content display with formatting
- Back navigation to inspector

**Available Resources:**

- `co2://factors` - CO2 Emission Factors
- `about://service` - Service Information
- `calendar://current` - Current Service Calendar

#### 4. Prompt Testers (`/prompts/[name]`)

Interactive pages for testing MCP prompts with natural language arguments.

**Features:**

- Dynamic argument forms based on prompt schema
- Required/optional argument indicators
- Prompt execution with result display
- Full schema viewer

**Available Prompts:**

- `find-nearby-stations` - Find stations near coordinates
- `monitor-station` - Monitor station departures
- `optimize-transfers` - Optimize journey transfers
- `plan-journey` - Plan multi-leg journeys
- `check-weather-for-trip` - Weather for journey
- And 7 more...

#### 5. API Proxy Routes

Server-side proxy routes to handle CORS and secure MCP server communication.

**Routes:**

- `GET /api/mcp-proxy/tools?server=<url>` - Fetch available tools
- `GET /api/mcp-proxy/resources?server=<url>` - Fetch available resources
- `GET /api/mcp-proxy/prompts?server=<url>` - Fetch available prompts

**Implementation:**

```typescript
// src/app/api/mcp-proxy/tools/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverUrl = searchParams.get('server');

  const response = await fetch(`${serverUrl}/tools`);
  const data = await response.json();

  return Response.json(data);
}
```

### Accessibility Features

The MCP Testing Infrastructure follows WCAG 2.1 Level AA guidelines:

1. **Semantic HTML**: Proper use of `<form>`, `<label>`, `<button>` elements
2. **ARIA Labels**: All interactive elements have descriptive labels
3. **Keyboard Navigation**: Full keyboard support with visible focus indicators
4. **Screen Reader Support**: Proper labeling and descriptions
5. **Form Validation**: Native HTML5 validation with `required` attributes
6. **Error Messages**: Clear, accessible error feedback
7. **Focus Management**: Logical tab order and focus rings

### User Experience Enhancements

#### Visual Feedback

- **Loading States**: Spinners and disabled states during operations
- **Success Indicators**: "✓ Copied!" feedback on copy actions
- **Hover Effects**: Clear hover states on all interactive elements
- **Color Coding**: Red for required, gray for optional parameters

#### Information Display

- **Truncated Descriptions**: 2-line limit with `line-clamp-2` for scannability
- **Parameter Badges**: Inline display of parameter types
- **Count Summaries**: "Parameters (3): 2 required"
- **Collapsible Schemas**: Full schema available on demand

#### Navigation

- **Breadcrumbs**: "← Back to MCP Inspector" on all test pages
- **Clickable Cards**: Entire card is clickable with visual indicators
- **Arrow Icons**: Chevron icons indicating navigation
- **Server Selector**: Easy switching between environments

### Future Enhancements

#### LLM Integration (Planned)

Three options for adding natural language prompting:

**Option 1: Client-Side LLM (Gemini API)**

- Direct frontend integration
- Fast response times
- Cost: ~$0.0000375 per request

**Option 2: Server-Side Proxy (Recommended)**

- Secure API key storage
- Rate limiting and monitoring
- Flexible provider switching

**Option 3: MCP Prompts**

- Use existing prompt infrastructure
- Zero additional cost
- Limited to available prompts

See `docs/LLM_INTEGRATION_PLAN.md` for detailed implementation plans.

#### Planned Features

- [ ] Batch testing (run multiple tools sequentially)
- [ ] Test history and favorites
- [ ] Export test results to JSON/CSV
- [ ] Custom test suites
- [ ] Performance metrics (response time, success rate)
- [ ] Mock data generation
- [ ] Integration with CI/CD pipelines
- [ ] Collaborative testing (share test configurations)

### Performance Considerations

1. **Lazy Loading**: Tool schemas loaded on demand
2. **Memoization**: Parameter forms memoized to prevent re-renders
3. **Debounced Search**: Search input debounced for better performance
4. **Optimistic UI**: Immediate feedback before server response
5. **Error Boundaries**: Graceful error handling without page crashes

### Security

1. **Server-Side Proxy**: API keys never exposed to frontend
2. **Input Validation**: All user inputs validated before submission
3. **CORS Handling**: Proper CORS configuration on proxy routes
4. **Rate Limiting**: Can be added to proxy routes
5. **Sanitization**: JSON responses sanitized before display

---

## Future Enhancements

### Phase 1: Enhanced Filtering

- [ ] Date-based filtering (seasonal attractions)
- [ ] Distance-based filtering (from location)
- [ ] Price range filtering
- [ ] Accessibility requirements filtering

### Phase 2: User Features

- [ ] Save favorite attractions
- [ ] Create custom itineraries
- [ ] Share attraction lists
- [ ] User reviews and ratings

### Phase 3: Advanced Mapping

- [ ] Route planning between attractions
- [ ] Public transport integration
- [ ] Clustering for better performance at zoom levels
- [ ] Heat maps for popular areas

### Phase 4: Data Enhancements

- [ ] Real-time weather integration
- [ ] Live event information
- [ ] Booking integration (hotels, tickets)
- [ ] AR preview mode

### Phase 5: Social Features

- [ ] User accounts and profiles
- [ ] Community-contributed content
- [ ] Social sharing
- [ ] Trip planning collaboration

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Lint code
pnpm lint

# Run Playwright UI mode
pnpm test:ui

# Run tests in specific browser
pnpm test:chromium
```

### Best Practices

1. **Component Development**

   - Always use TypeScript
   - Export types alongside components
   - Follow single responsibility principle
   - Add JSDoc comments for complex logic

2. **Styling**

   - Use Tailwind utilities first
   - Extract repeated patterns to components
   - Use design system tokens (colors, spacing, etc.)
   - Support dark mode in all components

3. **State Management**

   - Keep state as local as possible
   - Use memoization for expensive computations
   - Avoid prop drilling (consider composition)
   - Use proper dependency arrays in hooks

4. **Testing**
   - Write tests for user journeys, not implementation
   - Use data-testid sparingly, prefer accessible selectors
   - Test responsive behavior
   - Test both light and dark modes

---

## Architecture Decisions

### Why Next.js 16?

- App Router for improved routing and layouts
- React Server Components support
- Built-in optimization features
- Excellent TypeScript support
- Great developer experience

### Why Tailwind CSS Plus?

- Comprehensive design system
- Excellent dark mode support
- Utility-first approach for rapid development
- Purges unused CSS automatically
- Easy customization via CSS variables

### Why Leaflet over Google Maps?

- Open source and free
- No API key required
- Excellent customization options
- Good performance with many markers
- Active community and plugins

### Why Playwright over Cypress?

- Multi-browser support (Chromium, Firefox, WebKit)
- Better mobile testing capabilities
- Faster execution
- Built-in test isolation
- Great TypeScript support

---

## Security Considerations

1. **Data Validation**: All user inputs are validated
2. **XSS Prevention**: React's built-in escaping
3. **HTTPS**: Enforced in production
4. **Dependency Scanning**: Regular updates and vulnerability checks
5. **CSP Headers**: Content Security Policy headers configured

---

## Accessibility

### WCAG 2.1 Level AA Compliance

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Readers**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: Meets AA standards in both light and dark modes
4. **Focus Indicators**: Visible focus states on all interactive elements
5. **Alt Text**: All images have descriptive alt text
6. **Language**: HTML lang attribute set and changed dynamically

---

## License & Credits

- Map data: © OpenStreetMap contributors
- Icons: Custom SVG icons
- Fonts: Outfit by Google Fonts
- Framework: Next.js by Vercel
- Styling: Tailwind CSS

---

_Last Updated: 2025-12-25_ _Version: 3.0.0 - MCP Testing Infrastructure_
