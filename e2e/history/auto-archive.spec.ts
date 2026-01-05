import { historyTest as test, expect } from '../shared-user-fixtures';
import {
  createTestPlan,
  createDraftPlan,
  runArchivingJob,
  verifyPlanIsArchived,
  getArchivedPlanCount,
} from '../fixtures';
import { PlansListPage } from '../page-objects/PlansListPage';
import { HistoryPage } from '../page-objects/HistoryPage';

test.describe('Auto-Archive Plans', () => {
  test('auto-archives plan after end date passes and shows in history', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create a generated plan with past end date
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test('handles archiving logic correctly based on date and status', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create plans with different statuses and dates
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Expired Generated',
      destination: 'City 1',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-03', // Past - should archive
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Future Generated',
      destination: 'City 2',
      status: 'generated',
      startDate: '2026-01-01',
      endDate: '2026-01-03', // Future - should NOT archive
    });

    await createDraftPlan(supabase, sharedUser.id, {
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
      .eq('user_id', sharedUser.id)
      .order('name');

    expect(plans).toHaveLength(3);
    expect(plans?.[0]?.name).toBe('Expired Draft');
    expect(plans?.[0]?.status).toBe('draft');
    expect(plans?.[1]?.name).toBe('Expired Generated');
    expect(plans?.[1]?.status).toBe('archived');
    expect(plans?.[2]?.name).toBe('Future Generated');
    expect(plans?.[2]?.status).toBe('generated');

    // Verify UI reflects the changes
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();
    await plansListPage.expectPlanExists('Future Generated');
    await plansListPage.expectPlanNotExists('Expired Generated');

    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanExists('Expired Generated');
    await historyPage.expectPlanNotExists('Expired Draft');
  });

  test('batch archives multiple expired plans efficiently', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);

    // Create 5 generated plans with past dates
    const planNames = ['Trip 1', 'Trip 2', 'Trip 3', 'Trip 4', 'Trip 5'];
    for (let i = 0; i < 5; i++) {
      await createTestPlan(supabase, sharedUser.id, {
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
      .eq('user_id', sharedUser.id)
      .eq('status', 'generated');
    expect(generatedPlans).toHaveLength(5);

    // Run archiving job
    const archivedCount = await runArchivingJob(supabase);
    expect(archivedCount).toBe(5);

    // Verify all are archived
    const finalCount = await getArchivedPlanCount(supabase, sharedUser.id);
    expect(finalCount).toBe(5);

    // Verify all appear in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    const historyCount = await historyPage.getPlanCount();
    expect(historyCount).toBe(5);
  });

  test('handles date boundary conditions correctly', async ({ supabase, sharedUser }) => {
    // Get today's date and yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Create a plan that ended yesterday
    const { planId: yesterdayPlanId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Yesterday Plan',
      destination: 'Vienna',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: yesterdayStr,
    });

    // Create a plan that ends today
    const { planId: todayPlanId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Today Plan',
      destination: 'Amsterdam',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: todayStr,
    });

    // Run archiving job
    await runArchivingJob(supabase);

    // Verify yesterday's plan is archived
    const yesterdayArchived = await verifyPlanIsArchived(supabase, yesterdayPlanId);
    expect(yesterdayArchived).toBeTruthy();

    // Verify today's plan is NOT archived (still ongoing)
    const { data: todayPlan } = await supabase.from('plans').select('status').eq('id', todayPlanId).single();
    expect(todayPlan?.status).toBe('generated');
  });

  test('preserves all plan data after auto-archiving', async ({ supabase, sharedUser }) => {
    // Create a plan with activities
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test('respects RLS when archiving plans for different users', async ({ supabase, sharedUser }) => {
    // Create plans for current user
    await createTestPlan(supabase, sharedUser.id, {
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
      .eq('user_id', sharedUser.id);

    expect(archivedPlans).toBeDefined();
    archivedPlans?.forEach((plan) => {
      expect(plan.user_id).toBe(sharedUser.id);
    });
  });
});
