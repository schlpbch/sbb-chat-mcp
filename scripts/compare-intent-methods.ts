/**
 * Compare Intent Extraction Methods
 *
 * Compares rule-based vs LLM-based intent extraction on test cases.
 *
 * Usage:
 *   GOOGLE_CLOUD_KEY=your_key npx tsx scripts/compare-intent-methods.ts
 */

import { extractIntent as extractIntentRules } from '../src/lib/llm/context/intentExtractor';
import { extractIntentWithLLM } from '../src/lib/llm/context/llmIntentExtractor';
import type { Intent } from '../src/lib/llm/context/types';

interface TestCase {
  text: string;
  expectedIntent: Intent['type'];
  language?: 'en' | 'de' | 'fr' | 'it';
  notes?: string;
}

const TEST_CASES: TestCase[] = [
  // Clear cases (both should get right)
  {
    text: 'Find trains from Zurich to Bern',
    expectedIntent: 'trip_planning',
    language: 'en',
  },
  {
    text: "What's the weather in Zurich?",
    expectedIntent: 'weather_check',
    language: 'en',
  },
  {
    text: 'Show departures from Bern',
    expectedIntent: 'station_search',
    language: 'en',
  },

  // Edge cases (LLM should do better)
  {
    text: 'I want to commute to Bern',
    expectedIntent: 'trip_planning',
    notes: '"commute" not in keywords',
    language: 'en',
  },
  {
    text: 'How do I reach Geneva?',
    expectedIntent: 'trip_planning',
    notes: '"reach" not in keywords',
    language: 'en',
  },
  {
    text: "What's the climate like in Zurich?",
    expectedIntent: 'weather_check',
    notes: '"climate" might not be in weather keywords',
    language: 'en',
  },
  {
    text: 'Train station in Bern',
    expectedIntent: 'station_search',
    notes: 'Should be station, not trip (priority test)',
    language: 'en',
  },
  {
    text: 'Is there fresh powder in Davos?',
    expectedIntent: 'snow_conditions',
    notes: '"powder" = snow (ski slang)',
    language: 'en',
  },

  // Ambiguous cases
  {
    text: 'Zurich',
    expectedIntent: 'general_info',
    notes: 'Single word - ambiguous',
    language: 'en',
  },
  {
    text: 'I want to go',
    expectedIntent: 'trip_planning',
    notes: 'Implicit trip intent',
    language: 'en',
  },
];

interface ComparisonResult {
  testCase: TestCase;
  rulesBased: {
    intent: string;
    confidence: number;
    correct: boolean;
    time: number;
  };
  llmBased: {
    intent: string;
    confidence: number;
    correct: boolean;
    time: number;
  };
}

/**
 * Run comparison
 */
async function runComparison(): Promise<void> {
  console.log('🔬 Comparing Intent Extraction Methods\n');
  console.log(`Test cases: ${TEST_CASES.length}\n`);

  const results: ComparisonResult[] = [];
  let rulesCorrect = 0;
  let llmCorrect = 0;
  let totalRulesTime = 0;
  let totalLLMTime = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    console.log(`\n[${i + 1}/${TEST_CASES.length}] "${testCase.text}"`);
    console.log(`Expected: ${testCase.expectedIntent}`);
    if (testCase.notes) {
      console.log(`Notes: ${testCase.notes}`);
    }

    // Rule-based extraction
    const rulesStart = Date.now();
    const rulesResult = await extractIntentRules(testCase.text, testCase.language);
    const rulesTime = Date.now() - rulesStart;
    totalRulesTime += rulesTime;

    const isRulesCorrect = rulesResult.type === testCase.expectedIntent;
    if (isRulesCorrect) rulesCorrect++;

    console.log(
      `  Rules: ${rulesResult.type} (${(rulesResult.confidence * 100).toFixed(0)}%) ${
        isRulesCorrect ? '✅' : '❌'
      } [${rulesTime}ms]`
    );

    // LLM-based extraction
    const llmStart = Date.now();
    const llmResult = await extractIntentWithLLM(testCase.text, testCase.language);
    const llmTime = Date.now() - llmStart;
    totalLLMTime += llmTime;

    const isLlmCorrect = llmResult.type === testCase.expectedIntent;
    if (isLlmCorrect) llmCorrect++;

    console.log(
      `  LLM:   ${llmResult.type} (${(llmResult.confidence * 100).toFixed(0)}%) ${
        isLlmCorrect ? '✅' : '❌'
      } [${llmTime}ms]`
    );

    results.push({
      testCase,
      rulesBased: {
        intent: rulesResult.type,
        confidence: rulesResult.confidence,
        correct: isRulesCorrect,
        time: rulesTime,
      },
      llmBased: {
        intent: llmResult.type,
        confidence: llmResult.confidence,
        correct: isLlmCorrect,
        time: llmTime,
      },
    });

    // Rate limiting for LLM
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 COMPARISON SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const rulesAccuracy = rulesCorrect / TEST_CASES.length;
  const llmAccuracy = llmCorrect / TEST_CASES.length;
  const avgRulesTime = totalRulesTime / TEST_CASES.length;
  const avgLLMTime = totalLLMTime / TEST_CASES.length;

  console.log('Accuracy:');
  console.log(`  Rule-based: ${(rulesAccuracy * 100).toFixed(1)}% (${rulesCorrect}/${TEST_CASES.length})`);
  console.log(`  LLM-based:  ${(llmAccuracy * 100).toFixed(1)}% (${llmCorrect}/${TEST_CASES.length})`);
  console.log(`  Winner:     ${llmAccuracy > rulesAccuracy ? 'LLM 🏆' : rulesAccuracy > llmAccuracy ? 'Rules 🏆' : 'Tie 🤝'}`);
  console.log('');

  console.log('Speed:');
  console.log(`  Rule-based: ${avgRulesTime.toFixed(1)}ms average`);
  console.log(`  LLM-based:  ${avgLLMTime.toFixed(1)}ms average`);
  console.log(`  Winner:     Rules 🏆 (${(avgLLMTime / avgRulesTime).toFixed(1)}x faster)`);
  console.log('');

  console.log('Cases where LLM did better:');
  const llmBetterCases = results.filter(
    (r) => r.llmBased.correct && !r.rulesBased.correct
  );
  if (llmBetterCases.length === 0) {
    console.log('  None');
  } else {
    llmBetterCases.forEach((r) => {
      console.log(`  • "${r.testCase.text}"`);
      console.log(`    Rules: ${r.rulesBased.intent} ❌`);
      console.log(`    LLM:   ${r.llmBased.intent} ✅`);
      if (r.testCase.notes) {
        console.log(`    Notes: ${r.testCase.notes}`);
      }
    });
  }
  console.log('');

  console.log('Cases where Rules did better:');
  const rulesBetterCases = results.filter(
    (r) => r.rulesBased.correct && !r.llmBased.correct
  );
  if (rulesBetterCases.length === 0) {
    console.log('  None');
  } else {
    rulesBetterCases.forEach((r) => {
      console.log(`  • "${r.testCase.text}"`);
      console.log(`    Rules: ${r.rulesBased.intent} ✅`);
      console.log(`    LLM:   ${r.llmBased.intent} ❌`);
    });
  }
  console.log('');

  console.log('Cases where both failed:');
  const bothFailedCases = results.filter(
    (r) => !r.rulesBased.correct && !r.llmBased.correct
  );
  if (bothFailedCases.length === 0) {
    console.log('  None');
  } else {
    bothFailedCases.forEach((r) => {
      console.log(`  • "${r.testCase.text}"`);
      console.log(`    Expected: ${r.testCase.expectedIntent}`);
      console.log(`    Rules:    ${r.rulesBased.intent}`);
      console.log(`    LLM:      ${r.llmBased.intent}`);
    });
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('');

  // Recommendation
  console.log('💡 Recommendation:');
  if (llmAccuracy > rulesAccuracy + 0.1) {
    console.log('   Use LLM-based extraction (significantly better accuracy)');
    console.log(`   Trade-off: ${(avgLLMTime / avgRulesTime).toFixed(0)}x slower + API costs`);
  } else if (llmAccuracy > rulesAccuracy) {
    console.log('   Consider hybrid approach:');
    console.log('   - Try LLM first');
    console.log('   - Fallback to rules if LLM fails or low confidence');
  } else {
    console.log('   Stick with rule-based extraction');
    console.log('   - Similar or better accuracy');
    console.log('   - Much faster');
    console.log('   - No API costs');
  }
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  if (!process.env.GOOGLE_CLOUD_KEY) {
    console.error('❌ Error: GOOGLE_CLOUD_KEY environment variable not set');
    console.error('');
    console.error('Usage:');
    console.error('  GOOGLE_CLOUD_KEY=your_key npx tsx scripts/compare-intent-methods.ts');
    console.error('');
    process.exit(1);
  }

  try {
    await runComparison();
  } catch (error) {
    console.error('❌ Comparison failed:', error);
    process.exit(1);
  }
}

main();
