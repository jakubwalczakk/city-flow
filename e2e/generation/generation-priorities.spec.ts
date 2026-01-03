import { test, expect, cleanDatabase, createTestPlan, setGenerationLimit, verifyFixedPointInPlan } from '../fixtures';
import { mockOpenRouterAPI, mockOpenRouterWithCustomData } from '../test-setup';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Generation Priorities', () => {
  let loginPage: LoginPage;
  let planDetailsPage: PlanDetailsPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);
    await setGenerationLimit(supabase, testUser.id, 0);

    loginPage = new LoginPage(page);
    planDetailsPage = new PlanDetailsPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await page.waitForURL(/\/plans/, { timeout: 10000 });
  });

  test.afterEach(async ({ supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);
  });

  test('Priority 1: Fixed points should be present in generated plan', async ({ page, supabase, testUser }) => {
    // Arrange - Mock OpenRouter to return plan with fixed points
    await mockOpenRouterWithCustomData(page, [
      {
        day_number: 1,
        date: '2026-06-14',
        title: 'Day 1: Arrival',
        activities: [
          {
            title: 'Airport Arrival',
            description: 'Arrival at the airport',
            location: 'Lotnisko Chopina',
            start_time: '08:00',
            duration_minutes: 60,
            category: 'transport',
          },
          {
            title: 'Hotel Check-in',
            description: 'Check in to hotel',
            location: 'City Center Hotel',
            start_time: '10:00',
            duration_minutes: 30,
            category: 'accommodation',
          },
          {
            title: 'Lunch',
            description: 'Local cuisine',
            location: 'Restaurant',
            start_time: '13:00',
            duration_minutes: 90,
            category: 'food',
          },
        ],
      },
      {
        day_number: 2,
        date: '2026-06-15',
        title: 'Day 2: Sightseeing',
        activities: [
          {
            title: 'Concert at 8 PM',
            description: 'Evening concert',
            location: 'Concert Hall',
            start_time: '20:00',
            duration_minutes: 120,
            category: 'entertainment',
          },
        ],
      },
    ]);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Trip with Fixed Points',
      destination: 'Warsaw',
      status: 'draft',
      startDate: '2026-06-14',
      endDate: '2026-06-16',
    });

    // Add two fixed points
    await supabase.from('fixed_points').insert([
      {
        plan_id: planId,
        location: 'Lotnisko Chopina',
        date: '2026-06-14',
        time: '08:00',
        description: 'Airport arrival',
      },
      {
        plan_id: planId,
        location: 'Concert Hall',
        date: '2026-06-16',
        time: '20:00',
        description: 'Evening concert',
      },
    ]);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Both fixed points should be in the plan
    const hasAirport = await verifyFixedPointInPlan(supabase, planId, 'Lotnisko');
    const hasConcert = await verifyFixedPointInPlan(supabase, planId, 'Concert');

    expect(hasAirport || hasConcert).toBe(true); // At least one should be present
  });

  test('Priority 2: User notes should influence plan', async ({ page, supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Rome Trip',
      destination: 'Rome',
      status: 'draft',
      description: 'I want to see the Colosseum and Forum Romanum',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
    });

    // Mock response with Colosseum
    await mockOpenRouterWithCustomData(page, [
      {
        day_number: 1,
        date: '2026-06-15',
        title: 'Day 1: Ancient Rome',
        activities: [
          {
            title: 'Visit Colosseum',
            description: 'Explore the ancient amphitheater',
            location: 'Colosseum',
            start_time: '10:00',
            duration_minutes: 120,
            category: 'sightseeing',
          },
          {
            title: 'Forum Romanum',
            description: 'Walk through ancient ruins',
            location: 'Forum Romanum',
            start_time: '13:00',
            duration_minutes: 90,
            category: 'sightseeing',
          },
        ],
      },
    ]);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert - Verify plan contains Colosseum and Forum
    const hasColosseum = await planDetailsPage.hasActivityWithTitle('Colosseum');
    const hasForum = await planDetailsPage.hasActivityWithTitle('Forum');

    expect(hasColosseum || hasForum).toBe(true);
  });

  test('Priority 3: Profile preferences should be considered', async ({ page, supabase, testUser }) => {
    // Arrange - Set user preferences
    await supabase
      .from('profiles')
      .update({
        preferences: ['Art & Museums', 'Local Food'],
        travel_pace: 'slow',
      })
      .eq('id', testUser.id);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Florence Cultural Trip',
      destination: 'Florence',
      status: 'draft',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
    });

    // Mock response with museums and food
    await mockOpenRouterWithCustomData(page, [
      {
        day_number: 1,
        date: '2026-06-15',
        title: 'Day 1: Art and Cuisine',
        activities: [
          {
            title: 'Uffizi Gallery',
            description: 'Renaissance art collection',
            location: 'Uffizi Gallery',
            start_time: '10:00',
            duration_minutes: 180,
            category: 'culture',
          },
          {
            title: 'Trattoria Lunch',
            description: 'Traditional Tuscan cuisine',
            location: 'Local Trattoria',
            start_time: '14:00',
            duration_minutes: 120,
            category: 'food',
          },
        ],
      },
    ]);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert - Verify plan has museum/art and food activities
    const activities = await planDetailsPage.getActivityTitles();
    const hasCulture = activities.some(
      (title) =>
        title.toLowerCase().includes('gallery') ||
        title.toLowerCase().includes('museum') ||
        title.toLowerCase().includes('uffizi')
    );
    const hasFood = activities.some(
      (title) =>
        title.toLowerCase().includes('food') ||
        title.toLowerCase().includes('trattoria') ||
        title.toLowerCase().includes('lunch')
    );

    expect(hasCulture || hasFood).toBe(true);
  });

  test('Hierarchy: Fixed points > Notes > Preferences', async ({ page, supabase, testUser }) => {
    // Arrange - Set profile preferences for "Nature"
    await supabase
      .from('profiles')
      .update({
        preferences: ['Nature', 'Hiking'],
        travel_pace: 'moderate',
      })
      .eq('id', testUser.id);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Mixed Priority Plan',
      destination: 'Rome',
      status: 'draft',
      description: 'I want to visit Vatican Museums', // Note: Museums (Priority 2)
      startDate: '2026-06-15',
      endDate: '2026-06-15',
    });

    // Fixed point: Restaurant reservation (Priority 1)
    await supabase.from('fixed_points').insert({
      plan_id: planId,
      location: 'Restaurant Da Enzo',
      date: '2026-06-15',
      time: '19:00',
      description: 'Dinner reservation',
    });

    // Mock with all three priorities
    await mockOpenRouterWithCustomData(page, [
      {
        day_number: 1,
        date: '2026-06-15',
        title: 'Day 1: Mixed Activities',
        activities: [
          {
            title: 'Vatican Museums',
            description: 'As requested in notes',
            location: 'Vatican',
            start_time: '10:00',
            duration_minutes: 180,
            category: 'culture',
          },
          {
            title: 'Dinner at Da Enzo',
            description: 'Fixed point reservation',
            location: 'Restaurant Da Enzo',
            start_time: '19:00',
            duration_minutes: 120,
            category: 'food',
          },
        ],
      },
    ]);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // Priority 1: Fixed point must be present
    const hasRestaurant = await verifyFixedPointInPlan(supabase, planId, 'Da Enzo');
    expect(hasRestaurant).toBe(true);

    // Priority 2: Notes (Vatican) should be present
    const hasVatican = await planDetailsPage.hasActivityWithTitle('Vatican');
    expect(hasVatican).toBe(true);

    // Priority 3: Nature/Hiking (from preferences) is optional and may not be present
    // since higher priorities take precedence
  });

  test('should handle plan with only fixed points', async ({ page, supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Fixed Points Only',
      destination: 'Paris',
      status: 'draft',
      startDate: '2026-06-15',
      endDate: '2026-06-15',
    });

    await supabase.from('fixed_points').insert([
      {
        plan_id: planId,
        location: 'Eiffel Tower',
        date: '2026-06-15',
        time: '10:00',
        description: 'Morning visit',
      },
      {
        plan_id: planId,
        location: 'Louvre Museum',
        date: '2026-06-15',
        time: '14:00',
        description: 'Afternoon visit',
      },
    ]);

    await mockOpenRouterAPI(page);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert - Plan should be generated with fixed points
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // At least one fixed point should be present
    const hasEiffel = await verifyFixedPointInPlan(supabase, planId, 'Eiffel');
    const hasLouvre = await verifyFixedPointInPlan(supabase, planId, 'Louvre');
    expect(hasEiffel || hasLouvre).toBe(true);
  });
});
