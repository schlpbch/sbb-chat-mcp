#!/usr/bin/env node

/**
 * Quick Test Summary - Run this to see results from last test
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(
  __dirname,
  '..',
  'test-results',
  '25-questions-api-test.json'
);

try {
  const data = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(data);

  console.log('\n=== Test Results Summary ===\n');
  console.log(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`Total: ${report.summary.total}`);
  console.log(`✓ Passed: ${report.summary.passed}`);
  console.log(`✗ Failed: ${report.summary.failed}`);
  console.log(
    `Success Rate: ${(
      (report.summary.passed / report.summary.total) *
      100
    ).toFixed(1)}%\n`
  );

  // Group by category
  const byCategory = {};
  report.results.forEach((r) => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { passed: 0, failed: 0, questions: [] };
    }
    if (r.passed) {
      byCategory[r.category].passed++;
    } else {
      byCategory[r.category].failed++;
    }
    byCategory[r.category].questions.push(r);
  });

  // Print by category
  Object.keys(byCategory).forEach((category) => {
    const cat = byCategory[category];
    const total = cat.passed + cat.failed;
    console.log(`\n${category} (${cat.passed}/${total} passed):`);

    cat.questions.forEach((q) => {
      const status = q.passed ? '✓' : '✗';
      const tools =
        q.toolsCalled.length > 0 ? ` [${q.toolsCalled.join(', ')}]` : '';
      console.log(`  ${status} Q${q.id}: ${q.label}${tools}`);

      if (!q.passed && q.issues.length > 0) {
        q.issues.forEach((issue) => {
          console.log(`      ⚠ ${issue}`);
        });
      }
    });
  });

  console.log('\n');
} catch (error) {
  console.error('Error reading test report:', error.message);
  console.log('\nRun the test first: node scripts/test-25-questions.js');
  process.exit(1);
}
