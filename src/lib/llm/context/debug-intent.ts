/**
 * Debug version of validation script with detailed output
 */

import { extractIntent } from './intentExtractor';
import type { Language } from './intentKeywords';

// Run a few specific tests with detailed output
const testCases = [
  {
    desc: 'EN: Trip planning',
    msg: 'Find trains from Zurich to Bern tomorrow at 10 AM',
    lang: 'en' as Language,
    expected: 'trip_planning',
  },
  {
    desc: 'FR: Trip planning',
    msg: 'Trains de Zurich à Berne demain à 10h',
    lang: 'fr' as Language,
    expected: 'trip_planning',
  },
  {
    desc: 'IT: Trip planning',
    msg: 'Treni da Zurigo a Berna domani alle 10',
    lang: 'it' as Language,
    expected: 'trip_planning',
  },
  {
    desc: 'EN: Weather',
    msg: 'What is the weather in Lucerne?',
    lang: 'en' as Language,
    expected: 'weather_check',
  },
  {
    desc: 'DE: Weather',
    msg: 'Wie ist das Wetter in Luzern?',
    lang: 'de' as Language,
    expected: 'weather_check',
  },
  {
    desc: 'FR: Weather',
    msg: 'Quel temps fait-il à Lucerne?',
    lang: 'fr' as Language,
    expected: 'weather_check',
  },
  {
    desc: 'IT: Weather',
    msg: 'Che tempo fa a Lucerna?',
    lang: 'it' as Language,
    expected: 'weather_check',
  },
  {
    desc: 'Mixed language',
    msg: 'Züge from Zurich to Bern',
    lang: 'en' as Language,
    expected: 'trip_planning',
  },
];

console.log('\n🔍 Detailed Test Output\n');

for (const test of testCases) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Test: ${test.desc}`);
  console.log(`Message: "${test.msg}"`);
  console.log(`User Language: ${test.lang}`);
  console.log(`Expected Intent: ${test.expected}`);

  const result = extractIntent(test.msg, test.lang);

  console.log(`\nResult:`);
  console.log(
    `  Intent: ${result.type} ${result.type === test.expected ? '✅' : '❌'}`
  );
  console.log(`  Confidence: ${result.confidence.toFixed(2)}`);
  console.log(`  Detected Languages: ${result.detectedLanguages?.join(', ')}`);
  console.log(
    `  Matched Keywords: ${result.matchedKeywords?.slice(0, 3).join(', ')}`
  );
  console.log(
    `  Entities: ${JSON.stringify(result.extractedEntities, null, 2)}`
  );
}

console.log(`\n${'='.repeat(80)}\n`);
