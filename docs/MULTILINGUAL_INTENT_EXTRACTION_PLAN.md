# Multilingual Intent Extraction - Comprehensive Plan

**Goal:** Make content extraction robust and multilingual across **German (DE)**, **French (FR)**, **Italian (IT)**, and **English (EN)** for the Swiss Travel Companion.

---

## 📊 Current State Analysis

### Strengths

✅ Word boundary regex prevents false positives (e.g., "rain" doesn't match "trains")
✅ Prioritized keyword checking (station > formation > trip > weather)
✅ Basic multilingual keywords for trip/weather/station queries
✅ Unicode support in entity extraction (Zürich, Genève)

### Weaknesses

❌ **Inconsistent multilingual coverage** - Some intents missing FR/IT keywords
❌ **English-centric entity extraction** - Regex only matches EN prepositions
❌ **No date/time localization** - Only EN/DE date words supported
❌ **Hard-coded patterns** - Difficult to maintain and extend
❌ **No confidence scoring refinement** - All intents get fixed confidence values
❌ **Missing context-aware disambiguation** - "station" could mean "Bahnhof" or "gare"

---

## 🎯 Design Principles

1. **Language Parity** - All 4 languages (EN/DE/FR/IT) get equal support
2. **Maintainability** - Structured keyword dictionaries, not scattered arrays
3. **Robustness** - Handle variations, typos, diacritics, and mixed-language input
4. **Performance** - Efficient regex compilation and caching
5. **Testability** - Comprehensive test cases for each language and intent type
6. **Extensibility** - Easy to add new languages or intents

---

## 🏗️ Proposed Architecture

### 1. Structured Keyword Dictionary

Replace scattered keyword arrays with a structured, typed dictionary:

```typescript
interface KeywordSet {
  primary: string[];      // Main keywords (strict match)
  variations: string[];   // Common variations/typos
  phrases: string[];      // Multi-word phrases
  contextual: string[];   // Context-dependent (require other signals)
}

interface MultilingualKeywords {
  en: KeywordSet;
  de: KeywordSet;
  fr: KeywordSet;
  it: KeywordSet;
}

const INTENT_KEYWORDS: Record<Intent['type'], MultilingualKeywords> = {
  trip_planning: {
    en: {
      primary: ['train', 'connection', 'trip', 'travel', 'journey', 'route'],
      variations: ['trains', 'connections', 'trips'],
      phrases: ['get to', 'go to', 'travel to', 'going from'],
      contextual: ['from', 'to']
    },
    de: {
      primary: ['zug', 'bahn', 'verbindung', 'reise', 'fahrt', 'route'],
      variations: ['züge', 'verbindungen', 'reisen'],
      phrases: ['fahren nach', 'reisen nach', 'fahrt von'],
      contextual: ['von', 'nach', 'ab', 'bis']
    },
    fr: {
      primary: ['train', 'connexion', 'voyage', 'trajet', 'itinéraire'],
      variations: ['trains', 'connexions', 'voyages'],
      phrases: ['aller à', 'aller de', 'voyager à'],
      contextual: ['de', 'à', 'depuis', 'pour', 'vers']
    },
    it: {
      primary: ['treno', 'collegamento', 'viaggio', 'percorso', 'itinerario'],
      variations: ['treni', 'collegamenti', 'viaggi'],
      phrases: ['andare a', 'andare da', 'viaggiare a'],
      contextual: ['da', 'a', 'per', 'verso']
    }
  },
  // ... similar for weather_check, station_search, train_formation, general_info
};
```

### 2. Enhanced Entity Extraction Patterns

Current regex only handles EN/DE/FR prepositions. Expand to IT and improve robustness:

```typescript
interface EntityPatterns {
  origin: {
    en: string[];  // ['from', 'starting from', 'leaving from']
    de: string[];  // ['von', 'ab', 'ausgehend von']
    fr: string[];  // ['de', 'depuis', 'en partant de', 'départ de']
    it: string[];  // ['da', 'partendo da', 'in partenza da']
  };
  destination: {
    en: string[];  // ['to', 'going to', 'heading to', 'arriving at']
    de: string[];  // ['nach', 'bis', 'richtung', 'ankunft']
    fr: string[];  // ['à', 'pour', 'vers', 'direction', 'arrivée à']
    it: string[];  // ['a', 'per', 'verso', 'direzione', 'arrivo a']
  };
  location: {
    en: string[];  // ['in', 'at', 'near']
    de: string[];  // ['in', 'bei', 'nahe']
    fr: string[];  // ['à', 'dans', 'près de']
    it: string[];  // ['a', 'in', 'vicino a']
  };
  time: {
    en: string[];  // ['at', 'around']
    de: string[];  // ['um', 'gegen']
    fr: string[];  // ['à', 'vers']
    it: string[];  // ['alle', 'verso']
  };
  date: {
    en: string[];  // ['today', 'tomorrow', 'yesterday', 'on Monday']
    de: string[];  // ['heute', 'morgen', 'gestern', 'am Montag']
    fr: string[];  // ['aujourd\'hui', 'demain', 'hier', 'lundi']
    it: string[];  // ['oggi', 'domani', 'ieri', 'lunedì']
  };
}
```

### 3. Smart Language Detection

Don't rely on user-selected language alone. Detect actual message language:

```typescript
function detectMessageLanguage(message: string): Language[] {
  const indicators = {
    de: /\b(zug|bahn|nach|von|morgen|heute)\b/i,
    fr: /\b(train|depuis|demain|aujourd'hui|gare)\b/i,
    it: /\b(treno|viaggio|oggi|domani|stazione)\b/i,
    en: /\b(train|from|tomorrow|today|station)\b/i,
  };

  const detectedLanguages: Language[] = [];
  for (const [lang, pattern] of Object.entries(indicators)) {
    if (pattern.test(message)) {
      detectedLanguages.push(lang as Language);
    }
  }

  // Return detected languages or fallback to ['en'] if none detected
  return detectedLanguages.length > 0 ? detectedLanguages : ['en'];
}
```

### 4. Context-Aware Confidence Scoring

Improve confidence based on multiple signals:

```typescript
function calculateConfidence(
  intent: Intent['type'],
  message: string,
  matchedKeywords: string[],
  extractedEntities: Record<string, any>
): number {
  let confidence = 0.5; // Base confidence

  // +0.1 for each matched primary keyword (max +0.3)
  confidence += Math.min(0.3, matchedKeywords.length * 0.1);

  // +0.1 if entities present (origin/destination for trips, location for weather)
  if (intent === 'trip_planning' && (extractedEntities.origin || extractedEntities.destination)) {
    confidence += 0.1;
  }
  if (intent === 'weather_check' && extractedEntities.location) {
    confidence += 0.1;
  }

  // +0.1 if date/time specified
  if (extractedEntities.date || extractedEntities.time) {
    confidence += 0.1;
  }

  // -0.2 if conflicting keywords (e.g., both trip and weather keywords)
  // (implement conflict detection logic)

  return Math.min(0.95, Math.max(0.3, confidence));
}
```

### 5. Diacritic Normalization

Handle French/Italian accents and German umlauts gracefully:

```typescript
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                    // Decompose accents
    .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/ß/g, 'ss');
}

// Use for fuzzy matching:
const normalized = normalizeForMatching(message);
```

### 6. Robust Date/Time Parsing

Support multiple date/time formats across languages:

```typescript
const DATE_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    /\b(today|tomorrow|yesterday)\b/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/,
    /\b(next|this)\s+(week|month|monday|tuesday)\b/i,
  ],
  de: [
    /\b(heute|morgen|gestern|übermorgen)\b/i,
    /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i,
    /\b(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?\b/,
    /\b(nächste|diese)\s+(woche|monat|montag)\b/i,
  ],
  fr: [
    /\b(aujourd'hui|demain|hier|après-demain)\b/i,
    /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i,
    /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/,
    /\b(prochain|ce|cette)\s+(semaine|mois|lundi)\b/i,
  ],
  it: [
    /\b(oggi|domani|ieri|dopodomani)\b/i,
    /\b(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\b/i,
    /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/,
    /\b(prossimo|questo|questa)\s+(settimana|mese|lunedì)\b/i,
  ],
};

const TIME_PATTERNS: Record<Language, RegExp[]> = {
  en: [
    /\b(\d{1,2}):(\d{2})\b/,
    /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
    /\b(morning|afternoon|evening|night)\b/i,
  ],
  de: [
    /\b(\d{1,2}):(\d{2})\b/,
    /\bum\s+(\d{1,2})(?::(\d{2}))?\s*uhr\b/i,
    /\b(morgens|vormittags|mittags|nachmittags|abends|nachts)\b/i,
  ],
  fr: [
    /\b(\d{1,2})[h:](\d{2})?\b/,
    /\bà\s+(\d{1,2})(?:[h:](\d{2}))?\b/i,
    /\b(matin|après-midi|soir|nuit)\b/i,
  ],
  it: [
    /\b(\d{1,2}):(\d{2})\b/,
    /\balle\s+(\d{1,2})(?::(\d{2}))?\b/i,
    /\b(mattina|pomeriggio|sera|notte)\b/i,
  ],
};
```

---

## 🔧 Implementation Strategy

### Phase 1: Refactor Keyword Structure ✅

1. Create `intentKeywords.ts` with structured multilingual dictionaries
2. Create `entityPatterns.ts` with multilingual entity extraction patterns
3. Update `intentExtractor.ts` to use new dictionaries

### Phase 2: Enhance Entity Extraction 🔄

1. Implement language detection utility
2. Create multilingual regex builder for origin/destination/location
3. Add diacritic normalization
4. Enhance date/time parsing with localized patterns

### Phase 3: Improve Confidence Scoring 🔄

1. Implement multi-signal confidence calculation
2. Add conflict detection between intents
3. Add entity validation (e.g., check if extracted place is valid)

### Phase 4: Testing & Validation ⏳

1. Create test suite with 100+ multilingual examples:
   - 25 EN examples (trip, weather, station, formation, general)
   - 25 DE examples
   - 25 FR examples
   - 25 IT examples
   - 10 mixed-language examples
   - 10 edge cases (typos, diacritics, abbreviations)
2. Benchmark accuracy (target: >90% intent classification, >85% entity extraction)
3. Real-world validation with user feedback

### Phase 5: Documentation & Monitoring 📝

1. Document supported patterns and examples per language
2. Add telemetry for intent classification accuracy
3. Create debugging tools for misclassified queries

---

## 📝 Example Test Cases

### Trip Planning

- **EN:** "Find trains from Zurich to Bern tomorrow at 10 AM"
- **DE:** "Züge von Zürich nach Bern morgen um 10 Uhr"
- **FR:** "Trains de Zurich à Berne demain à 10h"
- **IT:** "Treni da Zurigo a Berna domani alle 10"

### Weather Check

- **EN:** "What's the weather in Lucerne?"
- **DE:** "Wie ist das Wetter in Luzern?"
- **FR:** "Quel temps fait-il à Lucerne?"
- **IT:** "Che tempo fa a Lucerna?"

### Station Search

- **EN:** "Show me departures from Geneva station"
- **DE:** "Zeig mir Abfahrten vom Bahnhof Genf"
- **FR:** "Affiche les départs de la gare de Genève"
- **IT:** "Mostra le partenze dalla stazione di Ginevra"

### Edge Cases

- **Mixed:** "Ich möchte to Geneva fahren" (DE + EN mix)
- **Diacritics:** "Zürich → Genève" (Unicode arrows)
- **Abbreviations:** "ZH to BE at 10am" (city codes)
- **Typos:** "wether in Luzern" (weather misspelled)
- **Colloquial:** "How do I get to Bern?" (implicit trip planning)

---

## 🎯 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Intent Classification Accuracy | ~75% | >90% | Test suite pass rate |
| Entity Extraction Accuracy | ~70% | >85% | Extracted entities match expected |
| Multilingual Coverage | EN: 100%, DE: 60%, FR: 40%, IT: 30% | All: 95%+ | Keyword coverage per language |
| Response Time | <100ms | <150ms | P95 latency for extraction |
| User Satisfaction | Unknown | >4.0/5 | User feedback on intent understanding |

---

## 🚀 Quick Wins

These can be implemented immediately for high impact:

1. **Add missing FR/IT keywords** to existing arrays (1 hour)
2. **Add Italian entity extraction patterns** to regex (30 min)
3. **Normalize diacritics** before matching (15 min)
4. **Add French date words** (aujourd'hui, demain, hier) (15 min)

---

## 🔮 Future Enhancements

- **NLP-based intent classification** using lightweight ML model (TensorFlow.js)
- **Spelling correction** for typos (Levenshtein distance)
- **Synonym expansion** ("gare" → "station", "bahnhof" → "station")
- **Context carryover** from previous messages ("And tomorrow?" uses last trip context)
- **Voice input support** (phonetic variations)

---

## 📚 References

- Unicode normalization: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize>
- SBB official terminology: <https://www.sbb.ch/de/hilfe-und-kontakt/begriffe.html>
- French railway terms: <https://www.sncf.com/>
- Italian railway terms: <https://www.trenitalia.com/>

---

**Next Steps:**

1. Review and approve this plan
2. Prioritize implementation phases
3. Create implementation tasks
4. Begin with Quick Wins for immediate impact
