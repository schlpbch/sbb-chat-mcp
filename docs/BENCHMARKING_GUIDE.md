# Benchmarking Guide

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Purpose:** Guide for running and interpreting benchmark tests for intent and entity extraction

---

## Overview

The benchmarking suite measures the accuracy of:
1. **Intent Classification** - Correctly identifying user intent
2. **Entity Extraction** - Accurately extracting locations, dates, times

---

## Quick Start

### Run All Benchmarks

```bash
npx tsx scripts/run-all-benchmarks.ts
```

This will:
- Run intent classification benchmark
- Run entity extraction benchmark
- Generate a combined report
- Display summary results

### Run Individual Benchmarks

#### Intent Classification Only
```bash
npx tsx scripts/benchmark-intent-extraction.ts
```

#### Entity Extraction Only
```bash
npx tsx scripts/benchmark-entity-extraction.ts
```

---

## Understanding Results

### Intent Classification Metrics

```
📊 BENCHMARK RESULTS
==========================================================================

Overall Metrics:
  Accuracy:  85.71%   ← Overall correct predictions
  Precision: 86.34%   ← When model says "X", how often is it correct?
  Recall:    85.12%   ← Of all "X" cases, how many did we find?
  F1 Score:  85.72%   ← Harmonic mean of precision & recall
  Correct:   48/56    ← Number of correct predictions
  Incorrect: 8/56     ← Number of wrong predictions
```

**Per-Intent Metrics:**
```
Intent              | Precision | Recall | F1 Score | TP | FP | FN
----------------------------------------------------------------------
trip_planning       |     95.0  |  90.5  |    92.7  | 19 |  1 |  2
weather_check       |     87.5  |  87.5  |    87.5  |  7 |  1 |  1
snow_conditions     |     80.0  |  80.0  |    80.0  |  4 |  1 |  1
station_search      |     85.7  |  85.7  |    85.7  |  6 |  1 |  1
train_formation     |     75.0  |  75.0  |    75.0  |  3 |  1 |  1
general_info        |     88.9  |  88.9  |    88.9  |  8 |  1 |  1
```

**Legend:**
- **TP** (True Positives): Correctly predicted this intent
- **FP** (False Positives): Incorrectly predicted this intent
- **FN** (False Negatives): Missed this intent

**Confusion Matrix:**
```
Predicted →
Actual ↓    | TP | WC | SC | SS | TF | GI
--------------------------------------------
TP (trip_planning)     | 19 |  1 |  0 |  1 |  0 |  0
WC (weather_check)     |  1 |  7 |  0 |  0 |  0 |  0
SC (snow_conditions)   |  0 |  1 |  4 |  0 |  0 |  0
SS (station_search)    |  1 |  0 |  0 |  6 |  0 |  0
TF (train_formation)   |  0 |  0 |  0 |  1 |  3 |  0
GI (general_info)      |  0 |  0 |  0 |  0 |  1 |  8
```

**Reading the matrix:**
- Rows = Actual intent
- Columns = Predicted intent
- Diagonal = Correct predictions
- Off-diagonal = Misclassifications

**Example:** Row 1, Column 2 = 1
- 1 case of "trip_planning" was misclassified as "weather_check"

---

### Entity Extraction Metrics

```
📊 ENTITY EXTRACTION BENCHMARK RESULTS
==========================================================================

Overall Entity Accuracy: 82.35%

Per-Entity Metrics:
Entity       | Total | Correct | Incorrect | Missing | Accuracy
------------------------------------------------------------------
origin       |    25 |      20 |         2 |      3  | 80.0%
destination  |    20 |      18 |         1 |      1  | 90.0%
date         |    10 |       9 |         0 |      1  | 90.0%
time         |     8 |       6 |         1 |      1  | 75.0%
eventType    |     4 |       3 |         0 |      1  | 75.0%
```

**Legend:**
- **Total**: Number of test cases with expected entity
- **Correct**: Extracted correctly
- **Incorrect**: Extracted but wrong value
- **Missing**: Not extracted at all
- **Accuracy**: Correct / Total

---

## Interpreting Scores

### Accuracy Levels

| Accuracy | Grade | Interpretation |
|----------|-------|----------------|
| 95-100% | A+ | Excellent - Production ready |
| 90-94% | A | Very Good - Minor improvements needed |
| 85-89% | B+ | Good - Acceptable for production |
| 80-84% | B | Fair - Consider improvements |
| 75-79% | C | Poor - Needs work |
| <75% | F | Failing - Major issues |

### Current Thresholds

- **Intent Classification**: 75% minimum (fail build if below)
- **Entity Extraction**: 70% minimum (fail build if below)

---

## Common Failure Patterns

### Intent Misclassifications

#### 1. Station vs Trip

**Problem:**
```
❌ "train station in Bern"
   Expected:  station_search
   Predicted: trip_planning
   Reason:    "train" keyword matched first
```

**Fix:** Check station keywords before trip keywords (already implemented)

#### 2. Snow vs Weather

**Problem:**
```
❌ "snow forecast in Davos"
   Expected:  snow_conditions
   Predicted: weather_check
   Reason:    "forecast" is a weather keyword
```

**Fix:** Check snow keywords before weather keywords (already implemented)

#### 3. Implicit Intents

**Problem:**
```
❌ "I want to go"
   Expected:  trip_planning
   Predicted: general_info
   Confidence: 0.5
   Reason:    No explicit trip keywords
```

**Fix:** Add more implicit patterns or use ML model

---

### Entity Extraction Failures

#### 1. Compound Names

**Problem:**
```
❌ "From St. Gallen to Zurich"
   Expected origin: "St. Gallen"
   Actual origin:   "St"
   Reason:         Period treated as sentence end
```

**Fix:** Implemented in entity edge cases (special handling for abbreviations)

#### 2. Missing Entities

**Problem:**
```
❌ "How do I get there?"
   Expected destination: (from context)
   Actual destination:   MISSING
   Reason:              No pronoun resolution
```

**Fix:** Implement context merging (documented in edge cases)

#### 3. French/Italian Ambiguity

**Problem:**
```
❌ "Trains à Zurich à 14h"
   Expected origin: "Zurich"
   Expected time:   "14h"
   Actual origin:   "Zurich À 14h"
   Reason:         "à" used for both location and time
```

**Fix:** Multi-pass extraction (documented in edge cases)

---

## Adding Test Cases

### Intent Classification

Edit: `scripts/benchmark-intent-extraction.ts`

```typescript
const TEST_CASES: TestCase[] = [
  // Add new test case
  {
    text: 'Your test message here',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern' },
    language: 'en',
    notes: 'Optional description',
  },
  // ... existing cases
];
```

### Entity Extraction

Edit: `scripts/benchmark-entity-extraction.ts`

```typescript
const TEST_CASES: EntityTestCase[] = [
  // Add new test case
  {
    text: 'Your test message here',
    intent: 'trip_planning',
    expectedEntities: {
      origin: 'Zurich',
      destination: 'Bern',
      date: 'tomorrow',
      time: '14:30',
    },
    language: 'en',
    notes: 'Optional description',
  },
  // ... existing cases
];
```

**Best Practices:**
- Add edge cases that previously failed
- Include multilingual examples (EN/DE/FR/IT)
- Cover all intent types
- Test implicit patterns
- Include complex scenarios (multiple entities)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Benchmark Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: npx tsx scripts/run-all-benchmarks.ts

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: |
            benchmark-results.json
            entity-benchmark-results.json
            combined-benchmark-report.json
```

---

## Tracking Accuracy Over Time

### Create Baseline

```bash
# Run benchmarks
npx tsx scripts/run-all-benchmarks.ts

# Save as baseline
cp benchmark-results.json benchmark-baseline.json
cp entity-benchmark-results.json entity-baseline.json
```

### Compare Against Baseline

```typescript
// scripts/compare-to-baseline.ts

const current = require('../benchmark-results.json');
const baseline = require('../benchmark-baseline.json');

const currentAcc = current.accuracy;
const baselineAcc = baseline.accuracy;
const diff = currentAcc - baselineAcc;

console.log(`Current:  ${(currentAcc * 100).toFixed(2)}%`);
console.log(`Baseline: ${(baselineAcc * 100).toFixed(2)}%`);
console.log(`Change:   ${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(2)}%`);

if (diff < -0.05) {  // 5% regression
  console.error('❌ Accuracy regression detected!');
  process.exit(1);
}
```

---

## Troubleshooting

### Issue: All tests failing

**Possible causes:**
1. Import path errors
2. Missing dependencies
3. Code changes broke intent extractor

**Debug:**
```bash
# Test a single case manually
npx tsx -e "
  import { extractIntent } from './src/lib/llm/context/intentExtractor';
  extractIntent('Find trains from Zurich to Bern', 'en')
    .then(console.log)
    .catch(console.error);
"
```

### Issue: Low accuracy after changes

**Steps:**
1. Check failed cases in output
2. Identify common patterns
3. Add test cases for failures
4. Fix implementation
5. Re-run benchmarks

### Issue: Benchmarks timeout

**Possible causes:**
1. Too many test cases
2. Translation API slow (ZH/HI tests)
3. Network issues (if using external APIs)

**Fix:**
- Run subsets: comment out language variants
- Skip translation tests temporarily
- Increase timeout in CI config

---

## Best Practices

### 1. Run Before Every PR

```bash
pnpm run benchmark  # Add to package.json scripts
```

### 2. Track Metrics

Create a tracking sheet:
| Date | Commit | Intent Acc | Entity Acc | Notes |
|------|--------|------------|------------|-------|
| 2026-01-01 | abc123 | 85.7% | 82.4% | Baseline |
| 2026-01-15 | def456 | 87.2% | 84.1% | Added French support |

### 3. Set Regression Alerts

- Fail PR if accuracy drops >5%
- Require explanation for regressions
- Review failed cases in PR description

### 4. Update Tests When Fixing Bugs

When you fix a bug:
1. Add test case that previously failed
2. Verify it now passes
3. Commit test with fix

---

## Advanced: Custom Metrics

### Add Confusion by Language

```typescript
// Track which languages perform worse
const languageMetrics: Record<string, number> = {
  en: 0.95,
  de: 0.87,
  fr: 0.83,  // ← Focus here
  it: 0.81,  // ← And here
};
```

### Add Confidence Distribution

```typescript
// Track how confident predictions are
const confidenceBuckets = {
  '0.9-1.0': 45,  // High confidence
  '0.7-0.9': 30,  // Medium
  '0.5-0.7': 15,  // Low
  '0.0-0.5': 10,  // Very low
};
```

---

## Summary

- ✅ Run benchmarks regularly (before PRs)
- ✅ Aim for >85% accuracy (intent + entity)
- ✅ Track metrics over time
- ✅ Add test cases for edge cases
- ✅ Fail CI if accuracy drops significantly
- ✅ Review failed cases to find patterns

**Happy benchmarking! 📊**
