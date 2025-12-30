import { extractIntent } from './intentExtractor';

console.log('\n=== Testing Failing Cases ===\n');

const tests = [
  { msg: 'Zurich to Bern', lang: 'en' as const, expect: 'trip_planning' },
  {
    msg: 'What is the weather in Lucerne?',
    lang: 'en' as const,
    expect: 'weather_check',
  },
  {
    msg: 'Wie ist das Wetter in Luzern?',
    lang: 'de' as const,
    expect: 'weather_check',
  },
  {
    msg: 'Quel temps fait-il à Lucerne?',
    lang: 'fr' as const,
    expect: 'weather_check',
  },
  {
    msg: 'Che tempo fa a Lucerna?',
    lang: 'it' as const,
    expect: 'weather_check',
  },
  { msg: 'Zürich to Genève', lang: 'en' as const, expect: 'trip_planning' },
];

(async () => {
  for (const t of tests) {
    const r = await extractIntent(t.msg, t.lang);
    const pass = r.type === t.expect;
    console.log(`${pass ? '✅' : '❌'} "${t.msg}"`);
    console.log(
      `   Expected: ${t.expect}, Got: ${r.type}, Conf: ${r.confidence.toFixed(
        2
      )}`
    );
    console.log(`   Languages: ${r.detectedLanguages?.join(', ')}`);
    console.log(`   Keywords: ${r.matchedKeywords?.slice(0, 5).join(', ')}`);
    console.log('');
  }
})();
