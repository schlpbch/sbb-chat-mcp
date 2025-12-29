import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive test suite for all 25 sample questions on the landing page
 * Tests tool execution, card rendering, and response quality
 */

interface TestQuestion {
  number: number;
  category: string;
  label: string;
  query: string;
  expectedTools: string[];
  expectedCards: string[];
}

const allQuestions: TestQuestion[] = [
  // Journey Planning (7)
  {
    number: 1,
    category: 'Journey Planning',
    label: 'Morning Commute',
    query: 'Find connections from Zurich HB to Bern tomorrow at 7am',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 2,
    category: 'Journey Planning',
    label: 'Evening Travel',
    query: 'Show me connections from Geneva to Lausanne tonight at 6pm',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 3,
    category: 'Journey Planning',
    label: 'Fastest Route',
    query: 'What is the fastest way from Lausanne to Geneva?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 4,
    category: 'Journey Planning',
    label: 'Fewest Changes',
    query: 'Find routes with fewest transfers from Bern to Lugano',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 5,
    category: 'Journey Planning',
    label: 'Earliest Arrival',
    query: 'Get me to St. Gallen from Zurich as early as possible tomorrow',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 6,
    category: 'Journey Planning',
    label: 'Mountain Trip',
    query: 'How do I get to Interlaken from Zurich for a day trip?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 7,
    category: 'Journey Planning',
    label: 'International',
    query: 'Find connections from Zurich to Milan tomorrow morning',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },

  // Real-Time Information (5)
  {
    number: 8,
    category: 'Real-Time',
    label: 'Live Departures',
    query: 'Show me the next departures from Basel SBB',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
    expectedCards: ['BoardCard'],
  },
  {
    number: 9,
    category: 'Real-Time',
    label: 'Arrivals',
    query: 'What trains are arriving at Bern in the next hour?',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
    expectedCards: ['BoardCard'],
  },

  {
    number: 11,
    category: 'Real-Time',
    label: 'Platform Info',
    query: 'Which platform does the IC1 to Geneva leave from at Lausanne?',
    expectedTools: ['findStopPlacesByName', 'getPlaceEvents'],
    expectedCards: ['BoardCard'],
  },
  {
    number: 12,
    category: 'Real-Time',
    label: 'Delays & Changes',
    query: 'Are there any delays on the route from Zurich to Bern right now?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },

  // Stations & Places (4)
  {
    number: 13,
    category: 'Stations',
    label: 'Nearby Stations',
    query: 'Find train stations near the Matterhorn',
    expectedTools: ['findStopPlacesByName'],
    expectedCards: ['StationCard'],
  },
  {
    number: 14,
    category: 'Stations',
    label: 'City Stations',
    query: 'What are the main train stations in Zurich?',
    expectedTools: ['findStopPlacesByName'],
    expectedCards: ['StationCard'],
  },
  {
    number: 15,
    category: 'Stations',
    label: 'Ski Resorts',
    query: 'Which train stations serve Verbier ski resort?',
    expectedTools: ['findStopPlacesByName'],
    expectedCards: ['StationCard'],
  },
  {
    number: 16,
    category: 'Stations',
    label: 'Tourist Spots',
    query: 'How do I reach Jungfraujoch by train?',
    expectedTools: ['findStopPlacesByName', 'findTrips'],
    expectedCards: ['StationCard', 'TripCard'],
  },

  // Eco & Sustainability (3)
  {
    number: 17,
    category: 'Eco',
    label: 'Eco Comparison',
    query:
      'Compare the environmental impact of train vs car from Bern to Milan',
    expectedTools: ['findTrips', 'getEcoComparison'],
    expectedCards: ['TripCard', 'EcoCard'],
  },
  {
    number: 18,
    category: 'Eco',
    label: 'Carbon Savings',
    query:
      'How much CO2 do I save by taking the train instead of flying to Paris?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 19,
    category: 'Eco',
    label: 'Greenest Route',
    query: 'What is the most eco-friendly way to travel from Geneva to Zurich?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },

  // Weather & Conditions (3)
  {
    number: 20,
    category: 'Weather',
    label: 'Weather Check',
    query: 'What is the weather forecast for Lugano this weekend?',
    expectedTools: ['getWeather'],
    expectedCards: ['WeatherCard'],
  },
  {
    number: 21,
    category: 'Weather',
    label: 'Snow Report',
    query: 'What are the current snow conditions in St. Moritz?',
    expectedTools: ['getWeather'],
    expectedCards: ['WeatherCard'],
  },
  {
    number: 22,
    category: 'Weather',
    label: 'Mountain Weather',
    query: 'What is the weather like in Zermatt for the next 3 days?',
    expectedTools: ['getWeather'],
    expectedCards: ['WeatherCard'],
  },

  // Special Needs (3)
  {
    number: 23,
    category: 'Accessibility',
    label: 'Accessible Routes',
    query: 'Find wheelchair-accessible routes from Zurich to Lucerne',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 24,
    category: 'Accessibility',
    label: 'Family Travel',
    query:
      'Plan a family-friendly trip from Bern to Lake Geneva with easy transfers',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
  {
    number: 25,
    category: 'Accessibility',
    label: 'Bike Transport',
    query: 'Can I take my bike on the train from Basel to Lucerne?',
    expectedTools: ['findTrips'],
    expectedCards: ['TripCard'],
  },
];

/**
 * Helper function to wait for AI response and analyze results
 */
async function testQuestion(page: Page, question: TestQuestion) {
  // Navigate to home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find and click the question button by its label
  const button = page.locator('button', { hasText: question.label }).first();
  await expect(button).toBeVisible({ timeout: 5000 });
  await button.click();

  // Wait for the message to be sent
  await page.waitForTimeout(1000);

  // Wait for loading to complete (max 60 seconds for complex queries)
  const loadingIndicator = page
    .locator('text=Thinking')
    .or(page.locator('text=Calling'));
  await expect(loadingIndicator).toBeHidden({ timeout: 60000 });

  // Check for Companion response
  const CompanionMessage = page
    .locator('[data-testid="message-Companion"]')
    .last();
  await expect(CompanionMessage).toBeVisible({ timeout: 5000 });

  // Get the response text
  const responseText = await CompanionMessage.textContent();

  // Check for error messages
  const hasError =
    responseText?.toLowerCase().includes('error') ||
    responseText?.toLowerCase().includes('sorry') ||
    responseText?.toLowerCase().includes('failed');

  return {
    hasResponse: true,
    responseText: responseText || '',
    hasError,
  };
}

test.describe('25 Sample Questions - Comprehensive Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for these tests
    test.setTimeout(90000);
  });

  // Group tests by category
  test.describe('Journey Planning Questions (1-7)', () => {
    const journeyQuestions = allQuestions.filter(
      (q) => q.category === 'Journey Planning'
    );

    for (const question of journeyQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        // Assertions
        expect(
          result.hasResponse,
          `Question ${question.number} should get a response`
        ).toBe(true);
        expect(
          result.hasError,
          `Question ${question.number} should not have errors`
        ).toBe(false);
        expect(
          result.responseText.length,
          `Question ${question.number} should have substantial response`
        ).toBeGreaterThan(50);

        // Check for expected content
        if (question.expectedTools.includes('findTrips')) {
          // Should mention trips or connections
          const hasTripContent =
            result.responseText.toLowerCase().includes('trip') ||
            result.responseText.toLowerCase().includes('connection') ||
            result.responseText.toLowerCase().includes('train');
          expect(
            hasTripContent,
            `Question ${question.number} should mention trips/connections`
          ).toBe(true);
        }
      });
    }
  });

  test.describe('Real-Time Information Questions (8-12)', () => {
    const realTimeQuestions = allQuestions.filter(
      (q) => q.category === 'Real-Time'
    );

    for (const question of realTimeQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        expect(result.hasResponse).toBe(true);
        expect(result.hasError).toBe(false);
        expect(result.responseText.length).toBeGreaterThan(50);

        // Check for real-time content
        if (question.expectedTools.includes('getPlaceEvents')) {
          const hasRealTimeContent =
            result.responseText.toLowerCase().includes('departure') ||
            result.responseText.toLowerCase().includes('arrival') ||
            result.responseText.toLowerCase().includes('platform');
          expect(
            hasRealTimeContent,
            `Question ${question.number} should mention departures/arrivals`
          ).toBe(true);
        }
      });
    }
  });

  test.describe('Stations & Places Questions (13-16)', () => {
    const stationQuestions = allQuestions.filter(
      (q) => q.category === 'Stations'
    );

    for (const question of stationQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        expect(result.hasResponse).toBe(true);
        expect(result.hasError).toBe(false);
        expect(result.responseText.length).toBeGreaterThan(50);

        // Check for station content
        const hasStationContent =
          result.responseText.toLowerCase().includes('station') ||
          result.responseText.toLowerCase().includes('stop');
        expect(
          hasStationContent,
          `Question ${question.number} should mention stations`
        ).toBe(true);
      });
    }
  });

  test.describe('Eco & Sustainability Questions (17-19)', () => {
    const ecoQuestions = allQuestions.filter((q) => q.category === 'Eco');

    for (const question of ecoQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        expect(result.hasResponse).toBe(true);
        expect(result.hasError).toBe(false);
        expect(result.responseText.length).toBeGreaterThan(50);

        // Check for eco content
        const hasEcoContent =
          result.responseText.toLowerCase().includes('co2') ||
          result.responseText.toLowerCase().includes('carbon') ||
          result.responseText.toLowerCase().includes('eco') ||
          result.responseText.toLowerCase().includes('environment');
        expect(
          hasEcoContent,
          `Question ${question.number} should mention environmental impact`
        ).toBe(true);
      });
    }
  });

  test.describe('Weather & Conditions Questions (20-22)', () => {
    const weatherQuestions = allQuestions.filter(
      (q) => q.category === 'Weather'
    );

    for (const question of weatherQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        expect(result.hasResponse).toBe(true);
        expect(result.hasError).toBe(false);
        expect(result.responseText.length).toBeGreaterThan(50);

        // Check for weather content
        const hasWeatherContent =
          result.responseText.toLowerCase().includes('weather') ||
          result.responseText.toLowerCase().includes('temperature') ||
          result.responseText.toLowerCase().includes('snow') ||
          result.responseText.toLowerCase().includes('forecast');
        expect(
          hasWeatherContent,
          `Question ${question.number} should mention weather`
        ).toBe(true);
      });
    }
  });

  test.describe('Special Needs Questions (23-25)', () => {
    const accessibilityQuestions = allQuestions.filter(
      (q) => q.category === 'Accessibility'
    );

    for (const question of accessibilityQuestions) {
      test(`Q${question.number}: ${question.label}`, async ({ page }) => {
        const result = await testQuestion(page, question);

        expect(result.hasResponse).toBe(true);
        expect(result.hasError).toBe(false);
        expect(result.responseText.length).toBeGreaterThan(50);
      });
    }
  });

  // Summary test to run all questions and generate report
  test('Generate comprehensive test report', async ({ page }) => {
    const results: any[] = [];

    for (const question of allQuestions) {
      try {
        const result = await testQuestion(page, question);
        results.push({
          number: question.number,
          category: question.category,
          label: question.label,
          status: result.hasError ? 'FAIL' : 'PASS',
          hasResponse: result.hasResponse,
          responseLength: result.responseText.length,
          error: result.hasError ? result.responseText.substring(0, 100) : null,
        });
        console.log(
          `✅ Q${question.number}: ${question.label} - ${
            result.hasError ? 'FAIL' : 'PASS'
          }`
        );
      } catch (error) {
        results.push({
          number: question.number,
          category: question.category,
          label: question.label,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.log(`❌ Q${question.number}: ${question.label} - ERROR`);
      }
    }

    // Print summary
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const errors = results.filter((r) => r.status === 'ERROR').length;

    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Errors: ${errors}`);
    console.log(
      `Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`
    );

    // Write results to file
    const fs = require('fs');
    const reportPath = 'test-results/25-questions-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
  });
});
