/**
 * Entity Extraction Benchmark Script
 *
 * Measures accuracy of entity extraction (origin, destination, date, time)
 *
 * Usage:
 *   npx tsx scripts/benchmark-entity-extraction.ts
 */

import { extractIntent } from '../src/lib/llm/context/intentExtractor';
import type { Intent } from '../src/lib/llm/context/types';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface EntityTestCase {
  text: string;
  intent: Intent['type'];
  expectedEntities: {
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
    eventType?: 'arrivals' | 'departures';
  };
  language?: 'en' | 'de' | 'fr' | 'it';
  notes?: string;
}

interface EntityBenchmarkResults {
  totalCases: number;
  entityMetrics: {
    origin: EntityMetric;
    destination: EntityMetric;
    date: EntityMetric;
    time: EntityMetric;
    eventType: EntityMetric;
  };
  overallAccuracy: number;
  timestamp: string;
  failedExtractions: FailedExtraction[];
}

interface EntityMetric {
  total: number;
  correct: number;
  incorrect: number;
  missing: number;
  accuracy: number;
}

interface FailedExtraction {
  text: string;
  entity: string;
  expected: string;
  actual: string | undefined;
  notes?: string;
}

// Test cases dataset
const TEST_CASES: EntityTestCase[] = [
  // ============ Origin + Destination ============
  {
    text: 'Find trains from Zurich to Bern',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern' },
    language: 'en',
  },
  {
    text: 'Züge von Zürich nach Bern',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zürich', destination: 'Bern' },
    language: 'de',
  },
  {
    text: 'Trains de Zurich à Berne',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Berne' },
    language: 'fr',
  },
  {
    text: 'Treni da Zurigo a Berna',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurigo', destination: 'Berna' },
    language: 'it',
  },

  // ============ Implicit Origin (X to Y) ============
  {
    text: 'Zurich to Bern',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern' },
    language: 'en',
    notes: 'Implicit origin pattern',
  },
  {
    text: 'Geneva to Lausanne at 14:30',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Geneva', destination: 'Lausanne', time: '14:30' },
    language: 'en',
  },

  // ============ Only Origin ============
  {
    text: 'Trains from Lausanne',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Lausanne' },
    language: 'en',
  },
  {
    text: 'Departures from Bern',
    intent: 'station_search',
    expectedEntities: { origin: 'Bern', eventType: 'departures' },
    language: 'en',
  },

  // ============ Only Destination ============
  {
    text: 'How do I get to Geneva?',
    intent: 'trip_planning',
    expectedEntities: { destination: 'Geneva' },
    language: 'en',
  },
  {
    text: 'Going to Basel',
    intent: 'trip_planning',
    expectedEntities: { destination: 'Basel' },
    language: 'en',
  },

  // ============ Weather Locations ============
  {
    text: "What's the weather in Zurich?",
    intent: 'weather_check',
    expectedEntities: { origin: 'Zurich' },
    language: 'en',
    notes: 'Weather should use location as origin',
  },
  {
    text: 'Wie ist das Wetter in Luzern?',
    intent: 'weather_check',
    expectedEntities: { origin: 'Luzern' },
    language: 'de',
  },

  // ============ Date Extraction ============
  {
    text: 'Zurich to Bern tomorrow',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern', date: 'tomorrow' },
    language: 'en',
  },
  {
    text: 'Trains today',
    intent: 'trip_planning',
    expectedEntities: { date: 'today' },
    language: 'en',
  },
  {
    text: 'Züge morgen',
    intent: 'trip_planning',
    expectedEntities: { date: 'morgen' },
    language: 'de',
  },
  {
    text: 'Trains next Monday',
    intent: 'trip_planning',
    expectedEntities: { date: 'next Monday' },
    language: 'en',
  },

  // ============ Time Extraction ============
  {
    text: 'Zurich to Bern at 14:30',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Zurich', destination: 'Bern', time: '14:30' },
    language: 'en',
  },
  {
    text: 'Trains at 2:30 pm',
    intent: 'trip_planning',
    expectedEntities: { time: '2:30 pm' },
    language: 'en',
  },
  {
    text: 'Züge um 14:30 Uhr',
    intent: 'trip_planning',
    expectedEntities: { time: '14:30' },
    language: 'de',
  },
  {
    text: 'Trains in the morning',
    intent: 'trip_planning',
    expectedEntities: { time: 'morning' },
    language: 'en',
  },

  // ============ Event Type (Station) ============
  {
    text: 'Arrivals at Zurich HB',
    intent: 'station_search',
    expectedEntities: { origin: 'Zurich HB', eventType: 'arrivals' },
    language: 'en',
  },
  {
    text: 'Departures from Bern',
    intent: 'station_search',
    expectedEntities: { origin: 'Bern', eventType: 'departures' },
    language: 'en',
  },

  // ============ Complex Cases ============
  {
    text: 'From Zurich to Bern tomorrow at 14:30',
    intent: 'trip_planning',
    expectedEntities: {
      origin: 'Zurich',
      destination: 'Bern',
      date: 'tomorrow',
      time: '14:30',
    },
    language: 'en',
  },

  // ============ Edge Cases ============
  {
    text: 'St. Gallen to Zurich',
    intent: 'trip_planning',
    expectedEntities: { origin: 'St. Gallen', destination: 'Zurich' },
    language: 'en',
    notes: 'Compound name with period',
  },
  {
    text: 'Bad Ragaz to Chur',
    intent: 'trip_planning',
    expectedEntities: { origin: 'Bad Ragaz', destination: 'Chur' },
    language: 'en',
    notes: 'Two-word city name',
  },
];

/**
 * Check if entity matches expected value
 */
function entityMatches(
  actual: string | undefined,
  expected: string | undefined
): boolean {
  if (!expected) return true; // No expectation
  if (!actual) return false; // Expected but not extracted

  // Normalize for comparison (lowercase, trim)
  const normalizedA = actual.toLowerCase().trim();
  const normalizedE = expected.toLowerCase().trim();

  return normalizedA === normalizedE;
}

/**
 * Run benchmark
 */
async function runBenchmark(): Promise<EntityBenchmarkResults> {
  console.log('🚀 Starting Entity Extraction Benchmark\n');
  console.log(`Total test cases: ${TEST_CASES.length}\n`);

  const entityMetrics: Record<string, EntityMetric> = {
    origin: { total: 0, correct: 0, incorrect: 0, missing: 0, accuracy: 0 },
    destination: { total: 0, correct: 0, incorrect: 0, missing: 0, accuracy: 0 },
    date: { total: 0, correct: 0, incorrect: 0, missing: 0, accuracy: 0 },
    time: { total: 0, correct: 0, incorrect: 0, missing: 0, accuracy: 0 },
    eventType: { total: 0, correct: 0, incorrect: 0, missing: 0, accuracy: 0 },
  };

  const failedExtractions: FailedExtraction[] = [];
  let totalEntities = 0;
  let correctEntities = 0;

  // Run tests
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const result = await extractIntent(testCase.text, testCase.language);

    const entities = result.extractedEntities;

    // Check each entity type
    const entityTypes: Array<keyof typeof testCase.expectedEntities> = [
      'origin',
      'destination',
      'date',
      'time',
      'eventType',
    ];

    entityTypes.forEach((entityType) => {
      const expected = testCase.expectedEntities[entityType];

      if (expected !== undefined) {
        entityMetrics[entityType].total++;
        totalEntities++;

        const actual = entities[entityType] as string | undefined;

        if (entityMatches(actual, expected)) {
          entityMetrics[entityType].correct++;
          correctEntities++;
        } else if (!actual) {
          entityMetrics[entityType].missing++;
          failedExtractions.push({
            text: testCase.text,
            entity: entityType,
            expected,
            actual,
            notes: `Missing ${entityType}`,
          });
        } else {
          entityMetrics[entityType].incorrect++;
          failedExtractions.push({
            text: testCase.text,
            entity: entityType,
            expected,
            actual,
            notes: testCase.notes,
          });
        }
      }
    });

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`Processed ${i + 1}/${TEST_CASES.length} test cases...`);
    }
  }

  console.log('✅ All test cases processed\n');

  // Calculate accuracies
  Object.values(entityMetrics).forEach((metric) => {
    if (metric.total > 0) {
      metric.accuracy = metric.correct / metric.total;
    }
  });

  const overallAccuracy = totalEntities > 0 ? correctEntities / totalEntities : 0;

  return {
    totalCases: TEST_CASES.length,
    entityMetrics: entityMetrics as any,
    overallAccuracy,
    timestamp: new Date().toISOString(),
    failedExtractions,
  };
}

/**
 * Print results
 */
function printResults(results: EntityBenchmarkResults): void {
  console.log('='.repeat(80));
  console.log('📊 ENTITY EXTRACTION BENCHMARK RESULTS');
  console.log('='.repeat(80));
  console.log('');

  // Overall accuracy
  console.log(
    `Overall Entity Accuracy: ${(results.overallAccuracy * 100).toFixed(2)}%\n`
  );

  // Per-entity metrics
  console.log('Per-Entity Metrics:');
  console.log('-'.repeat(80));
  console.log(
    'Entity       | Total | Correct | Incorrect | Missing | Accuracy'
  );
  console.log('-'.repeat(80));

  Object.entries(results.entityMetrics).forEach(([entity, metrics]) => {
    console.log(
      `${entity.padEnd(12)} | ` +
        `${metrics.total.toString().padStart(5)} | ` +
        `${metrics.correct.toString().padStart(7)} | ` +
        `${metrics.incorrect.toString().padStart(9)} | ` +
        `${metrics.missing.toString().padStart(7)} | ` +
        `${(metrics.accuracy * 100).toFixed(1)}%`
    );
  });
  console.log('-'.repeat(80));
  console.log('');

  // Failed extractions
  if (results.failedExtractions.length > 0) {
    console.log('❌ Failed Extractions:');
    console.log('-'.repeat(80));

    results.failedExtractions.slice(0, 20).forEach((fail, i) => {
      console.log(`\n${i + 1}. "${fail.text}"`);
      console.log(`   Entity:   ${fail.entity}`);
      console.log(`   Expected: "${fail.expected}"`);
      console.log(`   Actual:   "${fail.actual || 'MISSING'}"`);
      if (fail.notes) {
        console.log(`   Notes:    ${fail.notes}`);
      }
    });

    if (results.failedExtractions.length > 20) {
      console.log(
        `\n... and ${results.failedExtractions.length - 20} more failures`
      );
    }
    console.log('');
  } else {
    console.log('✅ All entities extracted correctly!\n');
  }

  console.log('='.repeat(80));
}

/**
 * Save results to file
 */
function saveResults(results: EntityBenchmarkResults): void {
  const outputPath = join(process.cwd(), 'entity-benchmark-results.json');
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
    const accuracyThreshold = 0.7; // 70%
    if (results.overallAccuracy < accuracyThreshold) {
      console.log(
        `⚠️  Accuracy (${(results.overallAccuracy * 100).toFixed(2)}%) is below threshold (${accuracyThreshold * 100}%)\n`
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
