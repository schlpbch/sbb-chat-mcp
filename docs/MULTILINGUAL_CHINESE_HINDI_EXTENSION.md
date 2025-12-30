# Extending Multilingual Intent Extraction to Chinese & Hindi

**Extension Goal:** Add robust support for **Chinese (ZH)** and **Hindi (HI)** to the existing multilingual intent extraction system.

---

## 🌏 Language-Specific Challenges

### Chinese (Simplified: zh-CN, Traditional: zh-TW)

**Unique Characteristics:**
- **No word boundaries** - Chinese doesn't use spaces between words
- **Character-based matching** - Match individual characters or character sequences
- **Simplified vs Traditional** - Need to support both variants (火车 vs 火車)
- **Measure words** - Specific classifiers for trains (列), stations (个), etc.
- **Context-heavy** - Word order and context matter more than in European languages
- **No verb conjugation** - Simpler pattern matching for verbs

**Technical Implications:**
- Cannot use `\b` word boundaries
- Must use Unicode character ranges: `[\u4e00-\u9fff]` for Chinese characters
- Need character-level or bigram/trigram matching
- Simplified↔Traditional conversion for robustness

### Hindi (Devanagari Script)

**Unique Characteristics:**
- **Devanagari script** - Uses combining characters (मात्राएँ/matras)
- **Word boundaries exist** - Separated by spaces like European languages
- **Case markers** - Postpositions like से (se, "from"), को (ko, "to"), में (mein, "in")
- **Verb conjugation** - Complex verb forms based on gender/number/tense
- **Mixed English** - Hinglish is common ("train से Delhi जाना है")
- **Multiple romanization schemes** - "train" could be ट्रेन, रेल, गाड़ी

**Technical Implications:**
- Unicode normalization crucial: NFD/NFC for combining characters
- Must handle romanized Hindi (Hinglish)
- Character range: `[\u0900-\u097F]` for Devanagari
- Case markers are critical for entity extraction

---

## 🏗️ Extended Architecture

### 1. Language Type System

Extend the type system to handle non-Latin scripts:

```typescript
type Language = 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi';

type LanguageFamily = 'latin' | 'cjk' | 'devanagari';

interface LanguageConfig {
  code: Language;
  family: LanguageFamily;
  hasWordBoundaries: boolean;
  requiresNormalization: boolean;
  unicodeRange: string;  // Regex for character range
  direction: 'ltr' | 'rtl';
}

const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  zh: {
    code: 'zh',
    family: 'cjk',
    hasWordBoundaries: false,
    requiresNormalization: true,  // Simplified ↔ Traditional
    unicodeRange: '[\\u4e00-\\u9fff]',
    direction: 'ltr'
  },
  hi: {
    code: 'hi',
    family: 'devanagari',
    hasWordBoundaries: true,
    requiresNormalization: true,  // NFD/NFC for combining characters
    unicodeRange: '[\\u0900-\\u097F]',
    direction: 'ltr'
  },
  // ... existing languages
};
```

### 2. Chinese Keyword Dictionary

```typescript
const INTENT_KEYWORDS_ZH: Record<Intent['type'], KeywordSet> = {
  trip_planning: {
    primary: [
      '火车',      // huǒchē - train
      '列车',      // lièchē - train (formal)
      '高铁',      // gāotiě - high-speed rail
      '动车',      // dòngchē - bullet train
      '车次',      // chēcì - train number
      '班次',      // bāncì - service/schedule
      '旅行',      // lǚxíng - travel
      '旅程',      // lǚchéng - journey
      '行程',      // xíngchéng - itinerary
      '出行',      // chūxíng - travel/trip
    ],
    variations: [
      '火車',      // Traditional Chinese
      '列車',
      '高鐵',
    ],
    phrases: [
      '去',        // qù - go to
      '到',        // dào - arrive at
      '从',        // cóng - from
      '出发',      // chūfā - depart
      '到达',      // dàodá - arrive
      '怎么去',    // zěnme qù - how to get to
      '怎么到',    // zěnme dào - how to reach
    ],
    contextual: [
      '从',        // cóng - from
      '到',        // dào - to
      '往',        // wǎng - towards
    ]
  },

  weather_check: {
    primary: [
      '天气',      // tiānqì - weather
      '气温',      // qìwēn - temperature
      '温度',      // wēndù - temperature
      '下雨',      // xià yǔ - rain
      '下雪',      // xià xuě - snow
      '预报',      // yùbào - forecast
    ],
    variations: [
      '天氣',      // Traditional
      '氣溫',
    ],
    phrases: [
      '天气怎么样',  // weather how is
      '会下雨吗',    // will it rain
      '气温多少',    // what's the temperature
    ],
    contextual: []
  },

  station_search: {
    primary: [
      '车站',      // chēzhàn - station
      '火车站',    // huǒchēzhàn - train station
      '站台',      // zhàntái - platform
      '站点',      // zhàndiǎn - stop/station
      '出发',      // chūfā - departure
      '到达',      // dàodá - arrival
    ],
    variations: [
      '車站',      // Traditional
      '火車站',
      '站臺',
    ],
    phrases: [
      '哪个站台',    // which platform
      '几点发车',    // what time departs
      '列车时刻表',  // train schedule
    ],
    contextual: ['在']  // zài - at/in
  },

  train_formation: {
    primary: [
      '车厢',      // chēxiāng - coach/car
      '座位',      // zuòwèi - seat
      '编组',      // biānzǔ - formation
      '车次信息',  // train info
    ],
    variations: [
      '車廂',      // Traditional
    ],
    phrases: [
      '哪节车厢',    // which coach
      '座位在哪',    // where is seat
    ],
    contextual: []
  },

  general_info: {
    primary: [
      '信息',      // xìnxī - information
      '帮助',      // bāngzhù - help
      '查询',      // cháxún - inquire
    ],
    variations: [
      '資訊',      // Traditional (information)
      '幫助',
    ],
    phrases: [],
    contextual: []
  }
};
```

### 3. Hindi Keyword Dictionary

```typescript
const INTENT_KEYWORDS_HI: Record<Intent['type'], KeywordSet> = {
  trip_planning: {
    primary: [
      'ट्रेन',      // ṭren - train (from English)
      'रेल',        // rel - rail
      'रेलगाड़ी',    // relgāṛī - railway
      'गाड़ी',       // gāṛī - train/vehicle
      'यात्रा',      // yātrā - journey
      'सफर',        // safar - trip
      'सफ़र',       // safar (variant spelling)
      'यात्रा',     // yātrā - travel
    ],
    variations: [
      'ट्रैन',      // alternate spelling
      'रेलवे',      // railway
    ],
    phrases: [
      'जाना है',      // jānā hai - want to go
      'जाना चाहता',   // jānā cāhtā - want to go
      'कैसे जाएं',    // kaise jāeṃ - how to go
      'कैसे पहुंचें',  // kaise pahuṃceṃ - how to reach
    ],
    contextual: [
      'से',         // se - from
      'को',         // ko - to (object marker)
      'तक',         // tak - until/to
      'के लिए',     // ke lie - for
    ]
  },

  weather_check: {
    primary: [
      'मौसम',        // mausam - weather
      'तापमान',      // tāpmān - temperature
      'बारिश',       // bārish - rain
      'बर्फ',        // barf - snow
      'बर्फ़बारी',    // barfbārī - snowfall
      'पूर्वानुमान',  // pūrvānumān - forecast
    ],
    variations: [
      'मौसम की जानकारी',  // weather information
      'वेदर',              // weather (Hinglish)
    ],
    phrases: [
      'मौसम कैसा है',      // how is the weather
      'बारिश होगी',        // will it rain
      'तापमान कितना है',    // what is the temperature
    ],
    contextual: ['में']  // meṃ - in
  },

  station_search: {
    primary: [
      'स्टेशन',      // sṭeśan - station
      'रेलवे स्टेशन', // railway station
      'प्लेटफॉर्म',   // pleṭfŏrm - platform
      'प्लेटफार्म',   // alternate spelling
      'आगमन',        // āgaman - arrival
      'प्रस्थान',     // prasthān - departure
    ],
    variations: [
      'स्टेशन पर',    // at station
      'रेल्वे स्टेशन',
    ],
    phrases: [
      'कौन सा प्लेटफॉर्म',  // which platform
      'ट्रेन कब आएगी',      // when will train come
      'समय सारणी',          // timetable
    ],
    contextual: [
      'पर',         // par - at/on
      'में',        // meṃ - in
    ]
  },

  train_formation: {
    primary: [
      'डिब्बा',       // ḍibbā - coach
      'कोच',         // koc - coach (from English)
      'सीट',         // sīṭ - seat
      'बोगी',        // bogī - bogie/coach
    ],
    variations: [
      'बोगी नंबर',    // bogie number
    ],
    phrases: [
      'कौन सा डिब्बा',    // which coach
      'सीट कहाँ है',      // where is seat
    ],
    contextual: []
  },

  general_info: {
    primary: [
      'जानकारी',     // jānkārī - information
      'सूचना',       // sūcnā - information
      'मदद',         // madad - help
      'हेल्प',       // help (Hinglish)
    ],
    variations: [
      'इन्फो',       // info (Hinglish)
    ],
    phrases: [],
    contextual: []
  }
};
```

### 4. Enhanced Keyword Matching Logic

Need different matching strategies for different language families:

```typescript
function hasKeywordAdvanced(
  keywords: string[],
  message: string,
  language: Language
): { matched: boolean; matchedTerms: string[] } {
  const config = LANGUAGE_CONFIGS[language];
  const matchedTerms: string[] = [];

  if (config.family === 'cjk') {
    // Chinese: No word boundaries, character sequence matching
    return hasCJKKeyword(keywords, message, matchedTerms);
  } else if (config.family === 'devanagari') {
    // Hindi: Word boundaries + normalization
    return hasDevanagariKeyword(keywords, message, matchedTerms);
  } else {
    // Latin scripts: existing word boundary logic
    return hasLatinKeyword(keywords, message, matchedTerms);
  }
}

function hasCJKKeyword(
  keywords: string[],
  message: string,
  matchedTerms: string[]
): { matched: boolean; matchedTerms: string[] } {
  for (const keyword of keywords) {
    // Direct character sequence match (no word boundaries)
    if (message.includes(keyword)) {
      matchedTerms.push(keyword);
    }
  }
  return { matched: matchedTerms.length > 0, matchedTerms };
}

function hasDevanagariKeyword(
  keywords: string[],
  message: string,
  matchedTerms: string[]
): { matched: boolean; matchedTerms: string[] } {
  // Normalize combining characters
  const normalized = message.normalize('NFC');

  for (const keyword of keywords) {
    // Multi-word phrases: simple includes
    if (keyword.includes(' ')) {
      if (normalized.includes(keyword)) {
        matchedTerms.push(keyword);
      }
    } else {
      // Single words: use word boundaries
      const regex = new RegExp(
        `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'i'
      );
      if (regex.test(normalized)) {
        matchedTerms.push(keyword);
      }
    }
  }

  return { matched: matchedTerms.length > 0, matchedTerms };
}
```

### 5. Entity Extraction Patterns

#### Chinese Entity Patterns

```typescript
const ENTITY_PATTERNS_ZH = {
  origin: {
    // 从 X, 从 X 出发
    patterns: [
      /从([^\s到往，。！？]{1,20})(?:出发)?/,
      /由([^\s到往，。！？]{1,20})(?:出发)?/,
    ]
  },
  destination: {
    // 到 X, 去 X, 往 X
    patterns: [
      /到([^\s从，。！？]{1,20})/,
      /去([^\s从，。！？]{1,20})/,
      /往([^\s从，。！？]{1,20})/,
      /前往([^\s从，。！？]{1,20})/,
    ]
  },
  location: {
    // 在 X
    patterns: [
      /在([^\s从到往，。！？]{1,20})/,
    ]
  },
  time: {
    // X点, 早上, 下午, 晚上
    patterns: [
      /(\d{1,2})[点時]/,
      /([上下]午)/,
      /(早上|中午|下午|晚上|夜里)/,
    ]
  },
  date: {
    // 今天, 明天, 后天, X月X日
    patterns: [
      /(今天|明天|后天|昨天|前天)/,
      /(这个|下个|上个)(星期|周)([一二三四五六日天])?/,
      /(\d{1,2})月(\d{1,2})[日号]/,
    ]
  }
};
```

#### Hindi Entity Patterns

```typescript
const ENTITY_PATTERNS_HI = {
  origin: {
    // X से, X से चलकर
    patterns: [
      /([^\s]+?)\s*से(?:\s+(?:चलकर|निकलकर))?/,
      /([^\s]+?)\s*से\s+(?:प्रस्थान|रवाना)/,
    ]
  },
  destination: {
    // X को, X तक, X के लिए, X जाना
    patterns: [
      /([^\s]+?)\s*(?:को|तक|के\s+लिए)/,
      /([^\s]+?)\s*जाना/,
      /([^\s]+?)\s*पहुंचना/,
    ]
  },
  location: {
    // X में, X पर
    patterns: [
      /([^\s]+?)\s*(?:में|पर)/,
    ]
  },
  time: {
    // X बजे, सुबह, दोपहर, शाम
    patterns: [
      /(\d{1,2})[:\.]?(\d{2})?\s*बजे/,
      /(सुबह|दोपहर|शाम|रात)/,
    ]
  },
  date: {
    // आज, कल, परसों, सोमवार
    patterns: [
      /(आज|कल|परसों|बीता\s*कल)/,
      /(सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार)/,
      /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/,
    ]
  }
};
```

### 6. Simplified ↔ Traditional Chinese Conversion

```typescript
// Minimal conversion map for common train/travel terms
const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '火车': '火車',
  '列车': '列車',
  '高铁': '高鐵',
  '车站': '車站',
  '车厢': '車廂',
  '天气': '天氣',
  '气温': '氣溫',
  '时间': '時間',
  '信息': '資訊',
  // ... more mappings
};

const TRADITIONAL_TO_SIMPLIFIED: Record<string, string> =
  Object.fromEntries(
    Object.entries(SIMPLIFIED_TO_TRADITIONAL).map(([s, t]) => [t, s])
  );

function normalizeChinese(text: string): string {
  // Convert traditional to simplified for consistent matching
  let normalized = text;
  for (const [trad, simp] of Object.entries(TRADITIONAL_TO_SIMPLIFIED)) {
    normalized = normalized.replace(new RegExp(trad, 'g'), simp);
  }
  return normalized;
}
```

### 7. Enhanced Language Detection

```typescript
function detectMessageLanguage(message: string): Language[] {
  const detectedLanguages: Language[] = [];

  // CJK detection (Chinese)
  if (/[\u4e00-\u9fff]/.test(message)) {
    detectedLanguages.push('zh');
  }

  // Devanagari detection (Hindi)
  if (/[\u0900-\u097F]/.test(message)) {
    detectedLanguages.push('hi');
  }

  // Latin script languages (existing logic)
  const indicators = {
    de: /\b(zug|bahn|nach|von|morgen|heute)\b/i,
    fr: /\b(train|depuis|demain|aujourd'hui|gare)\b/i,
    it: /\b(treno|viaggio|oggi|domani|stazione)\b/i,
    en: /\b(train|from|tomorrow|today|station)\b/i,
  };

  for (const [lang, pattern] of Object.entries(indicators)) {
    if (pattern.test(message)) {
      detectedLanguages.push(lang as Language);
    }
  }

  return detectedLanguages.length > 0 ? detectedLanguages : ['en'];
}
```

---

## 🧪 Test Cases

### Chinese Examples

**Trip Planning:**
```
从苏黎世到伯尔尼的火车       // Trains from Zurich to Bern
明天早上10点去日内瓦          // Go to Geneva tomorrow morning 10am
怎么去卢塞恩                  // How to get to Lucerne
苏黎世→伯尔尼                 // Zurich → Bern (with arrow)
从蘇黎世到伯恩 (Traditional)  // From Zurich to Bern
```

**Weather:**
```
苏黎世的天气怎么样            // How's the weather in Zurich
卢塞恩明天会下雨吗            // Will it rain in Lucerne tomorrow
气温多少度                    // What's the temperature
```

**Station:**
```
苏黎世火车站的出发时间        // Zurich station departure times
哪个站台                      // Which platform
```

### Hindi Examples

**Trip Planning:**
```
ज्यूरिख से बर्न जाने वाली ट्रेन      // Trains going from Zurich to Bern
कल सुबह 10 बजे जिनेवा जाना है        // Want to go to Geneva tomorrow 10am
लुसर्न कैसे पहुंचें                   // How to reach Lucerne
Zurich से Bern (Hinglish)            // From Zurich to Bern (mixed)
```

**Weather:**
```
ज्यूरिख में मौसम कैसा है             // How's the weather in Zurich
लुसर्न में कल बारिश होगी             // Will it rain in Lucerne tomorrow
तापमान कितना है                      // What's the temperature
```

**Station:**
```
ज्यूरिख स्टेशन से ट्रेन कब निकलती है // When does train leave Zurich station
कौन सा प्लेटफॉर्म                     // Which platform
```

### Edge Cases

**Mixed Scripts:**
```
从Zurich到Bern的train                 // Chinese + English
Zürich से Geneva जाना है              // Hindi + English with diacritics
我要去Luzern看weather                  // Chinese + English
```

**Romanized:**
```
Zurich se Bern jaana hai              // Romanized Hindi
cong Zurich dao Bern (Pinyin)        // Romanized Chinese (rare)
```

---

## 🚧 Implementation Challenges & Solutions

### Challenge 1: Character Encoding

**Problem:** Different encodings for Chinese (GB2312, Big5, UTF-8)
**Solution:**
- Always use UTF-8 internally
- Normalize on input: `text.normalize('NFC')`

### Challenge 2: Hinglish Detection

**Problem:** Mixed Hindi-English like "Zurich se Bern ki train"
**Solution:**
- Run both Hindi and English keyword matching
- Accept if either matches
- Entity extraction tries both pattern sets

### Challenge 3: Chinese Segmentation

**Problem:** No spaces, so "苏黎世火车站" could be "苏黎世 + 火车站" or "苏黎世火车 + 站"
**Solution:**
- Use longest match principle
- Match known place names first (Zurich = 苏黎世)
- Use character n-grams for unknown terms

### Challenge 4: Transliteration Variations

**Problem:** "Zurich" = 苏黎世 (Sūlíshì) in Chinese, ज्यूरिख (Jyūrikh) in Hindi
**Solution:**
- Build transliteration dictionary for Swiss cities/stations
- Use phonetic similarity for unknown places

### Challenge 5: Right-to-Left UI (Future: Arabic/Hebrew)

**Problem:** Not applicable for Chinese/Hindi, but good to plan ahead
**Solution:**
- CSS `direction: rtl` based on detected language
- Mirror UI elements for RTL languages

---

## 📊 Extended Success Metrics

| Metric | Chinese Target | Hindi Target | Measurement |
|--------|---------------|--------------|-------------|
| Intent Classification | >85% | >85% | Test suite pass rate |
| Entity Extraction | >80% | >80% | Correct origin/destination |
| Hinglish Handling | - | >90% | Mixed script queries |
| Traditional Chinese | >95% | - | Simplified→Traditional conversion |
| Response Time | <200ms | <200ms | P95 latency |

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
1. Add Chinese and Hindi to `Language` type
2. Create `LANGUAGE_CONFIGS` with character ranges
3. Implement `hasCJKKeyword()` and `hasDevanagariKeyword()`
4. Add Unicode normalization utilities

### Phase 2: Keywords (Week 2)
1. Build Chinese keyword dictionary (50+ terms)
2. Build Hindi keyword dictionary (50+ terms)
3. Create Swiss city name transliteration maps
4. Test keyword matching with 25 examples each

### Phase 3: Entity Extraction (Week 3)
1. Implement Chinese entity patterns
2. Implement Hindi entity patterns
3. Handle Hinglish entity extraction
4. Test with 50 extraction examples

### Phase 4: Validation (Week 4)
1. Create 100 test cases per language
2. User testing with native speakers
3. Collect real-world Hinglish examples
4. Benchmark performance

---

## 🌐 Localization Considerations

### Chinese Localization
- **Date format:** 2024年12月29日 (Year月Month日Day)
- **Time format:** 10点30分 or 10:30
- **12hr vs 24hr:** Both acceptable, 24hr more common
- **Currency:** CHF → 瑞士法郎 (Ruìshì fǎláng)

### Hindi Localization
- **Date format:** 29 दिसंबर 2024 or 29/12/2024
- **Time format:** 10:30 बजे or 10 बजे (baje = o'clock)
- **12hr vs 24hr:** 12hr more common
- **Currency:** CHF → स्विस फ़्रैंक (Swiss Frank)

---

## 💡 Quick Wins for Chinese & Hindi

**Can be implemented in 1 day:**

1. **Add basic Chinese keywords** (2 hours)
   - 火车, 车站, 天气, 从, 到

2. **Add basic Hindi keywords** (2 hours)
   - ट्रेन, स्टेशन, मौसम, से, को

3. **Unicode detection** (30 min)
   - Detect CJK/Devanagari ranges

4. **Simplified Chinese entity extraction** (1 hour)
   - Match 从X到Y pattern

5. **Hindi entity extraction** (1 hour)
   - Match X से Y को pattern

---

## 📚 Resources

**Chinese:**
- China Railway terminology: https://www.12306.cn/
- Unicode CJK blocks: https://www.unicode.org/charts/PDF/U4E00.pdf
- Simplified ↔ Traditional converter: https://github.com/BYVoid/OpenCC

**Hindi:**
- Indian Railways terminology: https://indianrailways.gov.in/
- Unicode Devanagari: https://www.unicode.org/charts/PDF/U0900.pdf
- Hindi NLP tools: https://github.com/anoopkunchukuttan/indic_nlp_library

**General:**
- ICU library for Unicode: http://site.icu-project.org/
- Language detection: https://github.com/wooorm/franc

---

## 🎯 Next Steps

1. **Prioritize languages:** Chinese first (larger user base) or Hindi first (simpler)?
2. **Build transliteration maps:** Swiss cities in Chinese/Hindi
3. **Partner with native speakers:** For terminology validation
4. **Start with Quick Wins:** Get basic support working ASAP
5. **Iterate based on feedback:** Improve accuracy with real usage data

---

**Estimated Total Effort:** 4-6 weeks for production-ready Chinese + Hindi support
**Minimum Viable Product:** 1 week for basic keyword matching and entity extraction
