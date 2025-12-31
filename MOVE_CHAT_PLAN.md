# Plan: Move Chat Dialogue to /chat Path

## Current State

- Chat interface is currently at the root path `/` (src/app/page.tsx)
- Root path contains the full chat application with WelcomeSection and MessageList
- No dedicated landing page exists

## Goal

Move the chat dialogue from `/` to `/chat` and create a new landing page at `/`

## Implementation Plan

### Phase 1: Create New Chat Route

**Files to create:**

1. `src/app/chat/page.tsx` - Move current chat interface here
2. `src/app/chat/layout.tsx` (optional) - Chat-specific layout if needed

**Actions:**

- Copy `src/app/page.tsx` → `src/app/chat/page.tsx`
- Rename component from `Home` to `ChatPage`
- Keep all chat functionality intact (useChat hook, MessageList, WelcomeSection, etc.)

### Phase 2: Create New Landing Page

**Files to create:**

1. `src/app/page.tsx` - New landing page (replace current)
2. `src/components/landing/` - Landing page components
   - `HeroSection.tsx` - Hero with title, description, CTA
   - `FeaturedExamples.tsx` - 6-8 highlighted example queries
   - `FeaturesSection.tsx` - Key features grid
   - `CTASection.tsx` - Call-to-action to start chatting

**Landing Page Structure:**

```text
┌─────────────────────────────────────┐
│ Hero Section                        │
│ - Title: "Swiss Travel Companion"  │
│ - Subtitle & Description            │
│ - Primary CTA: "Start Chatting →"  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Featured Examples (6-8 cards)       │
│ - Popular queries from each category│
│ - Click → Navigate to /chat + send │
│ - Categories: Trips, Weather, etc.  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Features Section                    │
│ - Real-time journey planning        │
│ - Weather & snow conditions         │
│ - Multilingual support (4 langs)    │
│ - Accessibility features            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ CTA Section                         │
│ - "Ready to explore Switzerland?"   │
│ - Button: "Start Your Journey"      │
└─────────────────────────────────────┘
```

**Example Selection Strategy:**

- **Landing page**: 6 **featured** examples using `getFeaturedExamples()`
  - 2 trip examples (domestic, weekend, international)
  - 2 weather examples (general weather + snow)
  - 1 station/departure example
  - 1 additional showcase example
- **Chat page**: **All examples** with categories (unchanged)
  - Full WelcomeSection component
  - Category filter (trips, weather, stations, markdown)
  - Shows all ~25 example queries
  - Interactive category selection

This gives landing page visitors a quick preview, while chat users get full exploration capabilities.

**Featured Examples Component:**

```typescript
// src/components/landing/FeaturedExamples.tsx
// Shows 6-8 curated examples
// Clicking navigates to /chat with query pre-filled
// Uses same ExampleQueryCard component
```

### Phase 3: Update Navigation & Links

**Files to update:**

1. `src/components/Navbar.tsx` - Add "Chat" link if needed
2. `src/components/Menu.tsx` - Update menu items
3. Any components with hardcoded `/` links

### Phase 4: Update Tests

**Files to update:**

1. `tests/*.spec.ts` - Update paths from `/` to `/chat`

### Phase 5: Update Documentation

**Files to update:**

1. `README.md` - Update screenshots and paths

## Migration Checklist

- [ ] Create feature branch: `git checkout -b feature/move-chat-to-chat-path`
- [ ] Create `src/app/chat/` directory
- [ ] Move chat interface to `src/app/chat/page.tsx`
- [ ] Create `src/components/landing/` directory
- [ ] Create landing page components:
  - [ ] HeroSection.tsx
  - [ ] FeaturedExamples.tsx (6-8 curated examples)
  - [ ] FeaturesSection.tsx
  - [ ] CTASection.tsx
- [ ] Create new `src/app/page.tsx` (landing page)
- [ ] Implement example click navigation (landing → /chat with query)
- [ ] Update navigation links in Navbar/Menu
- [ ] Update tests (paths from `/` to `/chat`)
- [ ] Test all functionality:
  - [ ] Landing page renders correctly
  - [ ] Featured examples navigate to /chat
  - [ ] Chat WelcomeSection still shows all examples
  - [ ] Navigation between pages works
- [ ] Update documentation (README.md)
- [ ] Build and test production: `npm run build`
- [ ] Deploy

## Implementation Details

### Featured Examples Navigation

When a user clicks an example on the landing page:

1. Navigate to `/chat`
2. Pre-fill the input with the example query
3. Optionally auto-send the query (or let user click send)

**Implementation approach:**

```typescript
// Landing page example click handler
const handleExampleClick = (query: string) => {
  router.push(`/chat?q=${encodeURIComponent(query)}`);
};

// Chat page - read query param and auto-fill
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    setInput(query);
    // Optional: auto-send
    // handleSendMessage(query);
  }
}, []);
```

### Example Selection for Landing Page

**Featured examples (6 total) - using existing queries from exampleQueries.ts:**

1. **trip-1**: "Find trains from Zurich to Bern tomorrow at 9am" 🚂 (Domestic trip)
2. **trip-4**: "Trains from Lausanne to St. Moritz this weekend" 🎿 (Weekend planning)
3. **International trip**: Add new example like "Trains from Zurich to Milan" or use existing international query
4. **weather-1**: "What's the weather in St. Moritz?" 🌤️ (Weather)
5. **weather-3**: "Snow conditions in Zermatt" ❄️ (Ski conditions)
6. **station-1**: "Show departures from Zurich HB" 🏢 (Live departures)

**Note**: Need to either:

- Option A: Reorder `getRandomExamples()` to return a better mix
- Option B: Create a new `getFeaturedExamples()` function that returns these specific 6
- Option C: Add an international trip example to the first 6 positions in exampleQueries.ts

**Recommended**: Option B - Create `getFeaturedExamples()` function that explicitly selects:

- 2 trip examples (1 domestic, 1 international or weekend)
- 2 weather examples (general weather + snow)
- 1 station/departure example
- 1 accessibility or eco-friendly example (optional 6th)

This ensures the landing page always shows a good variety of capabilities.

## Detailed Implementation Roadmap

### Step 1: Create Feature Branch (5 min)

```bash
git checkout -b feature/move-chat-to-chat-path
```

### Step 2: Move Chat to /chat Route (15 min)

### 2.1. Create chat directory

```bash
mkdir src/app/chat
```

### 2.2. Copy current page to chat

```bash
cp src/app/page.tsx src/app/chat/page.tsx
```

### 2.3. Update chat/page.tsx

- Rename component from `Home` to `ChatPage`
- Add query parameter handling for pre-filled queries:

```typescript
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setInput(query);
      // Optional: auto-send
      // handleSendMessage();
    }
  }, [searchParams]);
  
  // ... rest of component
}
```

### 2.4. Test /chat route

- Navigate to <http://localhost:3000/chat>
- Verify chat works correctly
- Test query parameter: <http://localhost:3000/chat?q=test>

### Step 3: Create Landing Page Components (60-90 min)

### 3.1. Create landing components directory

```bash
mkdir -p src/components/landing
```

### 3.2. Create HeroSection.tsx

```typescript
// src/components/landing/HeroSection.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  
  return (
    <section className="text-center py-20 px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Swiss Travel Companion
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your intelligent companion for Swiss public transport journeys, 
        weather, and station information
      </p>
      <button
        onClick={() => router.push('/chat')}
        className="bg-sbb-red text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors"
      >
        Start Chatting →
      </button>
    </section>
  );
}
```

### 3.3. Create FeaturedExamples.tsx

```typescript
// src/components/landing/FeaturedExamples.tsx
'use client';
import { useRouter } from 'next/navigation';
import { getFeaturedExamples } from '@/lib/exampleQueries';
import ExampleQueryCard from '@/components/ExampleQueryCard';
import type { Language } from '@/lib/i18n';

interface FeaturedExamplesProps {
  language: Language;
}

export default function FeaturedExamples({ language }: FeaturedExamplesProps) {
  const router = useRouter();
  const examples = getFeaturedExamples(language);
  
  const handleExampleClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };
  
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-4">
        Try These Examples
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Click any example to get started
      </p>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example) => (
          <ExampleQueryCard
            key={example.id}
            example={example}
            onClick={handleExampleClick}
          />
        ))}
      </div>
    </section>
  );
}
```

### 3.4. Create FeaturesSection.tsx

```typescript
// src/components/landing/FeaturesSection.tsx
export default function FeaturesSection() {
  const features = [
    {
      icon: '🚂',
      title: 'Journey Planning',
      description: 'Real-time train connections across Switzerland and beyond'
    },
    {
      icon: '🌤️',
      title: 'Weather & Snow',
      description: 'Current weather and ski conditions for your destination'
    },
    {
      icon: '🌍',
      title: 'Multilingual',
      description: 'Available in English, German, French, and Italian'
    },
    {
      icon: '♿',
      title: 'Accessible',
      description: 'Wheelchair-accessible routes and accessibility information'
    },
  ];
  
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 3.5. Create CTASection.tsx

```typescript
// src/components/landing/CTASection.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function CTASection() {
  const router = useRouter();
  
  return (
    <section className="py-20 px-4 bg-sbb-red text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Explore Switzerland?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Start planning your journey with our intelligent travel companion
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="bg-white text-sbb-red px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Your Journey
        </button>
      </div>
    </section>
  );
}
```

### Step 4: Create New Landing Page (30 min)

### 4.1. Create new src/app/page.tsx

```typescript
// src/app/page.tsx
'use client';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedExamples from '@/components/landing/FeaturedExamples';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={() => {}}
        onHelpClick={() => {}}
      />
      
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        language={language}
      />
      
      <main>
        <HeroSection />
        <FeaturedExamples language={language} />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}
```

### Step 5: Update Navigation (15 min)

### 5.1. Update Navbar (if needed)

- Add "Chat" link to navigate to /chat
- Or keep current navigation

### 5.2. Update Menu component

- Add /chat link if needed
- Update any hardcoded / links

### Step 6: Update Tests (30-45 min)

### 6.1. Update E2E tests

```bash
# Find all test files
grep -r "goto('/')" tests/
```

### 6.2. Update paths

- Change `page.goto('/')` to `page.goto('/chat')` for chat tests
- Add new tests for landing page
- Test navigation flow: landing → chat

### 6.3. Example test update

```typescript
// tests/chat.spec.ts
test('chat interface loads', async ({ page }) => {
  await page.goto('/chat'); // Changed from '/'
  await expect(page.locator('textarea')).toBeVisible();
});

// tests/landing.spec.ts (new)
test('landing page shows featured examples', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Swiss Travel Companion');
  // Should show 6 examples
  const examples = page.locator('[data-testid="example-card"]');
  await expect(examples).toHaveCount(6);
});
```

### Step 7: Update Documentation (15 min)

### 7.1. Update README.md

- Update screenshots if needed
- Document new route structure
- Update "Getting Started" section

### 7.2. Update any route documentation

### Step 8: Testing & Verification (30-45 min)

### 8.1. Manual testing checklist

- [ ] Landing page loads at /
- [ ] Featured examples show correctly (6 examples)
- [ ] Clicking example navigates to /chat with query
- [ ] Chat page loads at /chat
- [ ] Chat shows all examples in WelcomeSection
- [ ] Chat functionality works (send message, receive response)
- [ ] Navigation between pages works
- [ ] Language switching works on both pages
- [ ] Mobile responsive on both pages
- [ ] Back button works correctly

### 8.2. Build test

```bash
npm run build
npm run start
# Test production build
```

### 8.3. Run test suites

```bash
npm run test:unit
npm run test:e2e
```

### Step 9: Deploy (Variable)

### 9.1. Commit changes

```bash
git add .
git commit -m "feat: move chat to /chat and create landing page

- Moved chat interface to /chat route
- Created new landing page at / with:
  - Hero section with CTA
  - 6 featured examples
  - Features section
  - Call-to-action section
- Added query parameter support for pre-filled queries
- Updated navigation and tests
- Maintained full chat functionality"
```

### 9.2. Push and deploy

```bash
git push origin feature/move-chat-to-chat-path
# Create PR and merge
# Deploy to production
```

## Time Estimates

- Step 1: 5 min
- Step 2: 15 min
- Step 3: 60-90 min
- Step 4: 30 min
- Step 5: 15 min
- Step 6: 30-45 min
- Step 7: 15 min
- Step 8: 30-45 min
- Step 9: Variable

**Total: 3-4 hours** (excluding deployment)
