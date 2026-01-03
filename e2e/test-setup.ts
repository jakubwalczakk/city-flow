import type { Page } from '@playwright/test';

/**
 * Common test setup utilities for E2E tests.
 * Provides mocking for external services and common test configurations.
 */

/**
 * Mocks the OpenRouter API to prevent actual AI API calls during tests.
 * Returns predefined responses for plan generation endpoints.
 * This ensures tests run consistently without relying on external AI services.
 */
export async function mockOpenRouterAPI(page: Page): Promise<void> {
  // Mock OpenRouter API calls used in plan generation
  await page.route('https://openrouter.ai/api/v1/**', async (route) => {
    // Simulate realistic API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-generation-id',
        model: 'mock-model',
        created: Date.now(),
        choices: [
          {
            message: {
              content: JSON.stringify({
                days: [
                  {
                    day_number: 1,
                    date: '2026-06-15',
                    title: 'Day 1: Arrival and Exploration',
                    activities: [
                      {
                        title: 'Morning Coffee at Local Café',
                        description: 'Start your day with a delicious breakfast and coffee at a charming local café.',
                        location: 'Café du Coin',
                        start_time: '09:00',
                        duration_minutes: 60,
                        category: 'food',
                      },
                      {
                        title: 'City Walking Tour',
                        description: 'Explore the historic center with a guided walking tour.',
                        location: 'Old Town Square',
                        start_time: '10:30',
                        duration_minutes: 120,
                        category: 'sightseeing',
                      },
                      {
                        title: 'Lunch at Traditional Restaurant',
                        description: 'Enjoy authentic local cuisine.',
                        location: 'Restaurant Traditionnel',
                        start_time: '13:00',
                        duration_minutes: 90,
                        category: 'food',
                      },
                      {
                        title: 'Museum Visit',
                        description: 'Visit the famous local museum.',
                        location: 'City Museum',
                        start_time: '15:30',
                        duration_minutes: 120,
                        category: 'culture',
                      },
                    ],
                  },
                  {
                    day_number: 2,
                    date: '2026-06-16',
                    title: 'Day 2: Culture and Cuisine',
                    activities: [
                      {
                        title: 'Art Gallery Visit',
                        description: 'Browse contemporary art at the city gallery.',
                        location: 'Modern Art Gallery',
                        start_time: '10:00',
                        duration_minutes: 90,
                        category: 'culture',
                      },
                      {
                        title: 'Shopping at Local Market',
                        description: 'Browse local crafts and souvenirs.',
                        location: 'Central Market',
                        start_time: '12:00',
                        duration_minutes: 90,
                        category: 'shopping',
                      },
                      {
                        title: 'Dinner with a View',
                        description: 'Enjoy dinner at a rooftop restaurant.',
                        location: 'Skyline Restaurant',
                        start_time: '19:00',
                        duration_minutes: 120,
                        category: 'food',
                      },
                    ],
                  },
                  {
                    day_number: 3,
                    date: '2026-06-17',
                    title: 'Day 3: Relaxation and Departure',
                    activities: [
                      {
                        title: 'Park Stroll',
                        description: 'Relaxing walk in the city park.',
                        location: 'Central Park',
                        start_time: '09:00',
                        duration_minutes: 60,
                        category: 'relaxation',
                      },
                      {
                        title: 'Farewell Brunch',
                        description: 'Last meal before departure.',
                        location: 'Brunch Bistro',
                        start_time: '11:00',
                        duration_minutes: 90,
                        category: 'food',
                      },
                    ],
                  },
                ],
              }),
            },
          },
        ],
      }),
    });
  });
}

/**
 * Mocks the Plans API endpoints for E2E tests.
 * Prevents actual database writes while testing UI flows.
 */
export async function mockPlansAPI(page: Page): Promise<void> {
  // Mock Plans API for creation
  await page.route('**/api/plans', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-plan-id',
          name: 'Test Plan',
          destination: 'Paris',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock Fixed Points API
  await page.route('**/api/plans/*/fixed-points', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'fp-1', location: 'Test Location' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
  });

  // Mock Generate API
  await page.route('**/api/plans/*/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Sets up all common mocks for E2E tests.
 * Call this in beforeEach to ensure consistent test environment.
 */
export async function setupCommonMocks(page: Page): Promise<void> {
  await mockOpenRouterAPI(page);
  await mockPlansAPI(page);
}

/**
 * Waits for React hydration to complete.
 * Useful when testing forms that use React Hook Form.
 */
export async function waitForHydration(page: Page, timeout = 1000): Promise<void> {
  await page.waitForTimeout(timeout);
}

/**
 * Fills a form input with delay to simulate real user typing.
 * More reliable than instant fill for React forms.
 */
export async function fillInputSlowly(page: Page, selector: string, value: string, delay = 50): Promise<void> {
  const input = page.locator(selector);
  await input.click();
  await input.fill('');
  await input.pressSequentially(value, { delay });
}

/**
 * Mocks generation errors for testing error handling.
 * @param page Playwright page
 * @param errorType Type of error to simulate
 */
export async function mockGenerationError(page: Page, errorType: 'timeout' | '500' | 'unrealistic'): Promise<void> {
  await page.route('**/api/plans/*/generate', async (route) => {
    if (errorType === 'timeout') {
      // Simulate timeout by delaying response beyond reasonable time
      await new Promise((resolve) => setTimeout(resolve, 35000));
      await route.abort('timedout');
    } else if (errorType === '500') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    } else if (errorType === 'unrealistic') {
      // Return success but with a warning message
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          warning: 'Plan was too ambitious. Some activities were removed to make it realistic.',
        }),
      });
    }
  });
}

/**
 * Mock OpenRouter API with custom response for testing specific scenarios.
 * @param page Playwright page
 * @param customDays Custom days to return (overrides default mock)
 */
export async function mockOpenRouterWithCustomData(
  page: Page,
  customDays: {
    day_number: number;
    date: string;
    title: string;
    activities: {
      title: string;
      description: string;
      location: string;
      start_time: string;
      duration_minutes: number;
      category: string;
    }[];
  }[]
): Promise<void> {
  await page.route('https://openrouter.ai/api/v1/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-generation-id',
        model: 'mock-model',
        created: Date.now(),
        choices: [
          {
            message: {
              content: JSON.stringify({ days: customDays }),
            },
          },
        ],
      }),
    });
  });
}
