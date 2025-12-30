import { extractIntent } from './intentExtractor';

// Test the specific failing cases
console.log('\n=== Testing Specific Cases ===\n');

const tests = [
  {
    msg: 'Find trains from Zurich to Bern tomorrow at 10 AM',
    lang: 'en' as const,
    expect: 'trip_planning',
  },
  {
    msg: 'What is the weather in Lucerne?',
    lang: 'en' as const,
    expect: 'weather_check',
  },
  {
    msg: 'Züge from Zurich to Bern',
    lang: 'en' as const,
    expect: 'trip_planning',
  },
];

for (const t of tests) {
  const r = extractIntent(t.msg, t.lang);
  const pass = r.type === t.expect;
  console.log(`${pass ? '✅' : '❌'} "${t.msg.substring(0, 40)}..."`);
  console.log(
    `   Expected: ${t.expect}, Got: ${r.type}, Conf: ${r.confidence.toFixed(2)}`
  );
  if (!pass) {
    console.log(`   Keywords: ${r.matchedKeywords?.join(', ')}`);
    console.log(`   Entities: ${JSON.stringify(r.extractedEntities)}`);
  }
  console.log('');
}
