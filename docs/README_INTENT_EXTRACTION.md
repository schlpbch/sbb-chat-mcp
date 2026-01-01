# Intent Extraction System: Complete Documentation

**Version:** 1.0
**Last Updated:** 2026-01-01

---

## Overview

This directory contains comprehensive documentation for the Swiss Travel Companion's intent and entity extraction system.

### What is Intent Extraction?

**Intent extraction** determines what the user wants to do from their message:
- Find trains (trip_planning)
- Check weather (weather_check)
- See departures (station_search)
- etc.

**Entity extraction** identifies specific information:
- Locations (origin, destination)
- Times (date, time)
- Preferences (travel style, accessibility)

---

## Documentation Index

### 1. Architecture & Analysis

📄 **[LLM_ARCHITECTURE_DEEP_DIVE.md](./LLM_ARCHITECTURE_DEEP_DIVE.md)**
- Complete system architecture
- Intent classification algorithm
- Entity extraction algorithm
- Performance analysis
- Strengths and limitations
- Comparison: Rules vs ML vs LLM

### 2. Visual Diagrams

📊 **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)**
- Mermaid flow diagrams
- Sequence diagrams
- State machines
- Data flow visualization
- Component relationships

### 3. Edge Cases & Solutions

🐛 **[ENTITY_EXTRACTION_EDGE_CASES.md](./ENTITY_EXTRACTION_EDGE_CASES.md)**
- Multi-leg journeys (via points)
- Compound location names (St. Gallen)
- Temporal expressions (tomorrow → ISO date)
- Mixed language queries
- Pronoun resolution
- Test cases for each edge case

### 4. ML Implementation Guide

🤖 **[ML_HYBRID_IMPLEMENTATION_GUIDE.md](./ML_HYBRID_IMPLEMENTATION_GUIDE.md)**
- Step-by-step ML setup
- Training data preparation
- Model training with TensorFlow.js
- Deployment to production
- Hybrid approach (ML + Rules)
- Monitoring and retraining

### 5. Benchmarking

📏 **[BENCHMARKING_GUIDE.md](./BENCHMARKING_GUIDE.md)**
- How to run benchmarks
- Understanding results
- Confusion matrix interpretation
- Adding test cases
- CI/CD integration
- Tracking accuracy over time

### 6. NLP/ML Plan

📝 **[NLP_ML_INTENT_CLASSIFICATION_PLAN.md](./NLP_ML_INTENT_CLASSIFICATION_PLAN.md)**
- Detailed ML architecture options
- Universal Sentence Encoder approach
- BiLSTM for entity extraction
- Training pipeline
- Evaluation metrics
- Production deployment

---

## Quick Start Guides

### For Developers: Understanding the System

**Read in this order:**
1. [Architecture Deep Dive](./LLM_ARCHITECTURE_DEEP_DIVE.md#intent-classification-deep-dive) - Intent classification algorithm
2. [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md#intent-extraction-flow) - Visual flow
3. [Edge Cases](./ENTITY_EXTRACTION_EDGE_CASES.md#overview) - Common issues

### For ML Engineers: Adding ML

**Read in this order:**
1. [NLP/ML Plan](./NLP_ML_INTENT_CLASSIFICATION_PLAN.md#overview) - ML options
2. [ML Implementation Guide](./ML_HYBRID_IMPLEMENTATION_GUIDE.md#phase-1-setup--dependencies) - Step-by-step
3. [Benchmarking](./BENCHMARKING_GUIDE.md#quick-start) - Testing

### For QA: Testing & Validation

**Read in this order:**
1. [Benchmarking Guide](./BENCHMARKING_GUIDE.md#quick-start) - Run tests
2. [Edge Cases](./ENTITY_EXTRACTION_EDGE_CASES.md#test-suite) - Test scenarios
3. [Architecture Deep Dive](./LLM_ARCHITECTURE_DEEP_DIVE.md#performance-analysis) - Performance metrics

---

## System Comparison

| Approach | Accuracy | Speed | Cost | Complexity | Recommended For |
|----------|----------|-------|------|------------|-----------------|
| **Rule-based** (current) | 75-80% | <5ms | $0 | Low | Startups, MVPs |
| **ML (TF.js)** | 90-95% | ~25ms | $0 | High | Production apps |
| **LLM (Gemini)** | 95-98% | ~500ms | ~$0.001/req | Medium | High-value queries |
| **Hybrid (ML+Rules)** | 92-95% | ~25ms | $0 | Medium | **Recommended** |

---

## File Structure

```
docs/
├── README_INTENT_EXTRACTION.md          ← You are here
├── LLM_ARCHITECTURE_DEEP_DIVE.md        ← System architecture
├── ARCHITECTURE_DIAGRAMS.md             ← Visual diagrams
├── ENTITY_EXTRACTION_EDGE_CASES.md      ← Edge cases & solutions
├── ML_HYBRID_IMPLEMENTATION_GUIDE.md    ← ML implementation
├── BENCHMARKING_GUIDE.md                ← Testing guide
└── NLP_ML_INTENT_CLASSIFICATION_PLAN.md ← ML planning doc

src/lib/llm/context/
├── intentExtractor.ts                   ← Rule-based (current)
├── llmIntentExtractor.ts                ← LLM-based (PoC)
├── hybridIntentExtractor.ts             ← Hybrid (future)
├── entityPatterns.ts                    ← Entity extraction
├── intentKeywords.ts                    ← Keyword dictionaries
└── types.ts                             ← Type definitions

scripts/
├── benchmark-intent-extraction.ts       ← Intent accuracy test
├── benchmark-entity-extraction.ts       ← Entity accuracy test
├── run-all-benchmarks.ts                ← Combined runner
└── compare-intent-methods.ts            ← Rules vs LLM comparison
```

---

## Key Concepts

### Intent Types

```typescript
type IntentType =
  | 'trip_planning'      // Find trains/journeys
  | 'weather_check'      // Weather queries
  | 'snow_conditions'    // Ski/snow queries
  | 'station_search'     // Departures/arrivals
  | 'train_formation'    // Coach positions
  | 'general_info';      // Everything else
```

### Intent Priority (Rule-based)

1. **Station** (highest) - "train station" → station_search
2. **Formation** - "coach 7" → train_formation
3. **Snow** - "ski conditions" → snow_conditions
4. **Trip** - "trains from" → trip_planning
5. **Weather** - "forecast" → weather_check
6. **General** (fallback) - "hello" → general_info

### Confidence Scores

| Confidence | Meaning | Action |
|------------|---------|--------|
| 0.9-1.0 | Very confident | Use directly |
| 0.7-0.9 | Confident | Use for orchestration |
| 0.5-0.7 | Low confidence | Consider fallback |
| 0.3-0.5 | Very uncertain | Default to general_info |

---

## Common Tasks

### Task 1: Run Benchmarks

```bash
# All benchmarks
npx tsx scripts/run-all-benchmarks.ts

# Intent only
npx tsx scripts/benchmark-intent-extraction.ts

# Entity only
npx tsx scripts/benchmark-entity-extraction.ts
```

**Expected output:**
```
📊 BENCHMARK RESULTS
===================
Accuracy:  85.71%
Precision: 86.34%
Recall:    85.12%
F1 Score:  85.72%
```

### Task 2: Add New Test Case

```typescript
// Edit: scripts/benchmark-intent-extraction.ts
const TEST_CASES: TestCase[] = [
  // ... existing cases
  {
    text: 'Your new test message',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern' },
    language: 'en',
    notes: 'Test description',
  },
];
```

### Task 3: Compare Methods

```bash
GOOGLE_CLOUD_KEY=your_key npx tsx scripts/compare-intent-methods.ts
```

**Output:**
```
Accuracy:
  Rule-based: 70.0% (7/10)
  LLM-based:  90.0% (9/10)
  Winner:     LLM 🏆

Speed:
  Rule-based: 3.2ms average
  LLM-based:  487.5ms average
  Winner:     Rules 🏆 (152x faster)
```

### Task 4: Implement ML Model

Follow: [ML Implementation Guide](./ML_HYBRID_IMPLEMENTATION_GUIDE.md)

```bash
# 1. Install dependencies
pnpm add @tensorflow/tfjs @tensorflow-models/universal-sentence-encoder

# 2. Create training data
# Edit: data/training/intent-examples.json

# 3. Train model
pnpm run train:intent

# 4. Test model
# Model saved to public/models/intent-classifier/

# 5. Enable in production
# Edit .env.local:
NEXT_PUBLIC_USE_ML_INTENT=true
```

### Task 5: Fix Edge Case

1. **Identify issue** - Run benchmarks, check failed cases
2. **Add test case** - Add to benchmark script
3. **Implement fix** - Update extraction logic
4. **Verify** - Re-run benchmarks
5. **Document** - Add to edge cases doc

---

## Performance Targets

### Current (Rule-based)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Intent Accuracy | >75% | ~78% | ✅ PASS |
| Entity Accuracy | >70% | ~75% | ✅ PASS |
| Response Time | <10ms | ~5ms | ✅ PASS |
| Memory Usage | <100KB | ~60KB | ✅ PASS |

### With ML (Target)

| Metric | Target | Expected | Status |
|--------|--------|----------|--------|
| Intent Accuracy | >90% | ~92% | 🎯 Goal |
| Entity Accuracy | >85% | ~88% | 🎯 Goal |
| Response Time | <50ms | ~25ms | 🎯 Goal |
| Bundle Size | <20MB | ~14MB | 🎯 Goal |

---

## Troubleshooting

### Issue: Low Accuracy

**Steps:**
1. Run benchmarks: `npx tsx scripts/run-all-benchmarks.ts`
2. Check failed cases in output
3. Identify patterns (e.g., all French queries failing)
4. Add keywords or fix regex patterns
5. Re-run benchmarks

**Common causes:**
- Missing keywords in dictionary
- Wrong priority order
- Regex pattern too restrictive
- Language detection failing

### Issue: Wrong Intent Priority

**Example:** "train station" → trip_planning (should be station_search)

**Fix:**
```typescript
// In intentExtractor.ts
// Check station keywords BEFORE trip keywords
if (hasKeyword(stationKeywords, message)) {
  type = 'station_search';  // ✅ Checked first
} else if (hasKeyword(tripKeywords, message)) {
  type = 'trip_planning';
}
```

### Issue: Entity Not Extracted

**Example:** "St. Gallen" → "St" (period breaks extraction)

**Fix:** See [Entity Edge Cases](./ENTITY_EXTRACTION_EDGE_CASES.md#compound-location-names)

---

## Contributing

### Adding Keywords

```typescript
// src/lib/llm/context/intentKeywords.ts

export const INTENT_KEYWORDS = {
  trip_planning: {
    en: {
      primary: ['train', 'connection', 'trip', 'YOUR_NEW_KEYWORD'],
      // ...
    },
  },
};
```

### Adding Language

```typescript
// 1. Add language type
export type Language = 'en' | 'de' | 'fr' | 'it' | 'es';  // ← Add 'es'

// 2. Add keywords
trip_planning: {
  es: {
    primary: ['tren', 'conexión', 'viaje'],
    variations: ['trenes', 'conexiones', 'viajes'],
    phrases: ['ir a', 'viajar a'],
  },
}

// 3. Add prepositions
ENTITY_PREPOSITIONS = {
  origin: {
    es: ['de', 'desde'],
  },
  destination: {
    es: ['a', 'hacia'],
  },
};
```

### Submitting Improvements

1. Run benchmarks before changes (baseline)
2. Make your changes
3. Run benchmarks after changes
4. If accuracy improves: ✅ Create PR
5. If accuracy drops: ❌ Fix or revert

---

## Future Roadmap

### Phase 1: Optimization (Now)
- ✅ Document current system
- ✅ Create benchmarks
- ✅ Identify edge cases
- 🔄 Fix top 10 edge cases

### Phase 2: ML Integration (Q1 2026)
- 📝 Collect training data (1000+ examples)
- 🤖 Train ML model
- 🔄 Implement hybrid approach
- 📊 A/B test ML vs Rules

### Phase 3: Production ML (Q2 2026)
- 🚀 Deploy ML to production
- 📈 Monitor accuracy
- 🔄 Continuous retraining
- ⚡ Optimize performance

### Phase 4: Advanced Features (Q3 2026)
- 🗣️ Multi-turn conversation context
- 🧠 Intent prediction (suggest before user asks)
- 📚 Few-shot learning (new intents with 10 examples)
- 🌍 Expand to 10+ languages

---

## Resources

### Internal Docs
- [CLAUDE.md](../CLAUDE.md) - Project overview
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) - Visual guides

### External Resources
- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [Universal Sentence Encoder](https://tfhub.dev/google/universal-sentence-encoder/4)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Intent Classification Best Practices](https://towardsdatascience.com/intent-classification-demystified-part-1-4e3b2c279c14)

---

## Questions?

- 📧 Email: schlpbch@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Happy Coding! 🚀**
