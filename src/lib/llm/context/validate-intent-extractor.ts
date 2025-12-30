/**
 * Manual Validation Script for Intent Extractor
 *
 * Run with: npx tsx src/lib/llm/context/validate-intent-extractor.ts
 */

import { extractIntent } from './intentExtractor';
import type { Language } from './intentKeywords';

interface TestCase {
  description: string;
  message: string;
  language?: Language;
  expectedIntent: string;
  expectedEntities?: string[];
}

const testCases: TestCase[] = [
  // ==================== TRIP PLANNING ====================
  {
    description: 'EN: Trip planning with full details',
    message: 'Find trains from Zurich to Bern tomorrow at 10 AM',
    language: 'en',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination', 'date', 'time'],
  },
  {
    description: 'DE: Trip planning with full details',
    message: 'Züge von Zürich nach Bern morgen um 10 Uhr',
    language: 'de',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination', 'date', 'time'],
  },
  {
    description: 'FR: Trip planning with full details',
    message: 'Trains de Zurich à Berne demain à 10h',
    language: 'fr',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination', 'date'],
  },
  {
    description: 'IT: Trip planning with full details',
    message: 'Treni da Zurigo a Berna domani alle 10',
    language: 'it',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination', 'date'],
  },
  {
    description: 'EN: Simple trip query',
    message: 'Zurich to Bern',
    language: 'en',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination'],
  },

  // ==================== WEATHER CHECK ====================
  {
    description: 'EN: Weather check',
    message: 'What is the weather in Lucerne?',
    language: 'en',
    expectedIntent: 'weather_check',
    expectedEntities: ['origin'],
  },
  {
    description: 'DE: Weather check',
    message: 'Wie ist das Wetter in Luzern?',
    language: 'de',
    expectedIntent: 'weather_check',
    expectedEntities: ['origin'],
  },
  {
    description: 'FR: Weather check',
    message: 'Quel temps fait-il à Lucerne?',
    language: 'fr',
    expectedIntent: 'weather_check',
    expectedEntities: ['origin'],
  },
  {
    description: 'IT: Weather check',
    message: 'Che tempo fa a Lucerna?',
    language: 'it',
    expectedIntent: 'weather_check',
    expectedEntities: ['origin'],
  },

  // ==================== STATION SEARCH ====================
  {
    description: 'EN: Station departures',
    message: 'Show me departures from Geneva station',
    language: 'en',
    expectedIntent: 'station_search',
    expectedEntities: ['origin', 'eventType'],
  },
  {
    description: 'DE: Station departures',
    message: 'Zeig mir Abfahrten vom Bahnhof Genf',
    language: 'de',
    expectedIntent: 'station_search',
    expectedEntities: ['eventType'],
  },
  {
    description: 'FR: Station departures',
    message: 'Affiche les départs de la gare de Genève',
    language: 'fr',
    expectedIntent: 'station_search',
    expectedEntities: ['eventType'],
  },
  {
    description: 'IT: Station departures',
    message: 'Mostra le partenze dalla stazione di Ginevra',
    language: 'it',
    expectedIntent: 'station_search',
    expectedEntities: ['eventType'],
  },

  // ==================== TRAIN FORMATION ====================
  {
    description: 'EN: Train formation',
    message: 'What is the train formation for IC 815?',
    language: 'en',
    expectedIntent: 'train_formation',
  },
  {
    description: 'DE: Train formation',
    message: 'Wie ist die Zugformation für IC 815?',
    language: 'de',
    expectedIntent: 'train_formation',
  },
  {
    description: 'FR: Train formation',
    message: 'Quelle est la composition du train IC 815?',
    language: 'fr',
    expectedIntent: 'train_formation',
  },
  {
    description: 'IT: Train formation',
    message: 'Qual è la formazione del treno IC 815?',
    language: 'it',
    expectedIntent: 'train_formation',
  },

  // ==================== EDGE CASES ====================
  {
    description: 'Mixed language (DE + EN)',
    message: 'Züge from Zurich to Bern',
    language: 'en',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination'],
  },
  {
    description: 'Diacritics in place names',
    message: 'Zürich to Genève',
    language: 'en',
    expectedIntent: 'trip_planning',
    expectedEntities: ['origin', 'destination'],
  },
  {
    description: 'Station priority over trip',
    message: 'Show me the train station in Zurich',
    language: 'en',
    expectedIntent: 'station_search',
  },
];

function runValidation() {
  console.log('\n🧪 Intent Extractor Validation\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    const result = extractIntent(testCase.message, testCase.language);

    const intentMatch = result.type === testCase.expectedIntent;
    const confidenceOk = result.confidence >= 0.3;

    let entitiesMatch = true;
    if (testCase.expectedEntities) {
      entitiesMatch = testCase.expectedEntities.every(
        (entity) => result.extractedEntities[entity] !== undefined
      );
    }

    const success = intentMatch && confidenceOk && entitiesMatch;

    if (success) {
      passed++;
      console.log(`✅ ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ ${testCase.description}`);
      failures.push(testCase.description);

      if (!intentMatch) {
        console.log(
          `   Expected intent: ${testCase.expectedIntent}, Got: ${result.type}`
        );
      }
      if (!confidenceOk) {
        console.log(`   Low confidence: ${result.confidence}`);
      }
      if (!entitiesMatch) {
        console.log(
          `   Expected entities: ${testCase.expectedEntities?.join(', ')}`
        );
        console.log(
          `   Got entities: ${Object.keys(result.extractedEntities).join(', ')}`
        );
      }
    }

    // Show details for first few tests
    if (passed + failed <= 5) {
      console.log(
        `   Intent: ${result.type}, Confidence: ${result.confidence.toFixed(2)}`
      );
      console.log(`   Languages: ${result.detectedLanguages?.join(', ')}`);
      console.log(`   Entities: ${JSON.stringify(result.extractedEntities)}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(
    `\n📊 Results: ${passed}/${testCases.length} passed (${(
      (passed / testCases.length) *
      100
    ).toFixed(1)}%)`
  );

  if (failed > 0) {
    console.log(`\n❌ Failed tests:`);
    failures.forEach((f) => console.log(`   - ${f}`));
  } else {
    console.log('\n✅ All tests passed!');
  }

  console.log('\n');

  return { passed, failed, total: testCases.length };
}

// Run validation
const results = runValidation();
process.exit(results.failed > 0 ? 1 : 0);
