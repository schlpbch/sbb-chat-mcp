# Fixes to Implement - Priority Order

## Fix #1: Missing Origin in "X to Y at TIME" Pattern 🔴 CRITICAL

### Problem
```typescript
Input: "Geneva to Lausanne at 14:30"
Expected: { origin: "Geneva", destination: "Lausanne", time: "14:30" }
Actual:   { origin: MISSING, destination: "Lausanne", time: "14:30" }
```

### Root Cause
The implicit pattern extractor in `intentExtractor.ts` (line 227-238):
```typescript
// Current code
const simplePattern = buildSimpleToPattern(languages);
const simpleMatch = message.match(simplePattern);
```

The regex pattern stops at "to" but doesn't account for additional context like "at 14:30".

### Fix Location
File: `src/lib/llm/context/intentExtractor.ts`
Function: `extractEntities()` (around line 227-238)

### Solution
Update the `buildSimpleToPattern` function to handle trailing context:

```typescript
function buildSimpleToPattern(languages: Language[]): RegExp {
  const toPrepositions = languages.flatMap(
    (lang) => ENTITY_PREPOSITIONS.destination[lang]
  );

  toPrepositions.sort((a, b) => b.length - a.length);

  const escapedPreps = toPrepositions.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  // OLD (problematic):
  // const pattern = `^(.+?)\\s+(?:${escapedPreps.join('|')})\\s+(.+?)(?=\\s+(?:at|um|à|alle|via)|$)`;

  // NEW (fixed):
  const pattern = `^(.+?)\\s+(?:${escapedPreps.join('|')})\\s+([^\\s]+(?:\\s+[^\\s]+)?)(?=\\s+(?:at|um|à|alle|via|on|tomorrow|today|morgen|demain|\\d)|$)`;

  return new RegExp(pattern, 'i');
}
```

**Changes:**
- Captures destination more precisely: `([^\\s]+(?:\\s+[^\\s]+)?)`
- Stops at time/date indicators: `at|um|à|alle|via|on|tomorrow|today|morgen|demain|\\d`

### Expected Impact
- Origin extraction accuracy: 88.2% → 100%
- Entity overall accuracy: 90.91% → 95.45%

---

## Fix #2: Date Format Completeness 🟡 MEDIUM

### Problem
```typescript
Input: "Trains next Monday"
Expected: { date: "next Monday" }
Actual:   { date: "monday" }
```

### Root Cause
File: `src/lib/llm/context/entityPatterns.ts`
The DATE_PATTERNS regex captures only the day name, not the "next" modifier:

```typescript
// Current:
/\b(next|this)\s+(week|month|monday|tuesday|...)\b/i
```

This pattern captures both groups but only returns the first capture group.

### Solution
Update `extractDate` function to return full match:

```typescript
export function extractDate(
  message: string,
  languages: Language[]
): string | undefined {
  for (const lang of languages) {
    const patterns = DATE_PATTERNS[lang];
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        // OLD: return match[1];  // First capture group only
        // NEW: return match[0];  // Full match
        return match[0];  // Returns "next Monday" instead of just "Monday"
      }
    }
  }
  return undefined;
}
```

### Expected Impact
- Date extraction accuracy: 80% → 100%
- Entity overall accuracy: 95.45% → 97.73%

---

## Fix #3: Time Meridiem Capture 🟡 MEDIUM

### Problem
```typescript
Input: "Trains at 2:30 pm"
Expected: { time: "2:30 pm" }
Actual:   { time: "2:30" }
```

### Root Cause
File: `src/lib/llm/context/entityPatterns.ts`
The TIME_PATTERNS regex for 12h format:

```typescript
// Current:
en: [
  /\b(\d{1,2}:\d{2})\b/,
  /\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i,  // ← This one should work!
]
```

The second pattern SHOULD capture "2:30 pm", but the first pattern matches first.

### Solution
Reorder patterns (match most specific first):

```typescript
export const TIME_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    // Match 12h format FIRST (most specific)
    /\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,  // "at 2:30 pm"
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,       // "2:30 pm" without "at"
    // Then 24h format
    /\b(\d{1,2}:\d{2})\b/,  // "14:30"
    // Finally relative times
    /\b(morning|afternoon|evening|night)\b/i,
  ],
  // Similar for other languages...
};
```

### Expected Impact
- Time extraction accuracy: 83.3% → 100%
- Entity overall accuracy: 97.73% → 100%

---

## Implementation Order

1. **Fix #1** (20-30 min) - Critical origin extraction
2. **Fix #2** (5 min) - Date format fix
3. **Fix #3** (10 min) - Time pattern reordering

**Total time**: 35-45 minutes
**Expected result**: Entity accuracy 90.91% → **100%** 🎯

---

## Testing Strategy

After each fix:
```bash
# Run entity benchmark only (faster)
npx tsx scripts/benchmark-entity-extraction.ts

# Verify specific cases:
# - "Geneva to Lausanne at 14:30" → origin: "Geneva" ✅
# - "Trains next Monday" → date: "next Monday" ✅
# - "Trains at 2:30 pm" → time: "2:30 pm" ✅
```

After all fixes:
```bash
# Run full benchmark suite
npx tsx scripts/run-all-benchmarks.ts
```

**Target**: 100% entity accuracy, 97% intent accuracy, 98.5% combined 🚀
