/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars */
import { authTest as test, expect, createTestUser, createTestPlan, cleanDatabase, deleteTestUser } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlansListPage } from '../page-objects/PlansListPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('Plan Row Level Security (RLS)', () => {
  test('should only show own plans in list view', async ({ page, supabase }) => {
    // Create User A with a plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'User A Plan',
      destination: 'Paris',
      status: 'draft',
    });

    // Create User B with a plan
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdB } = await createTestPlan(supabase, userB.user.id, {
      name: 'User B Plan',
      destination: 'Rome',
      status: 'draft',
    });

    try {
      // Login as User A
      const loginPageA = new LoginPage(page);
      const plansListPageA = new PlansListPage(page);

      await loginPageA.goto();
      await loginPageA.login(userA.email, TEST_USER_PASSWORD);

      // Navigate to plans list
      await plansListPageA.goto();
      await plansListPageA.waitForPlansToLoad();

      // Verify User A can see only their own plan
      await plansListPageA.expectPlanExists('User A Plan');
      await plansListPageA.expectPlanNotExists('User B Plan');

      // Verify plan count
      const planCount = await plansListPageA.getPlanCount();
      expect(planCount).toBe(1);

      // Logout
      await page.goto('/api/auth/logout');
      await page.waitForTimeout(1000);

      // Login as User B
      const loginPageB = new LoginPage(page);
      const plansListPageB = new PlansListPage(page);

      await loginPageB.goto();
      await loginPageB.login(userB.email, TEST_USER_PASSWORD);

      // Navigate to plans list
      await plansListPageB.goto();
      await plansListPageB.waitForPlansToLoad();

      // Verify User B can see only their own plan
      await plansListPageB.expectPlanExists('User B Plan');
      await plansListPageB.expectPlanNotExists('User A Plan');

      const planCountB = await plansListPageB.getPlanCount();
      expect(planCountB).toBe(1);
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test.skip('should deny access to another user plan via URL manipulation', async ({ page, supabase }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Create User A with a plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'User A Private Plan',
      destination: 'Berlin',
      status: 'draft',
    });

    // Create User B (without plans)
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageB = new LoginPage(page);

      await loginPageB.goto();
      await loginPageB.login(userB.email, TEST_USER_PASSWORD);

      // Try to access User A's plan directly via URL
      await planDetailsPage.goto(planIdA);

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Should either show 403/404 error or redirect to /plans
      const currentUrl = page.url();
      const isBlocked =
        (currentUrl.includes('/plans') && !currentUrl.includes(planIdA)) ||
        (await page
          .getByTestId('plans-list-error')
          .isVisible()
          .catch(() => false));

      expect(isBlocked).toBeTruthy();

      // Verify User B cannot see the plan title
      const isPlanAccessible = await planDetailsPage.isPlanAccessible();
      expect(isPlanAccessible).toBeFalsy();
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test.skip('should deny editing another user plan name via API', async ({ page, supabase }) => {
    // Create User A with a plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'Original Plan Name',
      destination: 'Vienna',
      status: 'draft',
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageEdit = new LoginPage(page);
      await loginPageEdit.goto();
      await loginPageEdit.login(userB.email, TEST_USER_PASSWORD);

      // Try to update User A's plan via API
      const response = await page.request.patch(`/api/plans/${planIdA}`, {
        data: {
          name: 'Hacked Plan Name',
        },
      });

      // Should return 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(response.status());

      // Verify the plan name was NOT changed in database
      const { data: plan } = await supabase.from('plans').select('name').eq('id', planIdA).single();

      expect(plan!.name).toBe('Original Plan Name');
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test('should deny deleting another user plan via API', async ({ page, supabase }) => {
    // Create User A with a plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'Protected Plan',
      destination: 'Amsterdam',
      status: 'draft',
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageDelete = new LoginPage(page);
      await loginPageDelete.goto();
      await loginPageDelete.login(userB.email, TEST_USER_PASSWORD);

      // Try to delete User A's plan via API
      const response = await page.request.delete(`/api/plans/${planIdA}`);

      // Should return 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(response.status());

      // Verify the plan still exists in database
      const { data: plan } = await supabase.from('plans').select('*').eq('id', planIdA).single();

      expect(plan).not.toBeNull();
      expect(plan!.name).toBe('Protected Plan');
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test.skip('should deny accessing fixed points of another user plan', async ({ page, supabase }) => {
    // Create User A with a plan and fixed points
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'Plan with Fixed Points',
      destination: 'Prague',
      status: 'draft',
      withFixedPoints: true,
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageFixedPoints = new LoginPage(page);
      await loginPageFixedPoints.goto();
      await loginPageFixedPoints.login(userB.email, TEST_USER_PASSWORD);

      // Try to access User A's fixed points via API
      const response = await page.request.get(`/api/plans/${planIdA}/fixed-points`);

      // Should return 403 or 404
      expect([403, 404]).toContain(response.status());
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test('should deny generating another user plan via API', async ({ page, supabase }) => {
    // Create User A with a draft plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'Draft Plan to Generate',
      destination: 'Munich',
      status: 'draft',
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageGenerate = new LoginPage(page);
      await loginPageGenerate.goto();
      await loginPageGenerate.login(userB.email, TEST_USER_PASSWORD);

      // Try to generate User A's plan via API
      const response = await page.request.post(`/api/plans/${planIdA}/generate`);

      // Should return 403 or 404
      expect([403, 404]).toContain(response.status());

      // Verify the plan status didn't change
      const { data: plan } = await supabase.from('plans').select('status').eq('id', planIdA).single();

      expect(plan!.status).toBe('draft');
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test('should allow user to access their own plans after creating multiple', async ({ page, supabase }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a user with multiple plans
    const user = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: plan1 } = await createTestPlan(supabase, user.user.id, {
      name: 'My Plan 1',
      destination: 'City 1',
      status: 'draft',
    });

    const { planId: plan2 } = await createTestPlan(supabase, user.user.id, {
      name: 'My Plan 2',
      destination: 'City 2',
      status: 'generated',
      withActivities: true,
    });

    const { planId: plan3 } = await createTestPlan(supabase, user.user.id, {
      name: 'My Plan 3',
      destination: 'City 3',
      status: 'draft',
    });

    try {
      // Login as the user
      const loginPageMultiple = new LoginPage(page);
      const plansListPageMultiple = new PlansListPage(page);

      await loginPageMultiple.goto();
      await loginPageMultiple.login(user.email, TEST_USER_PASSWORD);

      // Navigate to plans list
      await plansListPageMultiple.goto();
      await plansListPageMultiple.waitForPlansToLoad();

      // Verify all plans are visible
      const planCount = await plansListPageMultiple.getPlanCount();
      expect(planCount).toBe(3);

      // Access each plan details
      await planDetailsPage.goto(plan1);
      await planDetailsPage.waitForPageLoad();
      expect(await planDetailsPage.isPlanAccessible()).toBeTruthy();

      await planDetailsPage.goto(plan2);
      await planDetailsPage.waitForPageLoad();
      expect(await planDetailsPage.isPlanAccessible()).toBeTruthy();

      await planDetailsPage.goto(plan3);
      await planDetailsPage.waitForPageLoad();
      expect(await planDetailsPage.isPlanAccessible()).toBeTruthy();
    } finally {
      // Cleanup
      await cleanDatabase(supabase, user.user.id);
      await deleteTestUser(supabase, user.user.id);
    }
  });

  test.skip('should prevent direct database access to other user plans via Supabase client', async ({ supabase }) => {
    // Create User A with a plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'User A Plan',
      destination: 'London',
      status: 'draft',
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Authenticate as User B
      await supabase.auth.signInWithPassword({
        email: userB.email,
        password: TEST_USER_PASSWORD,
      });

      // Try to fetch User A's plan (should be blocked by RLS)
      const { data, error } = await supabase.from('plans').select('*').eq('id', planIdA).single();

      // Should either return error or null data
      expect(data === null || error !== null).toBeTruthy();

      // Try to update User A's plan (should be blocked by RLS)
      const { error: updateError } = await supabase.from('plans').update({ name: 'Hacked Name' }).eq('id', planIdA);

      expect(updateError).not.toBeNull();

      // Try to delete User A's plan (should be blocked by RLS)
      const { error: deleteError } = await supabase.from('plans').delete().eq('id', planIdA);

      expect(deleteError).not.toBeNull();

      // Verify User A's plan is unchanged
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({
        email: userA.email,
        password: TEST_USER_PASSWORD,
      });

      const { data: originalPlan } = await supabase.from('plans').select('*').eq('id', planIdA).single();

      expect(originalPlan).not.toBeNull();
      expect(originalPlan!.name).toBe('User A Plan');
    } finally {
      // Cleanup
      await supabase.auth.signOut();
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });

  test('should deny access to activities of another user plan', async ({ page, supabase }) => {
    // Create User A with a generated plan
    const userA = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    const { planId: planIdA } = await createTestPlan(supabase, userA.user.id, {
      name: 'Generated Plan with Activities',
      destination: 'Lisbon',
      status: 'generated',
      withActivities: true,
    });

    // Create User B
    const userB = await createTestUser(supabase, {
      password: TEST_USER_PASSWORD,
      onboardingCompleted: true,
    });

    try {
      // Login as User B
      const loginPageActivities = new LoginPage(page);
      await loginPageActivities.goto();
      await loginPageActivities.login(userB.email, TEST_USER_PASSWORD);

      // Try to access activities via API (if such endpoint exists)
      const response = await page.request.get(`/api/plans/${planIdA}/activities`);

      // Should return 403 or 404
      expect([403, 404]).toContain(response.status());
    } finally {
      // Cleanup
      await cleanDatabase(supabase, userA.user.id);
      await cleanDatabase(supabase, userB.user.id);
      await deleteTestUser(supabase, userA.user.id);
      await deleteTestUser(supabase, userB.user.id);
    }
  });
});
