# Baseline Benchmark Results - 2026-01-01

## Summary

🎉 **Great news!** The current system is performing better than expected!

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Intent Accuracy** | >75% | **97.22%** | ✅ EXCELLENT |
| **Entity Accuracy** | >70% | **90.91%** | ✅ EXCELLENT |
| **Combined Score** | >75% | **94.07%** | ✅ EXCELLENT |

## Intent Classification Results

### Overall Metrics
- **Accuracy**: 97.22% (35/36 correct)
- **Precision**: 98.61%
- **Recall**: 97.22%
- **F1 Score**: 97.76%

### Per-Intent Performance

| Intent | Precision | Recall | F1 Score | Status |
|--------|-----------|--------|----------|--------|
| trip_planning | 91.7% | 100.0% | 95.7% | ✅ Excellent |
| weather_check | 100.0% | 100.0% | 100.0% | ✅ Perfect |
| snow_conditions | 100.0% | 100.0% | 100.0% | ✅ Perfect |
| station_search | 100.0% | 100.0% | 100.0% | ✅ Perfect |
| train_formation | 100.0% | 100.0% | 100.0% | ✅ Perfect |
| general_info | 100.0% | 83.3% | 90.9% | ✅ Very Good |

### Failed Cases (1/36)

#### Case 1: Single Keyword Ambiguity
```
Message: "Train"
Expected: general_info
Predicted: trip_planning (confidence: 0.80)
Reason: Single keyword "train" triggers trip intent
Impact: LOW (edge case, rare in practice)
```

**Analysis**: This is acceptable. Single-word queries are inherently ambiguous.

---

## Entity Extraction Results

### Overall Metrics
- **Accuracy**: 90.91% (40/44 entities correct)

### Per-Entity Performance

| Entity | Total | Correct | Incorrect | Missing | Accuracy |
|--------|-------|---------|-----------|---------|----------|
| origin | 17 | 15 | 0 | 2 | 88.2% |
| destination | 13 | 13 | 0 | 0 | 100.0% ✅ |
| date | 5 | 4 | 1 | 0 | 80.0% |
| time | 6 | 5 | 1 | 0 | 83.3% |
| eventType | 3 | 3 | 0 | 0 | 100.0% ✅ |

### Failed Extractions (4/44)

#### Issue 1: Missing Origin in Implicit "X to Y" Pattern
```
❌ "Geneva to Lausanne at 14:30"
   Expected origin: "Geneva"
   Actual origin: MISSING

❌ "Zurich to Bern at 14:30"
   Expected origin: "Zurich"
   Actual origin: MISSING
```

**Root Cause**: The implicit origin extractor (`buildSimpleToPattern`) doesn't capture origin when there's additional context after "to Y"

**Impact**: HIGH - Affects 2/17 origin extractions (11.8% failure rate)

**Fix Priority**: 🔴 **P0 - Critical**

#### Issue 2: Date Format Discrepancy
```
❌ "Trains next Monday"
   Expected: "next Monday"
   Actual: "monday"
```

**Root Cause**: Date regex captures only "monday" without "next"

**Impact**: LOW - Still extracts day of week

**Fix Priority**: 🟡 **P1 - Nice to have**

#### Issue 3: Time Format Incomplete
```
❌ "Trains at 2:30 pm"
   Expected: "2:30 pm"
   Actual: "2:30"
```

**Root Cause**: Time regex captures numeric part but not "pm" meridiem

**Impact**: LOW - Can be parsed as 24h or 12h

**Fix Priority**: 🟡 **P1 - Nice to have**

---

## Prioritized Issues to Fix

### 🔴 Critical (P0)
1. **Missing origin in "X to Y at TIME" pattern**
   - Affects: 2 cases
   - Fix effort: 1-2 hours
   - Expected gain: +5-10% origin accuracy

### 🟡 Medium (P1)
2. **Date format completeness** ("next Monday" → "monday")
   - Affects: 1 case
   - Fix effort: 30 min
   - Expected gain: +2% date accuracy

3. **Time meridiem capture** ("2:30 pm" → "2:30")
   - Affects: 1 case
   - Fix effort: 30 min
   - Expected gain: +2% time accuracy

---

## Recommended Action Plan

### Option 1: Fix Critical Issue Only ⭐ RECOMMENDED
- **Effort**: 1-2 hours
- **Expected results**:
  - Intent accuracy: 97.22% (no change)
  - Entity accuracy: 90.91% → **95-97%**
  - Combined: 94.07% → **96-97%**

### Option 2: Fix All 3 Issues
- **Effort**: 2-3 hours
- **Expected results**:
  - Intent accuracy: 97.22% (no change)
  - Entity accuracy: 90.91% → **95-100%**
  - Combined: 94.07% → **96-98.5%**

---

## Conclusion

**The current system is already performing excellently!**

The original estimate of 75-80% accuracy was **too pessimistic**. The actual performance is:
- Intent: 97.22% ✅
- Entity: 90.91% ✅
- Combined: 94.07% ✅

**Recommendation**: Fix the critical origin extraction issue to push entity accuracy to 95%+, then move to testing the LLM hybrid approach for the remaining edge cases.

---

## Next Steps

1. ✅ **Implement Fix #1** (Missing origin in implicit pattern)
2. ⚠️ **Optional**: Fix #2 and #3 if time permits
3. ✅ **Re-run benchmarks** to validate improvements
4. ✅ **Compare with LLM approach** to see if 95%+ → 98%+ is worth the cost

**Target after fixes**: 96-97% combined accuracy
