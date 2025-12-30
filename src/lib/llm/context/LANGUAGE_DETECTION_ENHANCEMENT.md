# Language Detection Enhancement

## Overview

Enhanced the `detectMessageLanguage()` function to use the user's selected language as an additional signal for more accurate language detection.

## Changes Made

### Updated Function Signature

**Before:**

```typescript
export function detectMessageLanguage(message: string): Language[]
```

**After:**

```typescript
export function detectMessageLanguage(
  message: string,
  userLanguage?: Language
): Language[]
```

## Behavior

The function now uses a **hybrid approach** combining:

1. **Content analysis** - Detects language indicators in the message
2. **User preference** - Prioritizes the user's selected language

### Logic Flow

1. **Analyze message content** - Check for language-specific keywords
2. **Apply user preference**:
   - If user's language is detected → Move it to front of array (highest priority)
   - If no languages detected → Use user's preference
   - If other languages detected → Add user's language as secondary option
3. **Fallback** - Default to English if nothing detected

## Examples

### Example 1: User's Language Detected in Message

```typescript
detectMessageLanguage("Züge von Zürich nach Bern", "de")
// Returns: ['de']
// User's language matches detected language
```

### Example 2: Mixed Language Input

```typescript
detectMessageLanguage("train from Zürich to Bern", "en")
// Content detects: ['de', 'en']
// Returns: ['en', 'de']
// User's preference (en) moved to front
```

### Example 3: No Language Indicators

```typescript
detectMessageLanguage("10:00", "fr")
// Content detects: []
// Returns: ['fr']
// Uses user's preference as fallback
```

### Example 4: Ambiguous Input

```typescript
detectMessageLanguage("Geneva to Zurich", "fr")
// Content detects: ['en'] (keywords "to")
// Returns: ['en', 'fr']
// Detected language first, user's preference as secondary
```

### Example 5: No User Preference

```typescript
detectMessageLanguage("Züge von Zürich")
// Content detects: ['de']
// Returns: ['de']
// Works as before when no user preference provided
```

## Benefits

1. **Better Accuracy** - Reduces false positives for ambiguous words
2. **User Context** - Respects user's language preference
3. **Backward Compatible** - `userLanguage` is optional
4. **Handles Mixed Input** - Supports multilingual queries
5. **Smart Prioritization** - User's language gets priority when detected

## Integration Points

When integrating into `intentExtractor.ts`, pass the user's selected language:

```typescript
// In intentExtractor.ts
export function extractIntent(
  message: string,
  userLanguage?: Language
): Intent {
  const detectedLanguages = detectMessageLanguage(message, userLanguage);
  
  // Use detected languages for keyword matching
  const tripKeywords = getAllKeywords('trip_planning', detectedLanguages);
  // ...
}
```

## Use Cases

### Case 1: Swiss User Switching Languages

A French-speaking Swiss user might ask:

- "Train de Lausanne à Zürich" (FR with DE city name)
- With `userLanguage: 'fr'`, we prioritize French keywords
- Detects both FR and DE, but FR comes first

### Case 2: Tourist Using English Interface

An English tourist might type:

- "Zurich to Bern tomorrow"
- With `userLanguage: 'en'`, we prioritize English patterns
- Even though city names could be German

### Case 3: Short Queries

User types just a time:

- "10:30"
- No language indicators in content
- Falls back to user's selected language

## Testing

```typescript
// Test cases to add in Phase 4
describe('detectMessageLanguage with user preference', () => {
  it('should prioritize user language when detected', () => {
    const result = detectMessageLanguage('train from Zurich', 'en');
    expect(result[0]).toBe('en');
  });

  it('should use user language as fallback', () => {
    const result = detectMessageLanguage('10:00', 'de');
    expect(result).toEqual(['de']);
  });

  it('should handle mixed language input', () => {
    const result = detectMessageLanguage('Züge from Zurich', 'de');
    expect(result).toContain('de');
    expect(result).toContain('en');
  });
});
```
