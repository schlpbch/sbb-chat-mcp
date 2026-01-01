# Entity Extraction Edge Cases: Deep Analysis

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Purpose:** Comprehensive analysis of edge cases in entity extraction with solutions and test cases

---

## Table of Contents

1. [Overview](#overview)
2. [Multi-Leg Journeys](#multi-leg-journeys)
3. [Ambiguous Prepositions](#ambiguous-prepositions)
4. [Compound Location Names](#compound-location-names)
5. [Mixed Language Queries](#mixed-language-queries)
6. [Temporal Expressions](#temporal-expressions)
7. [Implicit Entities](#implicit-entities)
8. [Special Characters & Formatting](#special-characters--formatting)
9. [Pronoun & Reference Resolution](#pronoun--reference-resolution)
10. [Test Suite](#test-suite)

---

## Overview

Entity extraction faces numerous edge cases in real-world usage. This document catalogs known issues, current workarounds, and proposed solutions.

### Entity Types Recap

```typescript
interface ExtractedEntities {
  origin?: string;           // Starting point
  destination?: string;      // End point
  date?: string;            // Travel date
  time?: string;            // Travel time
  eventType?: 'arrivals' | 'departures';
  intermediateStops?: string[];  // Via points (not yet implemented)
}
```

---

## Multi-Leg Journeys

### Problem: Via/Through Intermediate Stops

**Example Inputs:**
```
"From Zurich via Bern to Geneva"
"Zurich → Bern → Geneva"
"Travel from Zurich through Lucerne to Interlaken"
```

### Current Behavior

```typescript
// Input: "From Zurich via Bern to Geneva"
extractEntities(message)
// Output:
{
  origin: "Zurich Via Bern",  // ❌ WRONG - includes "via Bern"
  destination: "Geneva"       // ✅ Correct
}
```

**Why it fails:**
- "via" is not in STOP_WORDS
- Regex captures everything until "to"

### Solution 1: Add "via" to Stop Words

```typescript
// src/lib/llm/context/entityPatterns.ts

export const STOP_WORDS = [
  // ... existing stop words
  'via', 'über', 'par', 'tramite',  // Add multilingual "via"
];
```

**Result:**
```typescript
{
  origin: "Zurich",          // ✅ Correct
  destination: "Geneva"      // ✅ Correct
  // intermediateStops: ["Bern"]  // ⚠️ Lost information
}
```

### Solution 2: Extract Intermediate Stops (Recommended)

```typescript
// New function in entityPatterns.ts

/**
 * Extract intermediate stops from "via" expressions
 */
export function extractIntermediateStops(
  message: string,
  languages: Language[]
): string[] {
  const viaKeywords = {
    en: ['via', 'through'],
    de: ['über', 'via'],
    fr: ['par', 'via'],
    it: ['tramite', 'via'],
  };

  const viaTerms = languages.flatMap(lang => viaKeywords[lang]);
  const pattern = new RegExp(
    `(?:${viaTerms.join('|')})\\s+([^to|nach|à|a|via|über|par]+)`,
    'gi'
  );

  const stops: string[] = [];
  let match;
  while ((match = pattern.exec(message)) !== null) {
    stops.push(capitalizeLocation(match[1].trim()));
  }

  return stops;
}
```

**Usage:**
```typescript
// In extractEntities()
const intermediateStops = extractIntermediateStops(message, languages);
if (intermediateStops.length > 0) {
  entities.intermediateStops = intermediateStops;
}
```

**Result:**
```typescript
{
  origin: "Zurich",
  destination: "Geneva",
  intermediateStops: ["Bern"]  // ✅ Preserved
}
```

### Test Cases

| Input | Expected Output |
|-------|----------------|
| "Zurich via Bern to Geneva" | origin: Zurich, intermediateStops: [Bern], dest: Geneva |
| "From Zurich through Lucerne and Interlaken to Grindelwald" | origin: Zurich, intermediateStops: [Lucerne, Interlaken], dest: Grindelwald |
| "Zürich über Bern nach Genf" (DE) | origin: Zürich, intermediateStops: [Bern], dest: Genf |
| "De Zurich par Berne à Genève" (FR) | origin: Zurich, intermediateStops: [Berne], dest: Genève |

---

## Ambiguous Prepositions

### Problem 1: French "à" - Destination vs Location vs Time

**Examples:**
```
"Trains à Zurich"           → Location (trains IN Zurich)
"Aller à Zurich"            → Destination (go TO Zurich)
"À 14h30"                   → Time (AT 14:30)
```

### Current Handling

```typescript
// Priority: Check intent type FIRST
if (intentType === 'weather_check' || intentType === 'snow_conditions') {
  // Use location regex, not destination
  entities.origin = inMatch[2];
} else {
  // Use destination regex
  entities.destination = toMatch[2];
}
```

**Issues:**
- Works for weather/trip disambiguation
- ❌ Doesn't handle time extraction collision
- ❌ "Trains à Zurich à 14h" → Lost time

### Solution: Multi-Pass Extraction

```typescript
function extractEntities(message: string, languages: Language[], intentType: IntentType) {
  // Pass 1: Extract time FIRST (remove from message)
  const time = extractTime(message, languages);
  let cleanMessage = message;
  if (time) {
    // Remove time portion to avoid collision
    cleanMessage = message.replace(new RegExp(`à\\s+${time}`, 'gi'), '');
  }

  // Pass 2: Extract locations from clean message
  const originRegex = buildEntityRegex('origin', languages);
  const destinationRegex = buildEntityRegex('destination', languages);

  // ... rest of extraction logic
}
```

### Problem 2: Italian "a" - Same Issue

**Examples:**
```
"Treni a Milano"            → Location
"Andare a Milano"           → Destination
"Alle 14:30"                → Time
```

**Same solution applies.**

---

## Compound Location Names

### Problem: Multi-Word City Names

**Examples:**
```
"St. Gallen"
"Bad Ragaz"
"Zürich HB"
"Bern Wankdorf"
"Geneva Airport"
```

### Current Behavior

```typescript
// Input: "From St. Gallen to Zurich"
{
  origin: "St",              // ❌ WRONG - stops at period
  destination: "Zurich"
}
```

**Why it fails:**
- Period treated as sentence end in some regex
- Space after "St." confuses tokenization

### Solution 1: Improve Stop Word Boundary Detection

```typescript
// Current regex (problematic):
const pattern = `(...)\\.(?=\\s|$|[?!])`;  // Period ends entity

// Better regex:
const pattern = `(...)(?=\\s+(?:${STOP_WORDS.join('|')})\\b|$|[?!])`;
```

**Key change:** Don't stop at period, only at actual stop words

### Solution 2: Special Handling for Abbreviations

```typescript
// Known abbreviation patterns
const LOCATION_ABBREV_PATTERNS = [
  /\bSt\.\s+\w+/i,      // St. Gallen, St. Moritz
  /\bSte\.\s+\w+/i,     // Ste. Marie (French)
  /\bMt\.\s+\w+/i,      // Mt. Pilatus (rare)
];

function preserveAbbreviations(text: string): string {
  let result = text;
  LOCATION_ABBREV_PATTERNS.forEach(pattern => {
    result = result.replace(pattern, match => match.replace(/\.\s+/g, '·'));
  });
  return result;  // "St·Gallen"
}

// After extraction, restore:
entity.replace(/·/g, '. ');  // "St. Gallen"
```

### Test Cases

| Input | Expected Origin | Expected Destination |
|-------|----------------|---------------------|
| "From St. Gallen to Zurich" | St. Gallen | Zurich |
| "Bad Ragaz to Chur" | Bad Ragaz | Chur |
| "Zürich HB to Bern Wankdorf" | Zürich HB | Bern Wankdorf |
| "Geneva Airport to Lausanne" | Geneva Airport | Lausanne |

---

## Mixed Language Queries

### Problem: City Names in Multiple Languages

**Examples:**
```
"Geneva" (EN) vs "Genève" (FR) vs "Genf" (DE)
"Zurich" (EN) vs "Zürich" (DE/local)
"Bern" (EN/DE) vs "Berne" (FR)
```

### Current Behavior

Each variant is treated as a separate entity:
```typescript
// Query: "From Geneva to Genève"
{
  origin: "Geneva",
  destination: "Genève"  // Treated as different cities!
}
```

### Solution 1: City Name Normalization

```typescript
// src/lib/llm/context/cityNormalization.ts

const CITY_ALIASES: Record<string, string> = {
  // Normalize to canonical name (SBB standard)
  'geneva': 'Genève',
  'genève': 'Genève',
  'genf': 'Genève',
  'geneve': 'Genève',

  'zurich': 'Zürich',
  'zürich': 'Zürich',
  'zuerich': 'Zürich',

  'bern': 'Bern',
  'berne': 'Bern',

  'lucerne': 'Luzern',
  'luzern': 'Luzern',
  'lucerna': 'Luzern',

  // ... more aliases
};

export function normalizeCity(city: string): string {
  const lower = city.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');  // Remove accents for lookup

  return CITY_ALIASES[lower] || city;  // Return canonical or original
}
```

**Usage:**
```typescript
if (fromMatch) {
  entities.origin = normalizeCity(fromMatch[2].trim());
}
```

### Solution 2: Fuzzy Matching (Advanced)

```typescript
import { distance } from 'fastest-levenshtein';

function findClosestCity(input: string, knownCities: string[]): string {
  const normalized = input.toLowerCase();

  let bestMatch = input;
  let minDistance = Infinity;

  for (const city of knownCities) {
    const dist = distance(normalized, city.toLowerCase());
    if (dist < minDistance && dist <= 2) {  // Max 2 character difference
      minDistance = dist;
      bestMatch = city;
    }
  }

  return bestMatch;
}

// Usage:
const SWISS_CITIES = ['Zürich', 'Genève', 'Bern', 'Basel', ...];
entities.origin = findClosestCity(fromMatch[2], SWISS_CITIES);
```

---

## Temporal Expressions

### Problem 1: Relative Dates

**Examples:**
```
"tomorrow"           → Simple
"next Monday"        → Requires date calculation
"in 3 days"          → Arithmetic
"this weekend"       → Range (Sat-Sun)
"end of month"       → Complex calculation
```

### Current Behavior

```typescript
// DATE_PATTERNS only match literal strings
{
  date: "tomorrow"     // ✅ Extracted, but not parsed to actual date
}
```

**Issue:** LLM/tools need actual date (e.g., "2026-01-02"), not "tomorrow"

### Solution: Date Parser Service

```typescript
// src/lib/llm/context/dateParser.ts

export class DateParser {
  /**
   * Parse relative date expression to ISO date
   */
  static parse(expression: string, baseDate: Date = new Date()): string {
    const expr = expression.toLowerCase();

    // Today/Tomorrow/Yesterday
    if (expr === 'today' || expr === 'heute' || expr === "aujourd'hui") {
      return this.formatISO(baseDate);
    }
    if (expr === 'tomorrow' || expr === 'morgen' || expr === 'demain') {
      return this.formatISO(this.addDays(baseDate, 1));
    }
    if (expr === 'yesterday' || expr === 'gestern' || expr === 'hier') {
      return this.formatISO(this.addDays(baseDate, -1));
    }

    // Day of week (next Monday, etc.)
    const dayOfWeekMatch = expr.match(/(?:next|this|nächste)?\s*(monday|tuesday|...|montag|dienstag|...)/i);
    if (dayOfWeekMatch) {
      const targetDay = this.parseDayOfWeek(dayOfWeekMatch[1]);
      return this.formatISO(this.getNextDayOfWeek(baseDate, targetDay));
    }

    // Relative days (in 3 days)
    const relativeDaysMatch = expr.match(/in\s+(\d+)\s+days?/i);
    if (relativeDaysMatch) {
      const days = parseInt(relativeDaysMatch[1]);
      return this.formatISO(this.addDays(baseDate, days));
    }

    // Numeric dates (13.05.2024, 05/13/2024)
    const numericMatch = expr.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
    if (numericMatch) {
      return this.parseNumericDate(numericMatch);
    }

    // Fallback: return original
    return expression;
  }

  private static formatISO(date: Date): string {
    return date.toISOString().split('T')[0];  // "2026-01-02"
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private static getNextDayOfWeek(from: Date, targetDay: number): Date {
    const current = from.getDay();
    const daysToAdd = (targetDay - current + 7) % 7 || 7;
    return this.addDays(from, daysToAdd);
  }

  private static parseDayOfWeek(day: string): number {
    const days: Record<string, number> = {
      'monday': 1, 'montag': 1, 'lundi': 1,
      'tuesday': 2, 'dienstag': 2, 'mardi': 2,
      // ... rest of week
    };
    return days[day.toLowerCase()] || 0;
  }
}
```

**Integration:**
```typescript
// In extractEntities()
if (date) {
  entities.date = DateParser.parse(date);  // "tomorrow" → "2026-01-02"
}
```

### Problem 2: Time Expressions

**Examples:**
```
"14:30"              → Parse as-is
"2:30 pm"            → Convert to 24h (14:30)
"afternoon"          → Range (12:00-18:00)
"morning"            → Range (06:00-12:00)
"rush hour"          → Contextual (07:00-09:00, 17:00-19:00)
```

### Solution: Time Parser

```typescript
export class TimeParser {
  static parse(expression: string): string {
    const expr = expression.toLowerCase();

    // 24-hour format (14:30)
    const h24Match = expr.match(/(\d{1,2}):(\d{2})/);
    if (h24Match) {
      return `${h24Match[1].padStart(2, '0')}:${h24Match[2]}`;
    }

    // 12-hour format (2:30 pm)
    const h12Match = expr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (h12Match) {
      let hour = parseInt(h12Match[1]);
      const minute = h12Match[2] || '00';
      const meridiem = h12Match[3].toLowerCase();

      if (meridiem === 'pm' && hour !== 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }

    // Relative times
    const relativeMap: Record<string, string> = {
      'morning': '09:00',
      'morgens': '09:00',
      'matin': '09:00',
      'afternoon': '14:00',
      'nachmittags': '14:00',
      'après-midi': '14:00',
      'evening': '18:00',
      'abends': '18:00',
      'soir': '18:00',
    };

    return relativeMap[expr] || expression;
  }
}
```

---

## Implicit Entities

### Problem: Context-Dependent Entities

**Examples:**
```
User: "Find trains from Zurich to Bern"
Bot: "Here are 5 options..."
User: "What about tomorrow?"
       ↑ Implicit: origin=Zurich, destination=Bern (from context)
```

### Current Behavior

```typescript
// Query: "What about tomorrow?"
{
  date: "tomorrow"
  // ❌ Missing: origin, destination
}
```

**Impact:** Can't execute tools without origin/destination

### Solution: Context Merging

```typescript
// In contextManager.ts

export function mergeWithContext(
  extracted: ExtractedEntities,
  context: ConversationContext
): ExtractedEntities {
  return {
    // Use extracted if present, fallback to context
    origin: extracted.origin || context.location.origin,
    destination: extracted.destination || context.location.destination,
    date: extracted.date || context.time.date,
    time: extracted.time || context.time.departureTime,
    ...extracted,
  };
}
```

**Usage:**
```typescript
const rawEntities = extractEntities(message, languages, intentType);
const mergedEntities = mergeWithContext(rawEntities, sessionContext);
```

---

## Special Characters & Formatting

### Problem 1: Markdown Formatting

**Examples:**
```
"From **Zurich** to _Bern_"      → Bold/italic markers
"Zurich → Bern"                  → Unicode arrow
"Zürich HB (Hauptbahnhof)"       → Parentheses
```

### Current Handling

```typescript
// In capitalizeLocation()
return text.replace(/\*\*|_|#/g, '').trim();  // Strip markdown
```

**Issue:** Doesn't handle parentheses, arrows, etc.

### Solution: Enhanced Sanitization

```typescript
function sanitizeLocationName(text: string): string {
  return text
    // Remove markdown
    .replace(/\*\*|__|\*|_|#|`/g, '')
    // Remove parenthetical remarks
    .replace(/\s*\([^)]*\)/g, '')
    // Replace arrows with space
    .replace(/→|->|=>/g, ' ')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Usage:
entities.origin = capitalizeLocation(sanitizeLocationName(fromMatch[2]));
```

### Problem 2: Emoji in Messages

**Examples:**
```
"🚆 Zurich to Bern"
"Weather in Zurich ☀️"
```

**Solution:**
```typescript
function removeEmoji(text: string): string {
  // Remove emoji using Unicode ranges
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
}
```

---

## Pronoun & Reference Resolution

### Problem: Anaphora Resolution

**Examples:**
```
User: "Find trains from Zurich to Bern"
Bot: "Here are options..."
User: "What's the weather there?"
       ↑ "there" = Bern (destination from context)
```

### Current Behavior

No pronoun resolution - "there" not extracted

### Solution: Reference Resolver

```typescript
// src/lib/llm/context/referenceResolver.ts

export class ReferenceResolver {
  static resolve(
    message: string,
    context: ConversationContext
  ): string {
    let resolved = message;

    // Resolve location pronouns
    const pronounMap: Record<string, () => string | undefined> = {
      'there': () => context.location.destination || context.location.origin,
      'here': () => context.location.origin,
      'this place': () => context.location.origin,
      'that place': () => context.location.destination,
    };

    for (const [pronoun, resolver] of Object.entries(pronounMap)) {
      const replacement = resolver();
      if (replacement) {
        const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
        resolved = resolved.replace(regex, replacement);
      }
    }

    return resolved;
  }
}

// Usage:
const resolvedMessage = ReferenceResolver.resolve(message, context);
const entities = extractEntities(resolvedMessage, languages, intentType);
```

**Result:**
```typescript
// Input: "What's the weather there?"
// After resolution: "What's the weather Bern?"
{
  origin: "Bern"  // ✅ Resolved from context
}
```

---

## Test Suite

### Comprehensive Test Cases

```typescript
// tests/entityExtraction.test.ts

describe('Entity Extraction', () => {
  describe('Multi-leg journeys', () => {
    it('should extract intermediate stops', () => {
      const message = "From Zurich via Bern to Geneva";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.origin).toBe('Zurich');
      expect(result.intermediateStops).toEqual(['Bern']);
      expect(result.destination).toBe('Geneva');
    });

    it('should handle multiple via points', () => {
      const message = "Zurich via Bern via Lausanne to Geneva";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.intermediateStops).toEqual(['Bern', 'Lausanne']);
    });
  });

  describe('Compound location names', () => {
    it('should preserve abbreviations', () => {
      const message = "From St. Gallen to Zurich";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.origin).toBe('St. Gallen');
    });

    it('should handle multi-word cities', () => {
      const message = "Bad Ragaz to Chur";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.origin).toBe('Bad Ragaz');
    });
  });

  describe('Temporal expressions', () => {
    it('should parse "tomorrow" to ISO date', () => {
      const message = "Zurich to Bern tomorrow";
      const result = extractEntities(message, ['en'], 'trip_planning');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expected = tomorrow.toISOString().split('T')[0];

      expect(result.date).toBe(expected);
    });

    it('should convert 12h to 24h format', () => {
      const message = "Zurich to Bern at 2:30 pm";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.time).toBe('14:30');
    });
  });

  describe('Mixed languages', () => {
    it('should normalize city aliases', () => {
      const message = "From Geneva to Genève";
      const result = extractEntities(message, ['en', 'fr'], 'trip_planning');

      expect(result.origin).toBe('Genève');
      expect(result.destination).toBe('Genève');
    });
  });

  describe('Special characters', () => {
    it('should strip markdown formatting', () => {
      const message = "From **Zurich** to _Bern_";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.origin).toBe('Zurich');
      expect(result.destination).toBe('Bern');
    });

    it('should handle parenthetical remarks', () => {
      const message = "Zurich HB (main station) to Bern";
      const result = extractEntities(message, ['en'], 'trip_planning');

      expect(result.origin).toBe('Zurich HB');
    });
  });

  describe('Context merging', () => {
    it('should use context for missing entities', () => {
      const context = {
        location: { origin: 'Zurich', destination: 'Bern' }
      };

      const message = "What about tomorrow?";
      const raw = extractEntities(message, ['en'], 'trip_planning');
      const merged = mergeWithContext(raw, context);

      expect(merged.origin).toBe('Zurich');
      expect(merged.destination).toBe('Bern');
      expect(merged.date).toBeDefined();
    });
  });
});
```

---

## Summary: Implementation Priority

| Edge Case | Severity | Complexity | Priority | Effort |
|-----------|----------|------------|----------|--------|
| Multi-leg journeys (via) | High | Medium | 🔴 P0 | 2 days |
| Compound names (St. Gallen) | High | Low | 🔴 P0 | 1 day |
| Temporal parsing (tomorrow→ISO) | High | Medium | 🔴 P0 | 3 days |
| City name normalization | Medium | Low | 🟡 P1 | 1 day |
| Context merging | Medium | Low | 🟡 P1 | 1 day |
| French/Italian "à"/"a" collision | Medium | Medium | 🟡 P1 | 2 days |
| Pronoun resolution | Low | Medium | 🟢 P2 | 2 days |
| Emoji removal | Low | Low | 🟢 P2 | 0.5 days |

**Total Effort:** ~12 days for all P0+P1 items

---

**Document End**
