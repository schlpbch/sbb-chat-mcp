import { extractIntent } from './intentExtractor';

console.log('\n=== Testing FR and IT Weather ===\n');

const tests = [
  { msg: 'Quel temps fait-il à Lucerne?', lang: 'fr' as const },
  { msg: 'Che tempo fa a Lucerna?', lang: 'it' as const },
];

(async () => {
  for (const t of tests) {
    const r = await extractIntent(t.msg, t.lang);
    console.log(`Message: "${t.msg}"`);
    console.log(`  Intent: ${r.type}`);
    console.log(`  Confidence: ${r.confidence.toFixed(2)}`);
    console.log(`  Entities: ${JSON.stringify(r.extractedEntities)}`);
    console.log(`  Has origin: ${!!r.extractedEntities.origin}`);
    console.log('');
  }
})();
