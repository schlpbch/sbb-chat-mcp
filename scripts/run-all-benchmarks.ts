/**
 * Run All Benchmarks
 *
 * Executes both intent and entity extraction benchmarks and generates
 * a combined report.
 *
 * Usage:
 *   npx tsx scripts/run-all-benchmarks.ts
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CombinedResults {
  timestamp: string;
  intentBenchmark: any;
  entityBenchmark: any;
  summary: {
    intentAccuracy: number;
    entityAccuracy: number;
    overallScore: number;
    passedThreshold: boolean;
  };
}

/**
 * Run a script and return exit code
 */
function runScript(scriptPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running: ${scriptPath}`);
    console.log('='.repeat(80));

    const child = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      resolve(code || 0);
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Generate combined report
 */
function generateCombinedReport(): CombinedResults {
  const intentResultsPath = join(process.cwd(), 'benchmark-results.json');
  const entityResultsPath = join(process.cwd(), 'entity-benchmark-results.json');

  if (!existsSync(intentResultsPath) || !existsSync(entityResultsPath)) {
    throw new Error('Benchmark results files not found');
  }

  const intentResults = JSON.parse(readFileSync(intentResultsPath, 'utf-8'));
  const entityResults = JSON.parse(readFileSync(entityResultsPath, 'utf-8'));

  const intentAccuracy = intentResults.accuracy;
  const entityAccuracy = entityResults.overallAccuracy;
  const overallScore = (intentAccuracy + entityAccuracy) / 2;

  // Threshold: both must be >= 70%
  const threshold = 0.7;
  const passedThreshold =
    intentAccuracy >= threshold && entityAccuracy >= threshold;

  return {
    timestamp: new Date().toISOString(),
    intentBenchmark: intentResults,
    entityBenchmark: entityResults,
    summary: {
      intentAccuracy,
      entityAccuracy,
      overallScore,
      passedThreshold,
    },
  };
}

/**
 * Print summary report
 */
function printSummary(results: CombinedResults): void {
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 COMBINED BENCHMARK SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  console.log('Intent Classification:');
  console.log(
    `  Accuracy:  ${(results.summary.intentAccuracy * 100).toFixed(2)}%`
  );
  console.log(
    `  Status:    ${results.summary.intentAccuracy >= 0.7 ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log('');

  console.log('Entity Extraction:');
  console.log(
    `  Accuracy:  ${(results.summary.entityAccuracy * 100).toFixed(2)}%`
  );
  console.log(
    `  Status:    ${results.summary.entityAccuracy >= 0.7 ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log('');

  console.log('Overall:');
  console.log(
    `  Combined Score: ${(results.summary.overallScore * 100).toFixed(2)}%`
  );
  console.log(
    `  Status:         ${results.summary.passedThreshold ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log('');

  console.log('Detailed Results:');
  console.log(`  Intent Benchmark:  benchmark-results.json`);
  console.log(`  Entity Benchmark:  entity-benchmark-results.json`);
  console.log(`  Combined Report:   combined-benchmark-report.json`);
  console.log('');

  console.log('='.repeat(80));

  if (results.summary.passedThreshold) {
    console.log('🎉 All benchmarks passed!');
  } else {
    console.log('⚠️  Some benchmarks failed. Review the detailed results above.');
  }
  console.log('='.repeat(80));
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Running All Benchmarks\n');

  try {
    // Run intent benchmark
    const intentExitCode = await runScript(
      'scripts/benchmark-intent-extraction.ts'
    );

    // Run entity benchmark
    const entityExitCode = await runScript(
      'scripts/benchmark-entity-extraction.ts'
    );

    // Generate combined report
    console.log('\n📊 Generating combined report...\n');
    const combinedResults = generateCombinedReport();

    // Save combined report
    const reportPath = join(process.cwd(), 'combined-benchmark-report.json');
    writeFileSync(reportPath, JSON.stringify(combinedResults, null, 2));

    // Print summary
    printSummary(combinedResults);

    // Exit with appropriate code
    if (combinedResults.summary.passedThreshold) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Benchmark execution failed:', error);
    process.exit(1);
  }
}

main();
