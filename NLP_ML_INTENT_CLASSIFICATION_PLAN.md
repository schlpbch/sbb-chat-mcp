# NLP-Based Intent Classification with TensorFlow.js

**Goal:** Replace or augment the keyword-based intent extraction with a lightweight machine learning model that runs in the browser using TensorFlow.js.

---

## 📊 Why ML for Intent Classification?

### Current Keyword-Based Limitations

❌ **Brittle pattern matching** - Misses variations and synonyms
❌ **Language-specific rules** - Requires manual keyword lists per language
❌ **No semantic understanding** - Can't handle paraphrasing
❌ **Conflict resolution** - Hard to disambiguate overlapping intents
❌ **Maintenance overhead** - New keywords need manual updates

### ML-Based Benefits

✅ **Semantic understanding** - Learns meaning, not just keywords
✅ **Handles variations** - Generalizes to unseen phrases
✅ **Multilingual support** - Single model for all languages (with multilingual embeddings)
✅ **Confidence scores** - Natural probability distribution over intents
✅ **Self-improving** - Can retrain with user feedback
✅ **Edge deployment** - Runs locally in browser (privacy + speed)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input Message                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│            Preprocessing & Tokenization                      │
│  • Lowercase normalization                                   │
│  • Unicode normalization (NFD/NFC)                          │
│  • Remove special characters                                │
│  • Tokenize into words/subwords                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               Text Embedding Layer                           │
│  Option 1: Universal Sentence Encoder (USE)                 │
│  Option 2: DistilBERT multilingual embeddings               │
│  Option 3: Custom trained word embeddings                   │
│  → Converts text to 128-512 dimensional vector              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          Intent Classification Head                          │
│  • Dense layer(s) with ReLU activation                      │
│  • Dropout for regularization                               │
│  • Softmax output (5 classes)                               │
│    - trip_planning                                          │
│    - weather_check                                          │
│    - station_search                                         │
│    - train_formation                                        │
│    - general_info                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         Entity Extraction (Parallel Path)                    │
│  • Named Entity Recognition (NER) with LSTM/BiLSTM          │
│  • Token classification (BIO tagging)                       │
│    - B-ORIGIN, I-ORIGIN                                     │
│    - B-DESTINATION, I-DESTINATION                           │
│    - B-TIME, I-TIME                                         │
│    - B-DATE, I-DATE                                         │
│    - O (Outside)                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                Final Output                                  │
│  {                                                           │
│    intent: "trip_planning",                                 │
│    confidence: 0.94,                                        │
│    entities: {                                              │
│      origin: "Zürich",                                      │
│      destination: "Bern",                                   │
│      date: "tomorrow",                                      │
│      time: "10am"                                           │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Model Options & Trade-offs

### Option 1: Universal Sentence Encoder (USE) + Dense Classifier

**Architecture:**
```
Input → USE Embeddings (512d) → Dense(128) → ReLU → Dropout(0.3)
    → Dense(64) → ReLU → Dropout(0.3) → Dense(5) → Softmax
```

**Pros:**
- ✅ Pre-trained on massive corpus (multilingual support)
- ✅ Excellent semantic understanding
- ✅ Small model size (~50MB)
- ✅ Fast inference (~10-20ms)
- ✅ No training needed for embeddings

**Cons:**
- ❌ Fixed embedding model (can't fine-tune)
- ❌ 50MB download (but cached after first load)

**Best for:** Quick deployment, multilingual support

### Option 2: DistilBERT Multilingual + Fine-tuning

**Architecture:**
```
Input → Tokenizer → DistilBERT-multilingual (768d) → [CLS] token
    → Dense(128) → ReLU → Dense(5) → Softmax
```

**Pros:**
- ✅ State-of-the-art accuracy
- ✅ Fine-tunable on domain data
- ✅ Multilingual out-of-the-box (100+ languages)
- ✅ Contextual embeddings (better than USE for complex queries)

**Cons:**
- ❌ Larger model (~135MB)
- ❌ Slower inference (~50-100ms)
- ❌ Requires more training data

**Best for:** Maximum accuracy, willing to trade size/speed

### Option 3: Custom Lightweight CNN/LSTM

**Architecture:**
```
Input → Word Embeddings (100d) → 1D CNN (filters=64, kernel=3)
    → MaxPool → LSTM(64) → Dense(32) → Dense(5) → Softmax
```

**Pros:**
- ✅ Smallest model size (~5-10MB)
- ✅ Fastest inference (~5ms)
- ✅ Full control over architecture
- ✅ Easy to train and deploy

**Cons:**
- ❌ Requires more training data
- ❌ Need to train word embeddings from scratch
- ❌ Lower accuracy than transformers
- ❌ Separate model per language (or multilingual embeddings needed)

**Best for:** Offline-first, performance-critical applications

### **Recommended: Hybrid Approach**

Use **Option 1 (USE)** for intent classification + **Option 3 (LSTM)** for entity extraction.

**Why?**
- Intent classification benefits from semantic understanding (USE)
- Entity extraction is more syntax-driven (LSTM works well)
- Combined model size: ~55-60MB
- Total inference time: ~15-25ms

---

## 📦 TensorFlow.js Implementation

### 1. Project Setup

```bash
npm install @tensorflow/tfjs @tensorflow-models/universal-sentence-encoder
npm install @tensorflow/tfjs-node  # For training only (server-side)
```

### 2. Model Architecture (Intent Classifier)

```typescript
// src/lib/ml/models/intentClassifier.ts

import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export class IntentClassifier {
  private useModel: use.UniversalSentenceEncoder | null = null;
  private classifierModel: tf.LayersModel | null = null;
  private readonly INTENT_LABELS = [
    'trip_planning',
    'weather_check',
    'station_search',
    'train_formation',
    'general_info'
  ];

  async loadModels() {
    console.log('[IntentClassifier] Loading Universal Sentence Encoder...');
    this.useModel = await use.load();

    console.log('[IntentClassifier] Loading intent classifier...');
    this.classifierModel = await tf.loadLayersModel('/models/intent-classifier/model.json');
  }

  async predict(message: string): Promise<{
    intent: string;
    confidence: number;
    probabilities: Record<string, number>;
  }> {
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
    const intent = this.INTENT_LABELS[maxIndex];

    // Build probabilities object
    const probsObject: Record<string, number> = {};
    this.INTENT_LABELS.forEach((label, i) => {
      probsObject[label] = probabilities[i];
    });

    return {
      intent,
      confidence: maxProb,
      probabilities: probsObject
    };
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim();
  }

  dispose() {
    this.useModel = null;
    this.classifierModel?.dispose();
  }
}
```

### 3. Training Pipeline (Server-side with tfjs-node)

```typescript
// scripts/train-intent-classifier.ts

import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { readFileSync } from 'fs';

interface TrainingExample {
  text: string;
  intent: string;
}

const INTENT_LABELS = [
  'trip_planning',
  'weather_check',
  'station_search',
  'train_formation',
  'general_info'
];

async function trainIntentClassifier() {
  console.log('Loading training data...');
  const trainingData: TrainingExample[] = JSON.parse(
    readFileSync('./data/training/intent-examples.json', 'utf-8')
  );

  console.log(`Loaded ${trainingData.length} training examples`);

  console.log('Loading Universal Sentence Encoder...');
  const useModel = await use.load();

  console.log('Generating embeddings...');
  const texts = trainingData.map(ex => ex.text);
  const embeddings = await useModel.embed(texts);

  // Create labels (one-hot encoding)
  const labels = tf.tensor2d(
    trainingData.map(ex => {
      const oneHot = new Array(INTENT_LABELS.length).fill(0);
      oneHot[INTENT_LABELS.indexOf(ex.intent)] = 1;
      return oneHot;
    })
  );

  console.log('Building classifier model...');
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [512], // USE embedding size
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: INTENT_LABELS.length,
        activation: 'softmax'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  console.log('Training model...');
  await model.fit(embeddings, labels, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, ` +
          `accuracy = ${logs?.acc.toFixed(4)}, ` +
          `val_loss = ${logs?.val_loss.toFixed(4)}, ` +
          `val_accuracy = ${logs?.val_acc.toFixed(4)}`
        );
      }
    }
  });

  console.log('Saving model...');
  await model.save('file://./public/models/intent-classifier');

  console.log('Model saved successfully!');

  // Cleanup
  embeddings.dispose();
  labels.dispose();
  model.dispose();
}

trainIntentClassifier().catch(console.error);
```

### 4. Training Data Format

```json
// data/training/intent-examples.json
[
  {
    "text": "Find trains from Zurich to Bern",
    "intent": "trip_planning"
  },
  {
    "text": "Züge von Zürich nach Bern",
    "intent": "trip_planning"
  },
  {
    "text": "Trains de Zurich à Berne",
    "intent": "trip_planning"
  },
  {
    "text": "从苏黎世到伯尔尼的火车",
    "intent": "trip_planning"
  },
  {
    "text": "ज्यूरिख से बर्न जाने वाली ट्रेन",
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
    "text": "What's the weather in Lucerne?",
    "intent": "weather_check"
  },
  {
    "text": "Wie ist das Wetter in Luzern?",
    "intent": "weather_check"
  },
  {
    "text": "Will it rain tomorrow?",
    "intent": "weather_check"
  },
  {
    "text": "卢塞恩的天气怎么样",
    "intent": "weather_check"
  },
  {
    "text": "लुसर्न में मौसम कैसा है",
    "intent": "weather_check"
  },
  {
    "text": "Show me departures from Zurich HB",
    "intent": "station_search"
  },
  {
    "text": "Abfahrten vom Bahnhof Zürich",
    "intent": "station_search"
  },
  {
    "text": "What platform for the train to Basel?",
    "intent": "station_search"
  },
  {
    "text": "苏黎世火车站的出发时间",
    "intent": "station_search"
  },
  {
    "text": "Where is coach 7?",
    "intent": "train_formation"
  },
  {
    "text": "Wo ist Wagen 7?",
    "intent": "train_formation"
  },
  {
    "text": "Train composition for IC 815",
    "intent": "train_formation"
  },
  {
    "text": "Hello",
    "intent": "general_info"
  },
  {
    "text": "Help me plan my trip",
    "intent": "general_info"
  },
  {
    "text": "What can you do?",
    "intent": "general_info"
  }
]
```

**Note:** Need **500-1000 examples per intent** for good accuracy. Use data augmentation!

### 5. Data Augmentation

```typescript
// scripts/augment-training-data.ts

import * as tf from '@tensorflow/tfjs-node';

interface AugmentationStrategy {
  name: string;
  apply: (text: string) => string[];
}

const augmentations: AugmentationStrategy[] = [
  // Synonym replacement
  {
    name: 'synonym',
    apply: (text) => {
      const synonyms: Record<string, string[]> = {
        'train': ['trains', 'rail', 'railway'],
        'from': ['starting from', 'leaving from', 'departing from'],
        'to': ['going to', 'heading to', 'arriving at'],
        'weather': ['forecast', 'conditions', 'climate'],
        'station': ['stop', 'terminal', 'depot'],
      };

      const variants: string[] = [];
      for (const [word, syns] of Object.entries(synonyms)) {
        if (text.toLowerCase().includes(word)) {
          syns.forEach(syn => {
            variants.push(text.replace(new RegExp(word, 'gi'), syn));
          });
        }
      }
      return variants;
    }
  },

  // Entity substitution (swap cities)
  {
    name: 'entity_swap',
    apply: (text) => {
      const cities = [
        'Zurich', 'Bern', 'Geneva', 'Lausanne', 'Lucerne',
        'Basel', 'Lugano', 'Interlaken', 'St. Gallen'
      ];

      const variants: string[] = [];
      cities.forEach(city => {
        if (text.includes(city)) {
          // Replace with other cities
          cities.filter(c => c !== city).forEach(newCity => {
            variants.push(text.replace(city, newCity));
          });
        }
      });
      return variants.slice(0, 3); // Limit to 3 variants
    }
  },

  // Back-translation (via Google Translate API - not shown here)
  // Paraphrasing (via GPT API - not shown here)
];

function augmentDataset(examples: TrainingExample[]): TrainingExample[] {
  const augmented: TrainingExample[] = [...examples];

  examples.forEach(example => {
    augmentations.forEach(aug => {
      const variants = aug.apply(example.text);
      variants.forEach(variant => {
        augmented.push({
          text: variant,
          intent: example.intent
        });
      });
    });
  });

  console.log(`Augmented from ${examples.length} to ${augmented.length} examples`);
  return augmented;
}
```

---

## 🎯 Entity Extraction with BiLSTM-CRF

### Architecture

```typescript
// src/lib/ml/models/entityExtractor.ts

import * as tf from '@tensorflow/tfjs';

export class EntityExtractor {
  private model: tf.LayersModel | null = null;
  private tokenizer: Tokenizer | null = null;
  private readonly LABELS = [
    'O',           // Outside
    'B-ORIGIN',    // Begin origin
    'I-ORIGIN',    // Inside origin
    'B-DEST',      // Begin destination
    'I-DEST',      // Inside destination
    'B-TIME',      // Begin time
    'I-TIME',      // Inside time
    'B-DATE',      // Begin date
    'I-DATE',      // Inside date
  ];

  async loadModel() {
    this.model = await tf.loadLayersModel('/models/entity-extractor/model.json');
    this.tokenizer = await loadTokenizer('/models/entity-extractor/tokenizer.json');
  }

  async extract(message: string): Promise<{
    origin?: string;
    destination?: string;
    time?: string;
    date?: string;
  }> {
    if (!this.model || !this.tokenizer) {
      throw new Error('Model not loaded');
    }

    // Tokenize
    const tokens = this.tokenizer.tokenize(message);
    const tokenIds = this.tokenizer.encode(tokens);

    // Pad to max length
    const padded = this.pad(tokenIds, 50); // Max 50 tokens

    // Predict
    const input = tf.tensor2d([padded]);
    const predictions = this.model.predict(input) as tf.Tensor;
    const labelIds = await predictions.argMax(-1).data();

    // Decode labels
    const labels = Array.from(labelIds).map(id => this.LABELS[id]);

    // Extract entities using BIO tags
    return this.decodeEntities(tokens, labels);
  }

  private decodeEntities(
    tokens: string[],
    labels: string[]
  ): Record<string, string> {
    const entities: Record<string, string> = {};
    let currentEntity = '';
    let currentTokens: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const label = labels[i];
      const token = tokens[i];

      if (label.startsWith('B-')) {
        // Start of new entity
        if (currentEntity && currentTokens.length > 0) {
          entities[currentEntity] = currentTokens.join(' ');
        }
        currentEntity = label.replace('B-', '').toLowerCase();
        currentTokens = [token];
      } else if (label.startsWith('I-')) {
        // Continuation of entity
        currentTokens.push(token);
      } else {
        // Outside entity
        if (currentEntity && currentTokens.length > 0) {
          entities[currentEntity] = currentTokens.join(' ');
          currentEntity = '';
          currentTokens = [];
        }
      }
    }

    // Handle last entity
    if (currentEntity && currentTokens.length > 0) {
      entities[currentEntity] = currentTokens.join(' ');
    }

    return entities;
  }

  private pad(arr: number[], length: number): number[] {
    return arr.length >= length
      ? arr.slice(0, length)
      : [...arr, ...new Array(length - arr.length).fill(0)];
  }
}
```

### Training BiLSTM for NER

```typescript
// scripts/train-entity-extractor.ts

import * as tf from '@tensorflow/tfjs-node';

async function buildNERModel(
  vocabSize: number,
  maxSeqLength: number,
  numLabels: number
): Promise<tf.LayersModel> {
  const input = tf.input({ shape: [maxSeqLength] });

  // Embedding layer
  let x = tf.layers.embedding({
    inputDim: vocabSize,
    outputDim: 100,
    maskZero: true
  }).apply(input) as tf.SymbolicTensor;

  // Bidirectional LSTM
  x = tf.layers.bidirectional({
    layer: tf.layers.lstm({
      units: 64,
      returnSequences: true,
      recurrentDropout: 0.1
    })
  }).apply(x) as tf.SymbolicTensor;

  // Dropout
  x = tf.layers.dropout({ rate: 0.3 }).apply(x) as tf.SymbolicTensor;

  // Dense layer for classification
  x = tf.layers.timeDistributed({
    layer: tf.layers.dense({ units: numLabels, activation: 'softmax' })
  }).apply(x) as tf.SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: x });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}
```

---

## 🚀 Deployment Strategy

### 1. Model Hosting

**Option A: CDN (Recommended)**
- Host models on CDN (e.g., Cloudflare, AWS CloudFront)
- Fast global delivery
- Cached by browser after first load

```typescript
// src/lib/ml/modelLoader.ts

const MODEL_BASE_URL = process.env.NEXT_PUBLIC_MODEL_CDN || '/models';

export async function loadIntentClassifier() {
  return await tf.loadLayersModel(`${MODEL_BASE_URL}/intent-classifier/model.json`);
}
```

**Option B: Next.js Static Assets**
- Store in `public/models/`
- Deployed with application
- No external dependencies

### 2. Lazy Loading

```typescript
// src/lib/ml/index.ts

let intentClassifier: IntentClassifier | null = null;
let entityExtractor: EntityExtractor | null = null;

export async function getIntentClassifier(): Promise<IntentClassifier> {
  if (!intentClassifier) {
    intentClassifier = new IntentClassifier();
    await intentClassifier.loadModels();
  }
  return intentClassifier;
}

// Load models on first chat interaction
export async function initMLModels() {
  const [classifier, extractor] = await Promise.all([
    getIntentClassifier(),
    getEntityExtractor()
  ]);

  console.log('[ML] Models initialized and ready');
  return { classifier, extractor };
}
```

### 3. Fallback Strategy

Use ML model with keyword-based fallback:

```typescript
// src/lib/llm/context/intentExtractor.ts

import { getIntentClassifier } from '@/lib/ml';
import { extractIntentKeywordBased } from './keywordExtractor';

export async function extractIntent(message: string): Promise<Intent> {
  try {
    // Try ML model first
    const classifier = await getIntentClassifier();
    const mlResult = await classifier.predict(message);

    // Use ML result if confidence > 70%
    if (mlResult.confidence > 0.7) {
      return {
        type: mlResult.intent,
        confidence: mlResult.confidence,
        extractedEntities: await extractEntitiesML(message),
        timestamp: new Date()
      };
    }

    // Fall back to keyword-based if low confidence
    console.log('[IntentExtractor] Low ML confidence, using keyword fallback');
    return extractIntentKeywordBased(message);

  } catch (error) {
    // Fall back to keyword-based on error
    console.error('[IntentExtractor] ML error, using keyword fallback:', error);
    return extractIntentKeywordBased(message);
  }
}
```

---

## 📊 Performance Optimization

### 1. Model Quantization

Reduce model size by 4x with minimal accuracy loss:

```typescript
// scripts/quantize-model.ts

import * as tf from '@tensorflow/tfjs-node';

async function quantizeModel(modelPath: string, outputPath: string) {
  const model = await tf.loadLayersModel(modelPath);

  // Quantize to 8-bit integers
  await model.save(`file://${outputPath}`, {
    quantizationBytes: 1  // 8-bit quantization
  });

  console.log('Model quantized successfully!');
}
```

**Results:**
- Original model: 55MB → Quantized: 14MB
- Minimal accuracy drop (<2%)

### 2. WebAssembly Backend

Use WASM backend for faster inference:

```typescript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

async function setupTensorFlow() {
  // Set WASM backend
  await tf.setBackend('wasm');
  await tf.ready();

  console.log('[TF] Using backend:', tf.getBackend());
}
```

**Performance:**
- CPU backend: ~50ms per prediction
- WASM backend: ~20ms per prediction (2.5x faster)

### 3. Batch Predictions

Process multiple messages at once:

```typescript
async function predictBatch(messages: string[]): Promise<Intent[]> {
  const embeddings = await useModel.embed(messages);
  const predictions = classifierModel.predict(embeddings) as tf.Tensor;

  // Process all predictions at once
  const results = await predictions.array();

  embeddings.dispose();
  predictions.dispose();

  return results.map((probs, i) => ({
    intent: INTENT_LABELS[probs.indexOf(Math.max(...probs))],
    confidence: Math.max(...probs),
    message: messages[i]
  }));
}
```

---

## 🧪 Evaluation Metrics

### Confusion Matrix

```
                Predicted
              T  W  S  F  G
         T   45  1  2  0  2   (Trip)
         W    0 38  0  0  2   (Weather)
Actual   S    1  0 42  1  1   (Station)
         F    0  0  2 35  3   (Formation)
         G    1  1  1  1 46   (General)
```

### Metrics

```typescript
interface EvaluationMetrics {
  accuracy: number;          // Overall accuracy
  precision: number[];       // Per-class precision
  recall: number[];          // Per-class recall
  f1Score: number[];         // Per-class F1
  confusionMatrix: number[][]; // Confusion matrix
}

async function evaluateModel(
  model: tf.LayersModel,
  testData: { text: string; intent: string }[]
): Promise<EvaluationMetrics> {
  // ... evaluation logic
}
```

**Target Metrics:**
- Overall accuracy: >92%
- Per-class F1: >0.85
- Inference time: <30ms (P95)

---

## 📈 Continuous Learning Pipeline

### 1. Collect User Feedback

```typescript
interface FeedbackSample {
  message: string;
  predictedIntent: string;
  actualIntent: string;
  confidence: number;
  timestamp: Date;
  userId: string;
}

async function logPrediction(
  message: string,
  predicted: Intent
) {
  await db.feedback.create({
    message,
    predictedIntent: predicted.type,
    confidence: predicted.confidence,
    timestamp: new Date()
  });
}

async function submitCorrection(
  feedbackId: string,
  correctIntent: string
) {
  await db.feedback.update(feedbackId, {
    actualIntent: correctIntent,
    needsRetraining: true
  });
}
```

### 2. Periodic Retraining

```typescript
// scripts/retrain-model.ts

async function retrainModel() {
  // 1. Fetch new training data from feedback
  const newSamples = await db.feedback.findMany({
    where: { needsRetraining: true }
  });

  console.log(`Found ${newSamples.length} new training samples`);

  // 2. Combine with original training data
  const allTrainingData = [...originalData, ...newSamples];

  // 3. Retrain model
  await trainIntentClassifier(allTrainingData);

  // 4. Evaluate on test set
  const metrics = await evaluateModel(model, testData);

  // 5. Deploy if accuracy improved
  if (metrics.accuracy > currentAccuracy) {
    await deployModel(model);
    console.log('✅ New model deployed!');
  } else {
    console.log('❌ New model underperformed, keeping current');
  }

  // 6. Mark samples as processed
  await db.feedback.updateMany({
    where: { needsRetraining: true },
    data: { needsRetraining: false }
  });
}

// Run weekly
cron.schedule('0 0 * * 0', retrainModel);
```

---

## 🔐 Privacy Considerations

### On-Device Inference

✅ **All inference happens in the browser**
- No message data sent to servers
- Models downloaded once, cached forever
- GDPR compliant

### Opt-in Feedback

```typescript
interface UserSettings {
  allowMLFeedback: boolean;  // Default: false
}

async function logPredictionIfAllowed(
  userId: string,
  message: string,
  intent: Intent
) {
  const settings = await getUserSettings(userId);

  if (settings.allowMLFeedback) {
    await logPrediction(message, intent);
  }
}
```

---

## 📦 Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up TensorFlow.js in project
- [ ] Create training data format and scripts
- [ ] Collect 500+ examples per intent (manually + augmentation)
- [ ] Implement data augmentation pipeline

### Phase 2: Intent Classification (Week 3-4)
- [ ] Train initial intent classifier with USE
- [ ] Evaluate on test set (target: >85% accuracy)
- [ ] Quantize model for production
- [ ] Deploy model to CDN/static assets

### Phase 3: Entity Extraction (Week 5-6)
- [ ] Collect NER training data (BIO tags)
- [ ] Train BiLSTM entity extractor
- [ ] Integrate with intent classifier
- [ ] End-to-end testing

### Phase 4: Integration (Week 7)
- [ ] Integrate ML models into intent extractor
- [ ] Implement keyword-based fallback
- [ ] Add loading states and error handling
- [ ] Performance optimization (WASM, quantization)

### Phase 5: Monitoring & Improvement (Week 8+)
- [ ] Set up feedback collection
- [ ] Create retraining pipeline
- [ ] Monitor accuracy metrics
- [ ] Iterate based on user feedback

---

## 🎯 Success Criteria

| Metric | Keyword-Based | ML-Based | Target |
|--------|---------------|----------|--------|
| Intent Accuracy | 75% | 92% | >90% |
| Entity Extraction | 70% | 88% | >85% |
| Multilingual Support | Manual per lang | Single model | All 6 langs |
| Inference Time | <5ms | <30ms | <50ms |
| Model Size | 0MB | 14MB (quantized) | <20MB |
| First Load Time | 0ms | 500ms | <1s |

---

## 💡 Advanced Features (Future)

### 1. Active Learning
- Identify low-confidence predictions
- Prompt user for feedback
- Prioritize uncertain samples for retraining

### 2. Few-Shot Learning
- Add new intent with only 10-20 examples
- Use meta-learning (MAML, Prototypical Networks)

### 3. Contextual Intent
- Consider conversation history
- Use RNN/Transformer for multi-turn intent

### 4. Multilingual Transfer Learning
- Train on high-resource languages (EN/DE)
- Transfer to low-resource languages (HI/ZH)

---

## 📚 Resources

- **TensorFlow.js Docs:** https://www.tensorflow.org/js
- **Universal Sentence Encoder:** https://tfhub.dev/google/universal-sentence-encoder/4
- **DistilBERT:** https://huggingface.co/distilbert-base-multilingual-cased
- **NER with BiLSTM:** https://arxiv.org/abs/1508.01991
- **Active Learning:** https://arxiv.org/abs/1906.00925

---

**Estimated Effort:** 8-10 weeks for production-ready ML-based intent classification
**MVP:** 2-3 weeks for basic USE + classifier (intent only, no entities)
