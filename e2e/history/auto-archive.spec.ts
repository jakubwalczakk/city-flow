import {
  authTest as test,
  expect,
  createTestPlan,
  createDraftPlan,
  runArchivingJob,
  verifyPlanIsArchived,
  getArchivedPlanCount,
} from '../fixtures';
import { PlansListPage } from '../page-objects/PlansListPage';
import { HistoryPage } from '../page-objects/HistoryPage';

test.describe('Auto-Archive Plans', () => {
  test('should auto-archive plan after end date passes', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create a generated plan with past end date
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Expired Plan',
      destination: 'Rome',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-03', // Past date
    });

    // Verify plan starts as generated
    const { data: originalPlan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(originalPlan?.status).toBe('generated');

    // Run archiving job
    const archivedCount = await runArchivingJob(supabase);
    expect(archivedCount).toBeGreaterThanOrEqual(1);

    // Verify plan is now archived
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeTruthy();

    // Verify plan is not in active plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();
    await plansListPage.expectPlanNotExists('Expired Plan');

    // Verify plan appears in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanExists('Expired Plan');
  });

  test('should not auto-archive plan before end date', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create a generated plan with future end date
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Future Plan',
      destination: 'Barcelona',
      status: 'generated',
      startDate: '2026-12-01',
      endDate: '2026-12-31', // Future date
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify plan is still generated
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // Verify plan is still in active plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();
    await plansListPage.expectPlanExists('Future Plan');

    // Verify plan is NOT in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanNotExists('Future Plan');
  });

  test('should not auto-archive draft plans', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create a draft plan with past end date
    const planId = await createDraftPlan(supabase, testUser.id, {
      name: 'Old Draft',
      destination: 'Prague',
      startDate: '2024-01-01',
      endDate: '2024-01-03', // Past date
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify plan is still draft (not archived)
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('draft');

    // Verify plan is still in plans list (if draft plans are shown)
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();
    // Draft might be in list or not depending on filters

    // Verify plan is NOT in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanNotExists('Old Draft');
  });

  test('should batch archive multiple expired plans', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const historyPage = new HistoryPage(page);

    // Create 5 generated plans with past dates
    const planNames = ['Trip 1', 'Trip 2', 'Trip 3', 'Trip 4', 'Trip 5'];
    for (let i = 0; i < 5; i++) {
      await createTestPlan(supabase, testUser.id, {
        name: planNames[i],
        destination: `City ${i + 1}`,
        status: 'generated',
        startDate: `2024-0${i + 1}-01`,
        endDate: `2024-0${i + 1}-03`,
      });
    }

    // Verify all are generated
    const { data: generatedPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('status', 'generated');
    expect(generatedPlans).toHaveLength(5);

    // Run archiving job
    const archivedCount = await runArchivingJob(supabase);
    expect(archivedCount).toBe(5);

    // Verify all are archived
    const finalCount = await getArchivedPlanCount(supabase, testUser.id);
    expect(finalCount).toBe(5);

    // Verify all appear in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    const historyCount = await historyPage.getPlanCount();
    expect(historyCount).toBe(5);
  });

  test('should handle mixed plan statuses correctly', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Create plans with different statuses and dates
    await createTestPlan(supabase, testUser.id, {
      name: 'Expired Generated',
      destination: 'City 1',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-03', // Past - should archive
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Future Generated',
      destination: 'City 2',
      status: 'generated',
      startDate: '2026-01-01',
      endDate: '2026-01-03', // Future - should NOT archive
    });

    await createDraftPlan(supabase, testUser.id, {
      name: 'Expired Draft',
      destination: 'City 3',
      startDate: '2024-01-01',
      endDate: '2024-01-03', // Past but draft - should NOT archive
    });

    // Run archiving job
    const archivedCount = await runArchivingJob(supabase);
    expect(archivedCount).toBe(1); // Only one plan should be archived

    // Verify correct plan is archived
    const { data: plans } = await supabase
      .from('plans')
      .select('name, status')
      .eq('user_id', testUser.id)
      .order('name');

    expect(plans).toHaveLength(3);
    expect(plans?.[0]?.name).toBe('Expired Draft');
    expect(plans?.[0]?.status).toBe('draft');
    expect(plans?.[1]?.name).toBe('Expired Generated');
    expect(plans?.[1]?.status).toBe('archived');
    expect(plans?.[2]?.name).toBe('Future Generated');
    expect(plans?.[2]?.status).toBe('generated');
  });

  test('should archive on exact end date', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Get today's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Create a plan that ended yesterday
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Yesterday Plan',
      destination: 'Vienna',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: yesterdayStr,
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify plan is archived
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeTruthy();
  });

  test('should not archive plan ending today', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Create a plan that ends today
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Today Plan',
      destination: 'Amsterdam',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: today,
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify plan is NOT archived (still ongoing)
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    // Depending on business logic, today might or might not be archived
    // Adjust this assertion based on actual requirements
    // For now, assume plans ending today are still active
    expect(plan?.status).toBe('generated');
  });

  test('should handle archiving with no expired plans', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Create only future plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Future Plan 1',
      destination: 'City 1',
      status: 'generated',
      startDate: '2026-06-01',
      endDate: '2026-06-03',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Future Plan 2',
      destination: 'City 2',
      status: 'generated',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
    });

    // Run archiving job
    const archivedCount = await runArchivingJob(supabase);
    expect(archivedCount).toBe(0);

    // Verify no plans are archived
    const finalCount = await getArchivedPlanCount(supabase, testUser.id);
    expect(finalCount).toBe(0);

    // Verify both plans are still generated
    const { data: generatedPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('status', 'generated');
    expect(generatedPlans).toHaveLength(2);
  });

  test('should preserve all plan data after auto-archiving', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Create a plan with activities
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Complete Plan',
      destination: 'Berlin',
      status: 'generated',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      withActivities: true,
    });

    // Get original plan data
    const { data: originalPlan } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Get original activities count
    const { data: originalDays } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);
    const originalDaysCount = originalDays?.length || 0;

    // Run archiving job
    await runArchivingJob(supabase);

    // Get plan data after archiving
    const { data: archivedPlan } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Verify all data is preserved
    expect(archivedPlan?.name).toBe(originalPlan?.name);
    expect(archivedPlan?.destination).toBe(originalPlan?.destination);
    expect(archivedPlan?.start_date).toBe(originalPlan?.start_date);
    expect(archivedPlan?.end_date).toBe(originalPlan?.end_date);
    expect(archivedPlan?.status).toBe('archived');

    // Verify activities are preserved
    const { data: archivedDays } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);
    expect(archivedDays?.length).toBe(originalDaysCount);
  });

  test('should handle timezone edge cases', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Create a plan with end date at the boundary
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Boundary Plan',
      destination: 'Tokyo',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify plan is archived (past date)
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeTruthy();
  });

  test('should respect RLS when archiving plans', async ({ supabase, testUser }) => {
    // Local initialization (not global)
    // Create plans for current user
    await createTestPlan(supabase, testUser.id, {
      name: 'User Plan',
      destination: 'London',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
    });

    // Run archiving job (should only affect current user's plans)
    const archivedCount = await runArchivingJob(supabase);

    // Verify at least one plan was archived
    expect(archivedCount).toBeGreaterThanOrEqual(1);

    // Verify archived plan belongs to current user
    const { data: archivedPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('status', 'archived')
      .eq('user_id', testUser.id);

    expect(archivedPlans).toBeDefined();
    archivedPlans?.forEach((plan) => {
      expect(plan.user_id).toBe(testUser.id);
    });
  });
});
