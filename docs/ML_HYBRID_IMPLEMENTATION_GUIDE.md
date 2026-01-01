# Hybrid ML Implementation Guide: Step-by-Step

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Purpose:** Complete implementation guide for adding ML-based intent classification with rule-based fallback

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Setup & Dependencies](#phase-1-setup--dependencies)
4. [Phase 2: Training Data Preparation](#phase-2-training-data-preparation)
5. [Phase 3: Model Training](#phase-3-model-training)
6. [Phase 4: Model Deployment](#phase-4-model-deployment)
7. [Phase 5: Integration](#phase-5-integration)
8. [Phase 6: Testing & Validation](#phase-6-testing--validation)
9. [Phase 7: Monitoring & Improvement](#phase-7-monitoring--improvement)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

```
User Message
    │
    ▼
┌─────────────────────┐
│  ML Intent Model    │ ← Try first
│  (TensorFlow.js)    │
└─────────┬───────────┘
          │
     confidence > 0.7?
          │
    ┌─────┴─────┐
   YES          NO
    │            │
    ▼            ▼
┌───────┐   ┌──────────┐
│  Use  │   │ Fallback │
│  ML   │   │ to Rules │
└───────┘   └──────────┘
```

### Goal

Add ML-based intent classification that:
- Achieves >90% accuracy
- Falls back to rules when confidence < 70%
- Runs in browser (privacy-first)
- Loads in <1 second
- Model size <20MB

---

## Prerequisites

### Skills Required

- ✅ TypeScript/JavaScript
- ✅ Next.js basics
- ⚠️ Python (for training) - can use Node.js alternative
- ⚠️ Basic ML concepts (helpful but not required)

### Tools Needed

```bash
# Node.js packages (install in next steps)
- @tensorflow/tfjs
- @tensorflow/tfjs-node (training only)
- @tensorflow-models/universal-sentence-encoder

# Python (optional, for training)
- Python 3.8+
- tensorflow 2.x
```

---

## Phase 1: Setup & Dependencies

### Step 1.1: Install TensorFlow.js

```bash
cd /home/schlpbch/code/sbb-chat-mcp

pnpm add @tensorflow/tfjs @tensorflow-models/universal-sentence-encoder
pnpm add -D @tensorflow/tfjs-node  # For training
```

### Step 1.2: Create Directory Structure

```bash
mkdir -p src/lib/ml/models
mkdir -p src/lib/ml/training
mkdir -p data/training
mkdir -p public/models/intent-classifier
```

**Structure:**
```
src/lib/ml/
├── models/
│   ├── IntentClassifier.ts       # ML model wrapper
│   └── types.ts                  # ML types
├── training/
│   ├── trainIntentClassifier.ts  # Training script
│   └── dataAugmentation.ts       # Data augmentation
└── index.ts                      # Public exports

data/training/
└── intent-examples.json          # Training data

public/models/intent-classifier/
├── model.json                    # Trained model (generated)
├── weights.bin                   # Model weights (generated)
└── metadata.json                 # Model metadata (generated)
```

### Step 1.3: Create Type Definitions

```typescript
// src/lib/ml/models/types.ts

export interface MLIntentPrediction {
  intent: string;
  confidence: number;
  probabilities: Record<string, number>;
  method: 'ml' | 'rules';
}

export const INTENT_LABELS = [
  'trip_planning',
  'weather_check',
  'snow_conditions',
  'station_search',
  'train_formation',
  'general_info',
] as const;

export type IntentLabel = typeof INTENT_LABELS[number];
```

---

## Phase 2: Training Data Preparation

### Step 2.1: Create Training Data File

```bash
touch data/training/intent-examples.json
```

### Step 2.2: Add Training Examples

```json
// data/training/intent-examples.json
[
  {
    "text": "Find trains from Zurich to Bern",
    "intent": "trip_planning"
  },
  {
    "text": "How do I get to Geneva?",
    "intent": "trip_planning"
  },
  {
    "text": "I need to travel tomorrow morning",
    "intent": "trip_planning"
  },
  {
    "text": "Show me connections from Lausanne",
    "intent": "trip_planning"
  },
  {
    "text": "Züge von Zürich nach Bern",
    "intent": "trip_planning"
  },
  {
    "text": "Wie komme ich nach Basel?",
    "intent": "trip_planning"
  },
  {
    "text": "Trains de Zurich à Berne",
    "intent": "trip_planning"
  },
  {
    "text": "Treni da Zurigo a Berna",
    "intent": "trip_planning"
  },

  {
    "text": "What's the weather in Zurich?",
    "intent": "weather_check"
  },
  {
    "text": "Will it rain tomorrow?",
    "intent": "weather_check"
  },
  {
    "text": "Wie ist das Wetter in Luzern?",
    "intent": "weather_check"
  },
  {
    "text": "Quel temps fait-il à Genève?",
    "intent": "weather_check"
  },

  {
    "text": "Snow conditions in Interlaken",
    "intent": "snow_conditions"
  },
  {
    "text": "Is it snowing in Zermatt?",
    "intent": "snow_conditions"
  },
  {
    "text": "Schneebedingungen in Davos",
    "intent": "snow_conditions"
  },

  {
    "text": "Show departures from Bern",
    "intent": "station_search"
  },
  {
    "text": "Arrivals at Zurich HB",
    "intent": "station_search"
  },
  {
    "text": "What platform for the train to Basel?",
    "intent": "station_search"
  },

  {
    "text": "Where is coach 7?",
    "intent": "train_formation"
  },
  {
    "text": "Train composition for IC 815",
    "intent": "train_formation"
  },
  {
    "text": "Wo ist der Speisewagen?",
    "intent": "train_formation"
  },

  {
    "text": "Hello",
    "intent": "general_info"
  },
  {
    "text": "What can you do?",
    "intent": "general_info"
  },
  {
    "text": "Help me",
    "intent": "general_info"
  }
]
```

**📝 Note:** You need **500-1000 examples per intent** for good accuracy. This is just a starter set.

### Step 2.3: Data Augmentation Script

```typescript
// src/lib/ml/training/dataAugmentation.ts

interface TrainingExample {
  text: string;
  intent: string;
}

interface SynonymMap {
  [key: string]: string[];
}

const SYNONYMS: SynonymMap = {
  // English
  train: ['trains', 'rail', 'railway', 'locomotive'],
  from: ['starting from', 'leaving from', 'departing from'],
  to: ['going to', 'heading to', 'arriving at', 'traveling to'],
  weather: ['forecast', 'conditions', 'climate'],
  station: ['stop', 'terminal', 'depot'],

  // German
  zug: ['züge', 'bahn', 'eisenbahn'],
  von: ['ab', 'ausgehend von'],
  nach: ['bis', 'richtung'],

  // Add more...
};

const SWISS_CITIES = [
  'Zurich', 'Bern', 'Geneva', 'Lausanne', 'Basel',
  'Lucerne', 'Lugano', 'St. Gallen', 'Interlaken', 'Zermatt',
  'Davos', 'Chur', 'Winterthur', 'Thun',
];

/**
 * Augment dataset with synonym replacement
 */
export function augmentWithSynonyms(
  examples: TrainingExample[]
): TrainingExample[] {
  const augmented: TrainingExample[] = [...examples];

  examples.forEach((example) => {
    // For each synonym pair
    for (const [word, synonyms] of Object.entries(SYNONYMS)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');

      if (regex.test(example.text)) {
        // Create variant for each synonym
        synonyms.slice(0, 2).forEach((synonym) => {  // Limit to 2 variants
          augmented.push({
            text: example.text.replace(regex, synonym),
            intent: example.intent,
          });
        });
      }
    }
  });

  return augmented;
}

/**
 * Augment dataset with city substitution
 */
export function augmentWithCitySwaps(
  examples: TrainingExample[]
): TrainingExample[] {
  const augmented: TrainingExample[] = [...examples];

  examples.forEach((example) => {
    SWISS_CITIES.forEach((city) => {
      if (example.text.includes(city)) {
        // Replace with 2-3 other cities
        SWISS_CITIES.filter((c) => c !== city)
          .slice(0, 3)
          .forEach((newCity) => {
            augmented.push({
              text: example.text.replace(city, newCity),
              intent: example.intent,
            });
          });
      }
    });
  });

  return augmented;
}

/**
 * Full augmentation pipeline
 */
export function augmentDataset(
  examples: TrainingExample[],
  options: {
    synonyms?: boolean;
    citySwaps?: boolean;
  } = {}
): TrainingExample[] {
  let augmented = [...examples];

  if (options.synonyms !== false) {
    console.log('Applying synonym augmentation...');
    augmented = augmentWithSynonyms(augmented);
  }

  if (options.citySwaps !== false) {
    console.log('Applying city swap augmentation...');
    augmented = augmentWithCitySwaps(augmented);
  }

  console.log(`Augmented from ${examples.length} to ${augmented.length} examples`);
  return augmented;
}
```

### Step 2.4: Generate Augmented Dataset

```typescript
// scripts/augment-data.ts

import { readFileSync, writeFileSync } from 'fs';
import { augmentDataset } from '../src/lib/ml/training/dataAugmentation';

const rawData = JSON.parse(
  readFileSync('./data/training/intent-examples.json', 'utf-8')
);

const augmented = augmentDataset(rawData, {
  synonyms: true,
  citySwaps: true,
});

writeFileSync(
  './data/training/intent-examples-augmented.json',
  JSON.stringify(augmented, null, 2)
);

console.log(`✅ Augmented dataset saved: ${augmented.length} examples`);
```

**Run:**
```bash
npx tsx scripts/augment-data.ts
```

---

## Phase 3: Model Training

### Step 3.1: Create Training Script

```typescript
// src/lib/ml/training/trainIntentClassifier.ts

import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { readFileSync, writeFileSync } from 'fs';
import { INTENT_LABELS } from '../models/types';

interface TrainingExample {
  text: string;
  intent: string;
}

export async function trainIntentClassifier() {
  console.log('🚀 Starting training...\n');

  // 1. Load training data
  console.log('📂 Loading training data...');
  const trainingData: TrainingExample[] = JSON.parse(
    readFileSync('./data/training/intent-examples-augmented.json', 'utf-8')
  );
  console.log(`   Loaded ${trainingData.length} examples\n`);

  // 2. Load Universal Sentence Encoder
  console.log('🔧 Loading Universal Sentence Encoder...');
  const useModel = await use.load();
  console.log('   ✅ USE loaded\n');

  // 3. Generate embeddings
  console.log('🔢 Generating embeddings...');
  const texts = trainingData.map((ex) => ex.text);
  const embeddings = await useModel.embed(texts);
  console.log(`   ✅ Generated ${texts.length} embeddings\n`);

  // 4. Create labels (one-hot encoding)
  console.log('🏷️  Creating labels...');
  const labels = tf.tensor2d(
    trainingData.map((ex) => {
      const oneHot = new Array(INTENT_LABELS.length).fill(0);
      const index = INTENT_LABELS.indexOf(ex.intent as any);
      if (index === -1) {
        throw new Error(`Unknown intent: ${ex.intent}`);
      }
      oneHot[index] = 1;
      return oneHot;
    })
  );
  console.log('   ✅ Labels created\n');

  // 5. Build classifier model
  console.log('🏗️  Building classifier model...');
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [512], // USE embedding size
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: INTENT_LABELS.length,
        activation: 'softmax',
      }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  console.log('   ✅ Model built');
  model.summary();
  console.log('');

  // 6. Train model
  console.log('🎓 Training model...\n');
  const history = await model.fit(embeddings, labels, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `   Epoch ${(epoch + 1).toString().padStart(2)}/50: ` +
            `loss=${logs!.loss.toFixed(4)}, ` +
            `acc=${logs!.acc.toFixed(4)}, ` +
            `val_loss=${logs!.val_loss.toFixed(4)}, ` +
            `val_acc=${logs!.val_acc.toFixed(4)}`
        );
      },
    },
  });

  console.log('\n✅ Training complete!\n');

  // 7. Evaluate final accuracy
  const finalAccuracy = history.history.val_acc[history.history.val_acc.length - 1];
  console.log(`📊 Final Validation Accuracy: ${(finalAccuracy * 100).toFixed(2)}%\n`);

  // 8. Save model
  console.log('💾 Saving model...');
  await model.save('file://./public/models/intent-classifier');

  // Save metadata
  const metadata = {
    version: '1.0',
    trainedAt: new Date().toISOString(),
    intentLabels: INTENT_LABELS,
    trainingExamples: trainingData.length,
    finalAccuracy: finalAccuracy,
    epochs: 50,
  };
  writeFileSync(
    './public/models/intent-classifier/metadata.json',
    JSON.stringify(metadata, null, 2)
  );

  console.log('   ✅ Model saved to public/models/intent-classifier\n');

  // Cleanup
  embeddings.dispose();
  labels.dispose();
  model.dispose();

  console.log('🎉 Training complete!\n');
  return metadata;
}

// Run if called directly
if (require.main === module) {
  trainIntentClassifier()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Training failed:', error);
      process.exit(1);
    });
}
```

### Step 3.2: Add Training Script to package.json

```json
// package.json
{
  "scripts": {
    "train:intent": "tsx src/lib/ml/training/trainIntentClassifier.ts"
  }
}
```

### Step 3.3: Run Training

```bash
pnpm run train:intent
```

**Expected Output:**
```
🚀 Starting training...

📂 Loading training data...
   Loaded 2500 examples

🔧 Loading Universal Sentence Encoder...
   ✅ USE loaded

🔢 Generating embeddings...
   ✅ Generated 2500 embeddings

🏷️  Creating labels...
   ✅ Labels created

🏗️  Building classifier model...
   ✅ Model built
Model: sequential
_________________________________________________________________
Layer (type)                 Output shape              Param #
=================================================================
dense (Dense)                [null,128]                65664
_________________________________________________________________
dropout (Dropout)            [null,128]                0
_________________________________________________________________
dense_1 (Dense)              [null,64]                 8256
_________________________________________________________________
dropout_1 (Dropout)          [null,64]                 0
_________________________________________________________________
dense_2 (Dense)              [null,6]                  390
=================================================================
Total params: 74310
Trainable params: 74310
Non-trainable params: 0

🎓 Training model...

   Epoch  1/50: loss=1.5234, acc=0.5120, val_loss=1.3456, val_acc=0.6200
   Epoch  2/50: loss=1.2345, acc=0.6340, val_loss=1.1234, val_acc=0.7100
   ...
   Epoch 50/50: loss=0.1234, acc=0.9680, val_loss=0.2345, val_acc=0.9240

✅ Training complete!

📊 Final Validation Accuracy: 92.40%

💾 Saving model...
   ✅ Model saved to public/models/intent-classifier

🎉 Training complete!
```

---

## Phase 4: Model Deployment

### Step 4.1: Create Model Wrapper Class

```typescript
// src/lib/ml/models/IntentClassifier.ts

import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { INTENT_LABELS, type MLIntentPrediction } from './types';

export class IntentClassifier {
  private useModel: use.UniversalSentenceEncoder | null = null;
  private classifierModel: tf.LayersModel | null = null;
  private isLoaded = false;

  /**
   * Load models (USE + classifier)
   */
  async loadModels(): Promise<void> {
    if (this.isLoaded) {
      console.log('[IntentClassifier] Models already loaded');
      return;
    }

    console.log('[IntentClassifier] Loading Universal Sentence Encoder...');
    this.useModel = await use.load();

    console.log('[IntentClassifier] Loading intent classifier...');
    this.classifierModel = await tf.loadLayersModel(
      '/models/intent-classifier/model.json'
    );

    this.isLoaded = true;
    console.log('[IntentClassifier] ✅ Models loaded successfully');
  }

  /**
   * Predict intent from message
   */
  async predict(message: string): Promise<MLIntentPrediction> {
    if (!this.useModel || !this.classifierModel) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    // Normalize input
    const normalized = this.normalize(message);

    // Get embeddings from USE
    const embeddings = await this.useModel.embed([normalized]);

    // Predict intent
    const predictions = this.classifierModel.predict(embeddings) as tf.Tensor;
    const probabilities = await predictions.data();

    // Clean up tensors
    embeddings.dispose();
    predictions.dispose();

    // Get top prediction
    const maxProb = Math.max(...probabilities);
    const maxIndex = Array.from(probabilities).indexOf(maxProb);
    const intent = INTENT_LABELS[maxIndex];

    // Build probabilities object
    const probsObject: Record<string, number> = {};
    INTENT_LABELS.forEach((label, i) => {
      probsObject[label] = probabilities[i];
    });

    return {
      intent,
      confidence: maxProb,
      probabilities: probsObject,
      method: 'ml',
    };
  }

  /**
   * Normalize message for prediction
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim();
  }

  /**
   * Dispose models and free memory
   */
  dispose(): void {
    this.useModel = null;
    this.classifierModel?.dispose();
    this.classifierModel = null;
    this.isLoaded = false;
  }

  /**
   * Check if models are loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }
}
```

### Step 4.2: Create Singleton Instance

```typescript
// src/lib/ml/index.ts

import { IntentClassifier } from './models/IntentClassifier';

let intentClassifier: IntentClassifier | null = null;

/**
 * Get singleton IntentClassifier instance
 */
export async function getIntentClassifier(): Promise<IntentClassifier> {
  if (!intentClassifier) {
    intentClassifier = new IntentClassifier();
    await intentClassifier.loadModels();
  }
  return intentClassifier;
}

/**
 * Lazy initialize models (call on app start)
 */
export async function initMLModels(): Promise<void> {
  console.log('[ML] Initializing models...');
  await getIntentClassifier();
  console.log('[ML] ✅ Models ready');
}

// Re-export types
export * from './models/types';
export { IntentClassifier } from './models/IntentClassifier';
```

---

## Phase 5: Integration

### Step 5.1: Create Hybrid Intent Extractor

```typescript
// src/lib/llm/context/hybridIntentExtractor.ts

import type { Intent } from './types';
import type { Language } from './intentKeywords';
import { extractIntent as extractIntentRuleBased } from './intentExtractor';
import { getIntentClassifier } from '@/lib/ml';

const ML_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Hybrid intent extraction: Try ML first, fallback to rules
 */
export async function extractIntentHybrid(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  try {
    // 1. Try ML model first
    const classifier = await getIntentClassifier();
    const mlResult = await classifier.predict(message);

    console.log('[HybridIntentExtractor] ML prediction:', {
      intent: mlResult.intent,
      confidence: mlResult.confidence,
    });

    // 2. Use ML result if confidence is high enough
    if (mlResult.confidence >= ML_CONFIDENCE_THRESHOLD) {
      console.log(
        `[HybridIntentExtractor] Using ML result (confidence: ${mlResult.confidence.toFixed(2)})`
      );

      // Convert ML prediction to Intent format
      return {
        type: mlResult.intent as Intent['type'],
        confidence: mlResult.confidence,
        extractedEntities: {}, // Extract separately
        timestamp: new Date(),
        detectedLanguages: userLanguage ? [userLanguage] : ['en'],
        matchedKeywords: ['ml_prediction'],
        translatedFrom: null,
      };
    }

    // 3. Fallback to rule-based if confidence is low
    console.log(
      `[HybridIntentExtractor] ML confidence too low (${mlResult.confidence.toFixed(2)} < ${ML_CONFIDENCE_THRESHOLD}), using rule-based fallback`
    );
    return await extractIntentRuleBased(message, userLanguage);
  } catch (error) {
    // 4. Fallback to rule-based on error
    console.error(
      '[HybridIntentExtractor] ML error, using rule-based fallback:',
      error
    );
    return await extractIntentRuleBased(message, userLanguage);
  }
}
```

### Step 5.2: Update Intent Extractor Entry Point

```typescript
// src/lib/llm/context/intentExtractor.ts

// Add feature flag at top of file
const USE_ML_HYBRID = process.env.NEXT_PUBLIC_USE_ML_INTENT === 'true';

// Export both versions
export { extractIntentHybrid } from './hybridIntentExtractor';

// Original function stays the same, but rename to clarify
export async function extractIntentRuleBased(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  // ... existing implementation
}

// Default export switches based on flag
export const extractIntent = USE_ML_HYBRID
  ? extractIntentHybrid
  : extractIntentRuleBased;
```

### Step 5.3: Add Environment Variable

```bash
# .env.local
NEXT_PUBLIC_USE_ML_INTENT=true
```

```bash
# .env.example
# ML Intent Classification
# Set to 'true' to use ML-based intent classification
NEXT_PUBLIC_USE_ML_INTENT=false
```

### Step 5.4: Preload Models (Optional)

```typescript
// src/app/layout.tsx

import { useEffect } from 'react';
import { initMLModels } from '@/lib/ml';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Preload ML models on app mount
    if (process.env.NEXT_PUBLIC_USE_ML_INTENT === 'true') {
      initMLModels().catch(console.error);
    }
  }, []);

  return (
    // ... rest of layout
  );
}
```

---

## Phase 6: Testing & Validation

### Step 6.1: Create Test Cases

```typescript
// tests/ml/intentClassifier.test.ts

import { IntentClassifier } from '@/lib/ml/models/IntentClassifier';

describe('IntentClassifier', () => {
  let classifier: IntentClassifier;

  beforeAll(async () => {
    classifier = new IntentClassifier();
    await classifier.loadModels();
  });

  afterAll(() => {
    classifier.dispose();
  });

  describe('Trip Planning', () => {
    it('should classify trip queries correctly', async () => {
      const testCases = [
        'Find trains from Zurich to Bern',
        'How do I get to Geneva?',
        'Züge von Zürich nach Bern',
        'Trains de Zurich à Berne',
      ];

      for (const message of testCases) {
        const result = await classifier.predict(message);
        expect(result.intent).toBe('trip_planning');
        expect(result.confidence).toBeGreaterThan(0.7);
      }
    });
  });

  describe('Weather Check', () => {
    it('should classify weather queries correctly', async () => {
      const testCases = [
        "What's the weather in Zurich?",
        'Will it rain tomorrow?',
        'Wie ist das Wetter in Luzern?',
      ];

      for (const message of testCases) {
        const result = await classifier.predict(message);
        expect(result.intent).toBe('weather_check');
        expect(result.confidence).toBeGreaterThan(0.7);
      }
    });
  });

  // Add more test suites...
});
```

### Step 6.2: Run Tests

```bash
pnpm test tests/ml/intentClassifier.test.ts
```

### Step 6.3: Create Confusion Matrix Script

```typescript
// scripts/evaluate-model.ts

import { IntentClassifier } from '../src/lib/ml/models/IntentClassifier';
import { INTENT_LABELS } from '../src/lib/ml/models/types';
import { readFileSync } from 'fs';

interface ConfusionMatrix {
  [predicted: string]: {
    [actual: string]: number;
  };
}

async function evaluateModel() {
  // Load test data (separate from training data)
  const testData = JSON.parse(
    readFileSync('./data/testing/intent-test-cases.json', 'utf-8')
  );

  const classifier = new IntentClassifier();
  await classifier.loadModels();

  const confusionMatrix: ConfusionMatrix = {};
  let correct = 0;
  let total = 0;

  // Initialize confusion matrix
  INTENT_LABELS.forEach((predicted) => {
    confusionMatrix[predicted] = {};
    INTENT_LABELS.forEach((actual) => {
      confusionMatrix[predicted][actual] = 0;
    });
  });

  // Run predictions
  for (const example of testData) {
    const result = await classifier.predict(example.text);
    const predicted = result.intent;
    const actual = example.intent;

    confusionMatrix[predicted][actual]++;
    total++;
    if (predicted === actual) correct++;
  }

  // Print results
  console.log('\n📊 Evaluation Results\n');
  console.log(`Accuracy: ${((correct / total) * 100).toFixed(2)}%`);
  console.log(`Correct: ${correct}/${total}\n`);

  // Print confusion matrix
  console.log('Confusion Matrix:\n');
  console.log('Predicted \\ Actual |', INTENT_LABELS.join(' | '));
  console.log('-'.repeat(80));

  INTENT_LABELS.forEach((predicted) => {
    const row = INTENT_LABELS.map(
      (actual) => confusionMatrix[predicted][actual].toString().padStart(3)
    );
    console.log(`${predicted.padEnd(18)} | ${row.join(' | ')}`);
  });

  classifier.dispose();
}

evaluateModel();
```

---

## Phase 7: Monitoring & Improvement

### Step 7.1: Add Telemetry

```typescript
// src/lib/ml/telemetry.ts

interface PredictionLog {
  message: string;
  mlPrediction: string;
  mlConfidence: number;
  ruleBasedPrediction?: string;
  methodUsed: 'ml' | 'rules';
  timestamp: Date;
}

const predictionLogs: PredictionLog[] = [];

export function logPrediction(log: PredictionLog): void {
  predictionLogs.push(log);

  // Send to analytics (optional)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
    // sendToAnalytics(log);
  }
}

export function getPredictionLogs(): PredictionLog[] {
  return predictionLogs;
}
```

### Step 7.2: Update Hybrid Extractor with Logging

```typescript
// In hybridIntentExtractor.ts

import { logPrediction } from '@/lib/ml/telemetry';

export async function extractIntentHybrid(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  const mlResult = await classifier.predict(message);
  const ruleBasedResult = await extractIntentRuleBased(message, userLanguage);

  const useML = mlResult.confidence >= ML_CONFIDENCE_THRESHOLD;

  // Log for analysis
  logPrediction({
    message,
    mlPrediction: mlResult.intent,
    mlConfidence: mlResult.confidence,
    ruleBasedPrediction: ruleBasedResult.type,
    methodUsed: useML ? 'ml' : 'rules',
    timestamp: new Date(),
  });

  return useML ? /* ML result */ : ruleBasedResult;
}
```

### Step 7.3: Create Retraining Script

```typescript
// scripts/retrain-model.ts

import { trainIntentClassifier } from '../src/lib/ml/training/trainIntentClassifier';
import { getPredictionLogs } from '../src/lib/ml/telemetry';
import { readFileSync, writeFileSync } from 'fs';

async function retrainModel() {
  console.log('🔄 Starting model retraining...\n');

  // 1. Load original training data
  const originalData = JSON.parse(
    readFileSync('./data/training/intent-examples.json', 'utf-8')
  );

  // 2. Get new samples from logs (where ML was wrong)
  const logs = getPredictionLogs();
  const newSamples = logs
    .filter((log) => log.mlPrediction !== log.ruleBasedPrediction)
    .map((log) => ({
      text: log.message,
      intent: log.ruleBasedPrediction!, // Use rule-based as ground truth
    }));

  console.log(`Found ${newSamples.length} new training samples from logs\n`);

  // 3. Combine datasets
  const combinedData = [...originalData, ...newSamples];

  // 4. Save combined dataset
  writeFileSync(
    './data/training/intent-examples-retrain.json',
    JSON.stringify(combinedData, null, 2)
  );

  // 5. Retrain model
  const metadata = await trainIntentClassifier();

  console.log(`\n✅ Retraining complete!`);
  console.log(`   New accuracy: ${(metadata.finalAccuracy * 100).toFixed(2)}%`);
}

retrainModel();
```

---

## Troubleshooting

### Issue 1: Model Loading Fails

**Error:** `Failed to fetch model.json`

**Solutions:**
1. Ensure model files are in `public/models/intent-classifier/`
2. Check file permissions
3. Verify Next.js is serving static files correctly
4. Check browser console for CORS errors

### Issue 2: Low Accuracy (<80%)

**Solutions:**
1. Increase training data (need 500+ examples per intent)
2. Run data augmentation
3. Increase training epochs (try 100)
4. Adjust learning rate (try 0.0001)
5. Check for label errors in training data

### Issue 3: Slow Loading Time

**Solutions:**
1. Quantize model (reduce size 4x)
2. Use WASM backend for faster inference
3. Preload models on app mount
4. Consider model pruning

### Issue 4: High Memory Usage

**Solutions:**
1. Dispose tensors after use
2. Use `tf.tidy()` for automatic cleanup
3. Limit batch size during inference
4. Clear model cache periodically

---

## Summary Checklist

### Setup
- [ ] Install TensorFlow.js dependencies
- [ ] Create directory structure
- [ ] Add type definitions

### Training
- [ ] Create training data (500+ examples per intent)
- [ ] Run data augmentation
- [ ] Train model
- [ ] Evaluate accuracy (target: >90%)
- [ ] Save model to `public/models/`

### Integration
- [ ] Create IntentClassifier wrapper
- [ ] Implement hybrid extractor
- [ ] Add feature flag
- [ ] Update environment variables
- [ ] Add preloading (optional)

### Testing
- [ ] Write unit tests
- [ ] Create confusion matrix
- [ ] Test edge cases
- [ ] Validate accuracy in production

### Monitoring
- [ ] Add telemetry logging
- [ ] Set up retraining pipeline
- [ ] Monitor accuracy metrics
- [ ] Collect user feedback

---

**Total Implementation Time:** 2-3 weeks

**Next Steps:**
1. Start with Phase 1 (Setup)
2. Collect training data (most time-consuming)
3. Train initial model
4. Integrate with feature flag (safe rollout)
5. Monitor and iterate

Good luck! 🚀
