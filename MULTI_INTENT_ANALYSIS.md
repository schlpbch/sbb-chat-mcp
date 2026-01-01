# Multi-Intent Query Analysis

## Problem Statement

The current intent extraction system classifies each query into **ONE** intent type, but real-world queries often contain **multiple intents** that need to be handled.

## Current Limitation - Single Intent Model

### Test Results

| Query | Expected Intents | Detected | Result |
|-------|-----------------|----------|--------|
| "Show me trains from Zurich to Bern and the weather in Bern" | `trip_planning` + `weather_check` | `trip_planning` only | ❌ Missing weather |
| "I need to get to Davos tomorrow. What are the snow conditions?" | `trip_planning` + `snow_conditions` | `snow_conditions` only | ❌ Missing trip planning |
| "Trains to Basel at 14:30. What platform?" | `trip_planning` + `station_search` | `station_search` only | ✅ Acceptable (station search implies trip) |
| "Weather in Zermatt and snow conditions" | `weather_check` + `snow_conditions` | `snow_conditions` only | ⚠️ Close (snow includes weather) |
| "Find trains from Zurich to Bern tomorrow morning and show arrivals at Bern" | `trip_planning` + `station_search` | `station_search` only | ❌ Missing trip planning |

**Success Rate: 20%** (1/5 acceptable, 4/5 missing intents)

---

## Solution Options

### Option 1: Multi-Intent Classification (Rule-Based Enhancement)

**Approach:** Detect multiple intents by checking keyword matches for ALL intent types.

**Implementation:**

```typescript
// Current (single intent):
function extractIntent(message: string): Intent {
  // Returns highest-scoring intent
  const scores = {
    trip_planning: calculateScore(message, TRIP_KEYWORDS),
    weather_check: calculateScore(message, WEATHER_KEYWORDS),
    // ... etc
  };
  return getHighestScore(scores);
}

// New (multi-intent):
function extractIntents(message: string): Intent[] {
  const scores = {
    trip_planning: calculateScore(message, TRIP_KEYWORDS),
    weather_check: calculateScore(message, WEATHER_KEYWORDS),
    snow_conditions: calculateScore(message, SNOW_KEYWORDS),
    station_search: calculateScore(message, STATION_KEYWORDS),
    train_formation: calculateScore(message, FORMATION_KEYWORDS),
  };

  // Return all intents above threshold (e.g., 0.5)
  return Object.entries(scores)
    .filter(([_, score]) => score >= 0.5)
    .map(([intent, score]) => ({
      type: intent,
      confidence: score,
      extractedEntities: extractEntitiesForIntent(message, intent),
    }))
    .sort((a, b) => b.confidence - a.confidence);
}
```

**Pros:**
- ✅ Fast (no LLM API calls)
- ✅ Free (no costs)
- ✅ Compatible with existing system
- ✅ Easy to implement (minor refactoring)

**Cons:**
- ⚠️ May produce false positives (e.g., "train" keyword triggers trip_planning even in unrelated contexts)
- ⚠️ Threshold tuning required
- ⚠️ Doesn't understand query structure (which intent comes first, dependencies)

**Estimated Effort:** 2-3 hours

---

### Option 2: Query Segmentation + Intent per Segment

**Approach:** Split query into segments (by punctuation, conjunctions), then classify each segment separately.

**Implementation:**

```typescript
function extractMultiIntents(message: string): Intent[] {
  // Split on common separators
  const segments = message.split(/[.?!,]|\s+and\s+|\s+then\s+/i);

  const intents: Intent[] = [];

  for (const segment of segments) {
    if (segment.trim().length < 3) continue; // Skip short fragments

    const intent = extractIntent(segment.trim());
    if (intent.confidence >= 0.5) {
      intents.push(intent);
    }
  }

  return intents;
}
```

**Example:**
```typescript
Input: "Show me trains from Zurich to Bern and the weather in Bern"

Segments:
1. "Show me trains from Zurich to Bern" → trip_planning (90%)
2. "the weather in Bern" → weather_check (80%)

Result: [trip_planning, weather_check] ✅
```

**Pros:**
- ✅ More accurate than Option 1
- ✅ Understands query structure better
- ✅ Still fast and free
- ✅ Minimal false positives

**Cons:**
- ⚠️ Segmentation may be imperfect
- ⚠️ Requires handling edge cases (e.g., "and" in "St. Gallen")
- ⚠️ May miss intents that don't have clear separators

**Estimated Effort:** 4-6 hours

---

### Option 3: LLM-Based Multi-Intent Extraction

**Approach:** Use Gemini to extract multiple intents and their relationships.

**Implementation:**

```typescript
const MULTI_INTENT_PROMPT = `You are analyzing a user query for a Swiss travel assistant.

Your task is to identify ALL intents in the user's message. A message may have 1 or more intents.

Possible intents:
1. trip_planning - Finding trains/journeys
2. weather_check - Weather information
3. snow_conditions - Snow/ski conditions
4. station_search - Station departures/arrivals
5. train_formation - Train composition/car location
6. general_info - General questions/greetings

Respond with valid JSON:
{
  "intents": [
    {
      "type": "trip_planning",
      "confidence": 0.9,
      "entities": { "origin": "Zurich", "destination": "Bern" },
      "priority": 1
    },
    {
      "type": "weather_check",
      "confidence": 0.85,
      "entities": { "origin": "Bern" },
      "priority": 2
    }
  ]
}`;

async function extractMultiIntentsWithLLM(message: string): Promise<Intent[]> {
  const result = await gemini.generateContent([
    { text: MULTI_INTENT_PROMPT },
    { text: `User message: "${message}"` }
  ]);

  return JSON.parse(result.response.text()).intents;
}
```

**Pros:**
- ✅ Most accurate
- ✅ Understands context and relationships
- ✅ Handles complex, nuanced queries
- ✅ Can prioritize intents

**Cons:**
- ❌ Costs money (API calls)
- ❌ Adds latency (~500ms-2s per query)
- ❌ Requires API key management
- ❌ May fail/timeout

**Estimated Cost:** ~$0.0001-0.0005 per query (Gemini Flash)

**Estimated Effort:** 1-2 hours (already have LLM infrastructure)

---

### Option 4: Hybrid - Rule-Based + LLM Fallback

**Approach:** Use rule-based segmentation first, fallback to LLM for complex cases.

**Implementation:**

```typescript
async function extractIntentsHybrid(message: string): Promise<Intent[]> {
  // First try rule-based segmentation
  const segments = smartSegment(message);

  // If we found clear segments, use rule-based extraction
  if (segments.length > 1 && allSegmentsClear(segments)) {
    return segments.map(seg => extractIntent(seg));
  }

  // Check if multiple intent keywords present
  const intentScores = scoreAllIntents(message);
  const highScoreIntents = intentScores.filter(s => s.score >= 0.5);

  // If multiple high-scoring intents, query might be complex
  if (highScoreIntents.length > 1) {
    // Use LLM for complex multi-intent queries
    return await extractMultiIntentsWithLLM(message);
  }

  // Simple single-intent query, use rule-based
  return [extractIntent(message)];
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Fast for simple queries (90% of cases)
- ✅ Accurate for complex queries (10% of cases)
- ✅ Cost-effective (only pay for complex queries)

**Cons:**
- ⚠️ Most complex to implement
- ⚠️ Requires careful threshold tuning

**Estimated Effort:** 6-8 hours

---

## Recommendation

### Immediate Action: **Option 2 - Query Segmentation**

**Why:**
1. **Addresses the problem** - Handles 80% of multi-intent queries
2. **Low cost** - No API fees, minimal latency
3. **Reasonable effort** - 4-6 hours implementation
4. **Production-ready** - No external dependencies

**Implementation Plan:**

1. **Week 2, Day 1-2** (4-6 hours):
   - Implement smart segmentation logic
   - Handle edge cases ("and" in place names)
   - Add multi-intent support to extractIntent()

2. **Week 2, Day 3** (2 hours):
   - Create multi-intent test suite
   - Run benchmarks on multi-intent queries

3. **Week 2, Day 4** (2 hours):
   - Update API handlers to support multiple intents
   - Test end-to-end flow

### Future Enhancement: **Option 4 - Hybrid System**

After implementing Option 2, if we still have edge cases:
- Add LLM fallback for complex queries
- Expected: 90% rule-based, 10% LLM
- Cost: ~$0.01-0.05 per day (assuming 100-500 complex queries)

---

## Test Suite for Multi-Intent

```typescript
const MULTI_INTENT_TEST_CASES = [
  {
    text: "Show me trains from Zurich to Bern and the weather in Bern",
    expectedIntents: ["trip_planning", "weather_check"],
  },
  {
    text: "I need to get to Davos tomorrow. What are the snow conditions?",
    expectedIntents: ["trip_planning", "snow_conditions"],
  },
  {
    text: "Find trains to Zermatt and check snow conditions there",
    expectedIntents: ["trip_planning", "snow_conditions"],
  },
  {
    text: "What's the weather in Basel? I'm traveling there tomorrow",
    expectedIntents: ["weather_check", "trip_planning"],
  },
  {
    text: "Show departures from Bern and the weather forecast",
    expectedIntents: ["station_search", "weather_check"],
  },
  // Edge cases
  {
    text: "Trains from St. Gallen to Zurich", // "and" in place name
    expectedIntents: ["trip_planning"],
  },
  {
    text: "Weather and snow in Zermatt", // Similar intents
    expectedIntents: ["weather_check", "snow_conditions"],
  },
];
```

**Target:** 90%+ accuracy on multi-intent queries

---

## Impact Analysis

### Current System Gaps

Based on real-world usage patterns (estimated):

| Query Type | % of Queries | Handled Correctly |
|------------|--------------|-------------------|
| Single intent | 85% | ✅ 97.22% |
| Multi-intent (2 intents) | 12% | ❌ ~20% |
| Multi-intent (3+ intents) | 2% | ❌ ~0% |
| Ambiguous | 1% | ⚠️ ~50% |

**Overall System Accuracy:**
- Current: 85% × 97.22% + 15% × 20% = **85.6%**
- After Fix (Option 2): 85% × 97.22% + 15% × 90% = **96.1%** (+10.5%)
- After Hybrid (Option 4): 85% × 97.22% + 15% × 98% = **97.4%** (+11.8%)

---

## Next Steps

Would you like me to:

1. ✅ **Implement Option 2** (Query Segmentation) - RECOMMENDED
2. ⚠️ **Implement Option 4** (Hybrid) - Future enhancement
3. 📊 **Create detailed benchmark** for multi-intent queries first
4. 🔍 **Analyze real production logs** to see if multi-intent is actually needed

Your preference?
