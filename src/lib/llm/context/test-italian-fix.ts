import { extractIntent } from './intentExtractor';

// Test the specific failing Italian station search query
const testQuery = 'Dove si trova la stazione di Lugano?';
const userLanguage = 'it';

console.log('Testing Italian Station Search Fix');
console.log('===================================\n');
console.log(`Query: "${testQuery}"`);
console.log(`User Language: ${userLanguage}\n`);

(async () => {
  const result = await extractIntent(testQuery, userLanguage);

  console.log('Result:');
  console.log(JSON.stringify(result, null, 2));

  // Verify the fix
  const expectedIntent = 'station_search';
  const expectedEntity = 'Lugano';

  console.log('\n✅ Verification:');
  console.log(
    `Intent Type: ${
      result.type === expectedIntent ? '✅ PASS' : '❌ FAIL'
    } (expected: ${expectedIntent}, got: ${result.type})`
  );
  console.log(
    `Station Entity: ${
      result.extractedEntities.station === expectedEntity
        ? '✅ PASS'
        : '❌ FAIL'
    } (expected: ${expectedEntity}, got: ${result.extractedEntities.station})`
  );
  console.log(
    `Confidence: ${
      result.confidence >= 0.6 ? '✅ PASS' : '❌ FAIL'
    } (${result.confidence.toFixed(2)})`
  );

  if (
    result.type === expectedIntent &&
    result.extractedEntities.station === expectedEntity
  ) {
    console.log('\n🎉 Italian station search fix SUCCESSFUL!');
    process.exit(0);
  } else {
    console.log('\n❌ Fix did not work as expected');
    process.exit(1);
  }
})();
