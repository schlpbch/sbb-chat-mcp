/**
 * Intent Extraction Benchmark Script
 *
 * Measures accuracy, precision, recall, and F1 score of the current
 * rule-based intent extraction system.
 *
 * Usage:
 *   npx tsx scripts/benchmark-intent-extraction.ts
 */

import { extractIntent } from '../src/lib/llm/context/intentExtractor';
import type { Intent } from '../src/lib/llm/context/types';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TestCase {
  text: string;
  expectedIntent: Intent['type'];
  expectedEntities?: {
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
    eventType?: 'arrivals' | 'departures';
  };
  language?: 'en' | 'de' | 'fr' | 'it';
  notes?: string;
}

interface BenchmarkResults {
  totalCases: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  perIntentMetrics: Record<string, IntentMetrics>;
  confusionMatrix: Record<string, Record<string, number>>;
  averagePrecision: number;
  averageRecall: number;
  averageF1: number;
  timestamp: string;
  failedCases: FailedCase[];
}

interface IntentMetrics {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface FailedCase {
  text: string;
  expected: string;
  predicted: string;
  confidence: number;
  notes?: string;
}

// Test cases dataset
const TEST_CASES: TestCase[] = [
  // ============ Trip Planning ============
  {
    text: 'Find trains from Zurich to Bern',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern' },
    language: 'en',
  },
  {
    text: 'How do I get to Geneva?',
    expectedIntent: 'trip_planning',
    expectedEntities: { destination: 'Geneva' },
    language: 'en',
  },
  {
    text: 'I need to travel tomorrow morning',
    expectedIntent: 'trip_planning',
    expectedEntities: { date: 'tomorrow', time: 'morning' },
    language: 'en',
  },
  {
    text: 'Zurich to Bern at 14:30',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern', time: '14:30' },
    language: 'en',
  },
  {
    text: 'Trains from Lausanne',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Lausanne' },
    language: 'en',
  },
  {
    text: 'Züge von Zürich nach Bern',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zürich', destination: 'Bern' },
    language: 'de',
  },
  {
    text: 'Wie komme ich nach Basel?',
    expectedIntent: 'trip_planning',
    expectedEntities: { destination: 'Basel' },
    language: 'de',
  },
  {
    text: 'Trains de Zurich à Berne',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Berne' },
    language: 'fr',
  },
  {
    text: 'Comment aller à Genève?',
    expectedIntent: 'trip_planning',
    expectedEntities: { destination: 'Genève' },
    language: 'fr',
  },
  {
    text: 'Treni da Zurigo a Berna',
    expectedIntent: 'trip_planning',
    expectedEntities: { origin: 'Zurigo', destination: 'Berna' },
    language: 'it',
  },

  // ============ Weather Check ============
  {
    text: "What's the weather in Zurich?",
    expectedIntent: 'weather_check',
    expectedEntities: { origin: 'Zurich' },
    language: 'en',
  },
  {
    text: 'Will it rain tomorrow?',
    expectedIntent: 'weather_check',
    expectedEntities: { date: 'tomorrow' },
    language: 'en',
  },
  {
    text: 'Temperature in Bern',
    expectedIntent: 'weather_check',
    expectedEntities: { origin: 'Bern' },
    language: 'en',
  },
  {
    text: 'Wie ist das Wetter in Luzern?',
    expectedIntent: 'weather_check',
    expectedEntities: { origin: 'Luzern' },
    language: 'de',
  },
  {
    text: 'Quel temps fait-il à Genève?',
    expectedIntent: 'weather_check',
    expectedEntities: { origin: 'Genève' },
    language: 'fr',
  },
  {
    text: 'Che tempo fa a Lugano?',
    expectedIntent: 'weather_check',
    expectedEntities: { origin: 'Lugano' },
    language: 'it',
  },

  // ============ Snow Conditions ============
  {
    text: 'Snow conditions in Interlaken',
    expectedIntent: 'snow_conditions',
    expectedEntities: { origin: 'Interlaken' },
    language: 'en',
  },
  {
    text: 'Is it snowing in Zermatt?',
    expectedIntent: 'snow_conditions',
    expectedEntities: { origin: 'Zermatt' },
    language: 'en',
  },
  {
    text: 'Ski conditions at Davos',
    expectedIntent: 'snow_conditions',
    expectedEntities: { origin: 'Davos' },
    language: 'en',
  },
  {
    text: 'Schneebedingungen in St. Moritz',
    expectedIntent: 'snow_conditions',
    expectedEntities: { origin: 'St. Moritz' },
    language: 'de',
  },

  // ============ Station Search ============
  {
    text: 'Show departures from Bern',
    expectedIntent: 'station_search',
    expectedEntities: { origin: 'Bern', eventType: 'departures' },
    language: 'en',
  },
  {
    text: 'Arrivals at Zurich HB',
    expectedIntent: 'station_search',
    expectedEntities: { origin: 'Zurich HB', eventType: 'arrivals' },
    language: 'en',
  },
  {
    text: 'What platform for the train to Basel?',
    expectedIntent: 'station_search',
    expectedEntities: { destination: 'Basel' },
    language: 'en',
  },
  {
    text: 'Abfahrten vom Bahnhof Zürich',
    expectedIntent: 'station_search',
    expectedEntities: { origin: 'Zürich', eventType: 'departures' },
    language: 'de',
  },

  // ============ Train Formation ============
  {
    text: 'Where is coach 7?',
    expectedIntent: 'train_formation',
    language: 'en',
  },
  {
    text: 'Train composition for IC 815',
    expectedIntent: 'train_formation',
    language: 'en',
  },
  {
    text: 'Wo ist der Speisewagen?',
    expectedIntent: 'train_formation',
    language: 'de',
  },
  {
    text: 'Où est le wagon-restaurant?',
    expectedIntent: 'train_formation',
    language: 'fr',
  },

  // ============ General Info ============
  {
    text: 'Hello',
    expectedIntent: 'general_info',
    language: 'en',
  },
  {
    text: 'What can you do?',
    expectedIntent: 'general_info',
    language: 'en',
  },
  {
    text: 'Help me',
    expectedIntent: 'general_info',
    language: 'en',
  },
  {
    text: 'Danke',
    expectedIntent: 'general_info',
    language: 'de',
  },

  // ============ Edge Cases ============
  {
    text: 'Zurich',
    expectedIntent: 'general_info',
    notes: 'Single word - ambiguous',
    language: 'en',
  },
  {
    text: 'Train',
    expectedIntent: 'general_info',
    notes: 'Single keyword - not enough context',
    language: 'en',
  },
  {
    text: 'I want to go',
    expectedIntent: 'trip_planning',
    notes: 'Implicit trip intent',
    language: 'en',
  },
  {
    text: 'Train station in Bern',
    expectedIntent: 'station_search',
    notes: 'Should be station, not trip (priority test)',
    expectedEntities: { origin: 'Bern' },
    language: 'en',
  },
];

/**
 * Calculate metrics for a specific intent
 */
function calculateIntentMetrics(
  truePositives: number,
  falsePositives: number,
  falseNegatives: number
): IntentMetrics {
  const precision =
    truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;

  const recall =
    truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;

  const f1Score =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1Score,
  };
}

/**
 * Run benchmark
 */
async function runBenchmark(): Promise<BenchmarkResults> {
  console.log('🚀 Starting Intent Extraction Benchmark\n');
  console.log(`Total test cases: ${TEST_CASES.length}\n`);

  const intentTypes = [
    'trip_planning',
    'weather_check',
    'snow_conditions',
    'station_search',
    'train_formation',
    'general_info',
  ];

  // Initialize metrics
  const confusionMatrix: Record<string, Record<string, number>> = {};
  const intentCounts: Record<
    string,
    { tp: number; fp: number; fn: number }
  > = {};

  intentTypes.forEach((intent) => {
    confusionMatrix[intent] = {};
    intentTypes.forEach((predicted) => {
      confusionMatrix[intent][predicted] = 0;
    });
    intentCounts[intent] = { tp: 0, fp: 0, fn: 0 };
  });

  let correct = 0;
  let incorrect = 0;
  const failedCases: FailedCase[] = [];

  // Run tests
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const result = await extractIntent(testCase.text, testCase.language);

    const predicted = result.type;
    const expected = testCase.expectedIntent;

    // Update confusion matrix
    confusionMatrix[expected][predicted]++;

    // Check if correct
    if (predicted === expected) {
      correct++;
      intentCounts[expected].tp++;
    } else {
      incorrect++;
      intentCounts[expected].fn++;
      intentCounts[predicted].fp++;

      failedCases.push({
        text: testCase.text,
        expected,
        predicted,
        confidence: result.confidence,
        notes: testCase.notes,
      });
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`Processed ${i + 1}/${TEST_CASES.length} test cases...`);
    }
  }

  console.log('✅ All test cases processed\n');

  // Calculate per-intent metrics
  const perIntentMetrics: Record<string, IntentMetrics> = {};
  intentTypes.forEach((intent) => {
    const { tp, fp, fn } = intentCounts[intent];
    perIntentMetrics[intent] = calculateIntentMetrics(tp, fp, fn);
  });

  // Calculate averages
  const totalTP = Object.values(intentCounts).reduce((sum, c) => sum + c.tp, 0);
  const totalFP = Object.values(intentCounts).reduce((sum, c) => sum + c.fp, 0);
  const totalFN = Object.values(intentCounts).reduce((sum, c) => sum + c.fn, 0);

  const microPrecision = totalTP / (totalTP + totalFP);
  const microRecall = totalTP / (totalTP + totalFN);
  const microF1 =
    (2 * microPrecision * microRecall) / (microPrecision + microRecall);

  const macroPrecision =
    Object.values(perIntentMetrics).reduce((sum, m) => sum + m.precision, 0) /
    intentTypes.length;
  const macroRecall =
    Object.values(perIntentMetrics).reduce((sum, m) => sum + m.recall, 0) /
    intentTypes.length;
  const macroF1 =
    Object.values(perIntentMetrics).reduce((sum, m) => sum + m.f1Score, 0) /
    intentTypes.length;

  return {
    totalCases: TEST_CASES.length,
    correct,
    incorrect,
    accuracy: correct / TEST_CASES.length,
    perIntentMetrics,
    confusionMatrix,
    averagePrecision: macroPrecision,
    averageRecall: macroRecall,
    averageF1: macroF1,
    timestamp: new Date().toISOString(),
    failedCases,
  };
}

/**
 * Print results
 */
function printResults(results: BenchmarkResults): void {
  console.log('=' .repeat(80));
  console.log('📊 BENCHMARK RESULTS');
  console.log('='.repeat(80));
  console.log('');

  // Overall accuracy
  console.log('Overall Metrics:');
  console.log(`  Accuracy:  ${(results.accuracy * 100).toFixed(2)}%`);
  console.log(`  Precision: ${(results.averagePrecision * 100).toFixed(2)}%`);
  console.log(`  Recall:    ${(results.averageRecall * 100).toFixed(2)}%`);
  console.log(`  F1 Score:  ${(results.averageF1 * 100).toFixed(2)}%`);
  console.log(`  Correct:   ${results.correct}/${results.totalCases}`);
  console.log(`  Incorrect: ${results.incorrect}/${results.totalCases}`);
  console.log('');

  // Per-intent metrics
  console.log('Per-Intent Metrics:');
  console.log('-'.repeat(80));
  console.log(
    'Intent              | Precision | Recall | F1 Score | TP | FP | FN'
  );
  console.log('-'.repeat(80));

  Object.entries(results.perIntentMetrics).forEach(([intent, metrics]) => {
    console.log(
      `${intent.padEnd(19)} | ` +
        `${(metrics.precision * 100).toFixed(1).padStart(9)} | ` +
        `${(metrics.recall * 100).toFixed(1).padStart(6)} | ` +
        `${(metrics.f1Score * 100).toFixed(1).padStart(8)} | ` +
        `${metrics.truePositives.toString().padStart(2)} | ` +
        `${metrics.falsePositives.toString().padStart(2)} | ` +
        `${metrics.falseNegatives.toString().padStart(2)}`
    );
  });
  console.log('-'.repeat(80));
  console.log('');

  // Confusion matrix
  console.log('Confusion Matrix:');
  console.log('-'.repeat(80));

  const intentLabels = Object.keys(results.confusionMatrix);
  const shortLabels = intentLabels.map((label) => {
    const parts = label.split('_');
    return parts.map((p) => p[0].toUpperCase()).join('');
  });

  console.log('Predicted →');
  console.log('Actual ↓    | ' + shortLabels.join(' | '));
  console.log('-'.repeat(80));

  intentLabels.forEach((actual, i) => {
    const row = intentLabels.map(
      (predicted) =>
        results.confusionMatrix[actual][predicted].toString().padStart(2)
    );
    console.log(`${shortLabels[i]} (${actual.padEnd(15)}) | ${row.join(' | ')}`);
  });

  console.log('');
  console.log('Legend:');
  shortLabels.forEach((short, i) => {
    console.log(`  ${short} = ${intentLabels[i]}`);
  });
  console.log('');

  // Failed cases
  if (results.failedCases.length > 0) {
    console.log('❌ Failed Cases:');
    console.log('-'.repeat(80));

    results.failedCases.forEach((fail, i) => {
      console.log(`\n${i + 1}. "${fail.text}"`);
      console.log(`   Expected:  ${fail.expected}`);
      console.log(`   Predicted: ${fail.predicted} (confidence: ${fail.confidence.toFixed(2)})`);
      if (fail.notes) {
        console.log(`   Notes:     ${fail.notes}`);
      }
    });
    console.log('');
  } else {
    console.log('✅ All test cases passed!\n');
  }

  console.log('='.repeat(80));
}

/**
 * Save results to file
 */
function saveResults(results: BenchmarkResults): void {
  const outputPath = join(process.cwd(), 'benchmark-results.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${outputPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await runBenchmark();
    printResults(results);
    saveResults(results);

    // Exit code based on accuracy threshold
    const accuracyThreshold = 0.75; // 75%
    if (results.accuracy < accuracyThreshold) {
      console.log(
        `⚠️  Accuracy (${(results.accuracy * 100).toFixed(2)}%) is below threshold (${accuracyThreshold * 100}%)\n`
      );
      process.exit(1);
    } else {
      console.log('🎉 Benchmark passed!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

main();
