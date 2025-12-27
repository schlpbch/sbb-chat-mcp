#!/usr/bin/env node

/**
 * Reusable Test Script for 25 Sample Questions
 *
 * This script tests all 25 sample questions by making direct HTTP requests
 * to the chat API endpoint. It can be run anytime to verify the AI is
 * responding correctly.
 *
 * Usage:
 *   node scripts/test-25-questions.js
 *   node scripts/test-25-questions.js --verbose
 *   node scripts/test-25-questions.js --question=5
 */

const http = require('http');

// All 25 sample questions from WelcomeSection.tsx
const questions = [
  // Journey Planning (7)
  {
    id: 1,
    category: 'Journey Planning',
    label: 'Morning Commute',
    query: 'Find connections from Zurich HB to Bern tomorrow at 7am',
    expectedTools: ['findTrips'],
  },
  {
    id: 2,
    category: 'Journey Planning',
    label: 'Evening Travel',
    query: 'Show me connections from Geneva to Lausanne tonight at 6pm',
    expectedTools: ['findTrips'],
  },
  {
    id: 3,
    category: 'Journey Planning',
    label: 'Fastest Route',
    query: 'What is the fastest way from Lausanne to Geneva?',
    expectedTools: ['findTrips'],
  },
  {
    id: 4,
    category: 'Journey Planning',
    label: 'Fewest Changes',
    query: 'Find routes with fewest transfers from Bern to Lugano',
    expectedTools: ['findTrips'],
  },
  {
    id: 5,
    category: 'Journey Planning',
    label: 'Earliest Arrival',
    query: 'Get me to St. Gallen from Zurich as early as possible tomorrow',
    expectedTools: ['findTrips'],
  },
  {
    id: 6,
    category: 'Journey Planning',
    label: 'Mountain Trip',
    query: 'How do I get to Interlaken from Zurich for a day trip?',
    expectedTools: ['findTrips'],
  },
  {
    id: 7,
    category: 'Journey Planning',
    label: 'International',
    query: 'Find connections from Zurich to Milan tomorrow morning',
    expectedTools: ['findTrips'],
  },

  // Real-Time Information (5)
  {
    id: 8,
    category: 'Real-Time',
    label: 'Live Departures',
    query: 'Show me the next departures from Basel SBB',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
  },
  {
    id: 9,
    category: 'Real-Time',
    label: 'Arrivals',
    query: 'What trains are arriving at Bern in the next hour?',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
  },
  {
    id: 10,
    category: 'Real-Time',
    label: 'Transfer Check',
    query: 'Can I make a 5-minute transfer at Zurich HB?',
    expectedTools: ['findStopPlacesByName'],
  },
  {
    id: 11,
    category: 'Real-Time',
    label: 'Platform Info',
    query: 'Which platform does the IC1 to Geneva leave from at Lausanne?',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
  },
  {
    id: 12,
    category: 'Real-Time',
    label: 'Delays & Changes',
    query: 'Are there any delays on the route from Zurich to Bern right now?',
    expectedTools: ['findTrips'],
  },

  // Stations & Places (4)
  {
    id: 13,
    category: 'Stations',
    label: 'Nearby Stations',
    query: 'Find train stations near the Matterhorn',
    expectedTools: ['findStopPlacesByName'],
  },
  {
    id: 14,
    category: 'Stations',
    label: 'City Stations',
    query: 'What are the main train stations in Zurich?',
    expectedTools: ['findStopPlacesByName'],
  },
  {
    id: 15,
    category: 'Stations',
    label: 'Ski Resorts',
    query: 'Which train stations serve Verbier ski resort?',
    expectedTools: ['findStopPlacesByName'],
  },
  {
    id: 16,
    category: 'Stations',
    label: 'Tourist Spots',
    query: 'How do I reach Jungfraujoch by train?',
    expectedTools: ['findStopPlacesByName', 'findTrips'],
  },

  // Eco & Sustainability (3)
  {
    id: 17,
    category: 'Eco',
    label: 'Eco Comparison',
    query:
      'Compare the environmental impact of train vs car from Bern to Milan',
    expectedTools: ['findTrips', 'getEcoComparison'],
  },
  {
    id: 18,
    category: 'Eco',
    label: 'Carbon Savings',
    query:
      'How much CO2 do I save by taking the train instead of flying to Paris?',
    expectedTools: ['findTrips'],
  },
  {
    id: 19,
    category: 'Eco',
    label: 'Greenest Route',
    query: 'What is the most eco-friendly way to travel from Geneva to Zurich?',
    expectedTools: ['findTrips'],
  },

  // Weather & Conditions (3)
  {
    id: 20,
    category: 'Weather',
    label: 'Weather Check',
    query: 'What is the weather forecast for Lugano this weekend?',
    expectedTools: ['getWeather'],
  },
  {
    id: 21,
    category: 'Weather',
    label: 'Snow Report',
    query: 'What are the current snow conditions in St. Moritz?',
    expectedTools: ['getWeather'],
  },
  {
    id: 22,
    category: 'Weather',
    label: 'Mountain Weather',
    query: 'What is the weather like in Zermatt for the next 3 days?',
    expectedTools: ['getWeather'],
  },

  // Special Needs (3)
  {
    id: 23,
    category: 'Accessibility',
    label: 'Accessible Routes',
    query: 'Find wheelchair-accessible routes from Zurich to Lucerne',
    expectedTools: ['findTrips'],
  },
  {
    id: 24,
    category: 'Accessibility',
    label: 'Family Travel',
    query:
      'Plan a family-friendly trip from Bern to Lake Geneva with easy transfers',
    expectedTools: ['findTrips'],
  },
  {
    id: 25,
    category: 'Accessibility',
    label: 'Bike Transport',
    query: 'Can I take my bike on the train from Basel to Lucerne?',
    expectedTools: ['findTrips'],
  },
];

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const questionArg = args.find((arg) => arg.startsWith('--question='));
const specificQuestion = questionArg
  ? parseInt(questionArg.split('=')[1])
  : null;

// Test configuration
const API_URL = 'http://localhost:3000/api/llm/chat';
const TIMEOUT = 60000; // 60 seconds per question

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

/**
 * Make HTTP POST request to chat API
 */
function testQuestion(question) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: question.query,
      history: [],
      context: { language: 'en' },
      sessionId: `test-${Date.now()}`,
      useOrchestration: true,
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/llm/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: TIMEOUT,
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;

        try {
          const result = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            duration,
            response: result.response || '',
            toolCalls: result.toolCalls || [],
            error: result.error || null,
          });
        } catch (error) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            duration,
            response: '',
            toolCalls: [],
            error: `Failed to parse response: ${error.message}`,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        statusCode: 0,
        duration: Date.now() - startTime,
        response: '',
        toolCalls: [],
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: 0,
        duration: TIMEOUT,
        response: '',
        toolCalls: [],
        error: 'Request timeout',
      });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Analyze test result
 */
function analyzeResult(question, result) {
  const issues = [];

  // Check if request succeeded
  if (!result.success) {
    issues.push(
      `HTTP ${result.statusCode || 'ERROR'}: ${result.error || 'Unknown error'}`
    );
  }

  // Check if response exists
  if (!result.response || result.response.length < 20) {
    issues.push('Response too short or empty');
  }

  // Check if expected tools were called
  if (question.expectedTools && question.expectedTools.length > 0) {
    const calledTools = result.toolCalls.map((tc) => tc.toolName);
    const missingTools = question.expectedTools.filter(
      (tool) => !calledTools.includes(tool)
    );

    if (missingTools.length > 0) {
      issues.push(`Missing tools: ${missingTools.join(', ')}`);
    }
  }

  // Check for error keywords in response
  const errorKeywords = ['error', 'sorry', 'failed', 'unable', 'cannot'];
  const hasErrorKeywords = errorKeywords.some((keyword) =>
    result.response.toLowerCase().includes(keyword)
  );

  if (hasErrorKeywords && result.response.length < 100) {
    issues.push('Response contains error keywords');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Print test result
 */
function printResult(question, result, analysis) {
  const status = analysis.passed
    ? `${colors.green}✓ PASS${colors.reset}`
    : `${colors.red}✗ FAIL${colors.reset}`;

  const duration = `${colors.gray}(${result.duration}ms)${colors.reset}`;

  console.log(`${status} Q${question.id}: ${question.label} ${duration}`);

  if (verbose || !analysis.passed) {
    console.log(`  ${colors.gray}Query: ${question.query}${colors.reset}`);

    if (result.toolCalls.length > 0) {
      const tools = result.toolCalls.map((tc) => tc.toolName).join(', ');
      console.log(`  ${colors.blue}Tools: ${tools}${colors.reset}`);
    }

    if (!analysis.passed) {
      analysis.issues.forEach((issue) => {
        console.log(`  ${colors.yellow}⚠ ${issue}${colors.reset}`);
      });
    }

    if (verbose && result.response) {
      const preview = result.response.substring(0, 150).replace(/\n/g, ' ');
      console.log(`  ${colors.gray}Response: ${preview}...${colors.reset}`);
    }

    console.log('');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(
    `${colors.blue}=== Testing 25 Sample Questions ===${colors.reset}\n`
  );
  console.log(`API: ${API_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms\n`);

  const questionsToTest = specificQuestion
    ? questions.filter((q) => q.id === specificQuestion)
    : questions;

  if (questionsToTest.length === 0) {
    console.log(
      `${colors.red}No questions found matching criteria${colors.reset}`
    );
    process.exit(1);
  }

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const question of questionsToTest) {
    const result = await testQuestion(question);
    const analysis = analyzeResult(question, result);

    printResult(question, result, analysis);

    results.push({ question, result, analysis });

    if (analysis.passed) {
      passed++;
    } else {
      failed++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log(`\n${colors.blue}=== Summary ===${colors.reset}`);
  console.log(`Total: ${questionsToTest.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(
    `Success Rate: ${((passed / questionsToTest.length) * 100).toFixed(1)}%`
  );

  // Save detailed results to file
  const fs = require('fs');
  const reportPath = 'test-results/25-questions-api-test.json';

  try {
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: { total: questionsToTest.length, passed, failed },
          results: results.map((r) => ({
            id: r.question.id,
            category: r.question.category,
            label: r.question.label,
            query: r.question.query,
            passed: r.analysis.passed,
            duration: r.result.duration,
            toolsCalled: r.result.toolCalls.map((tc) => tc.toolName),
            issues: r.analysis.issues,
          })),
        },
        null,
        2
      )
    );

    console.log(
      `\n${colors.gray}Detailed report saved to: ${reportPath}${colors.reset}`
    );
  } catch (error) {
    console.log(
      `\n${colors.yellow}Warning: Could not save report: ${error.message}${colors.reset}`
    );
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
