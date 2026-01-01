import { extractIntent } from './src/lib/llm/context/intentExtractor.js';

async function test() {
  console.log('Testing fixes...\n');

  // Test 1: Origin extraction
  console.log('Test 1: "Geneva to Lausanne at 14:30"');
  const result1 = await extractIntent('Geneva to Lausanne at 14:30', 'en');
  console.log('  Origin:', result1.extractedEntities.origin);
  console.log('  Destination:', result1.extractedEntities.destination);
  console.log('  Time:', result1.extractedEntities.time);
  console.log('');

  // Test 2: Date extraction
  console.log('Test 2: "Trains next Monday"');
  const result2 = await extractIntent('Trains next Monday', 'en');
  console.log('  Date:', result2.extractedEntities.date);
  console.log('');

  // Test 3: Time with meridiem
  console.log('Test 3: "Trains at 2:30 pm"');
  const result3 = await extractIntent('Trains at 2:30 pm', 'en');
  console.log('  Time:', result3.extractedEntities.time);
  console.log('');
}

test();
