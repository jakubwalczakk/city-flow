import { feedbackTest as test, expect } from '../shared-user-fixtures';
import { createPlanWithActivities, createDraftPlan, getFeedback } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

/**
 * E2E Tests for Rating Plans (Thumbs Up/Down)
 * Tests the feedback rating system with thumbs up/down functionality
 */

test.describe('Plan Rating - Thumbs Up/Down', () => {
  test.skip('should allow rating plan positively with thumbs up', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Paris Weekend',
      destination: 'Paris',
      startDate: '2026-06-15',
      days: [
        {
          date: '2026-06-15',
          activities: [
            {
              title: 'Visit Eiffel Tower',
              time: '10:00',
              duration: '2 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    // Navigate to plan details
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);

    // Scroll to feedback module
    await planDetailsPage.scrollToFeedback();

    // Verify feedback module is visible
    expect(await planDetailsPage.feedbackModule.isVisible()).toBe(true);

    // Rate positively
    await planDetailsPage.feedbackModule.ratePositive();

    // Verify thumbs up is active
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(false);

    // Verify feedback saved in database
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.rating).toBe('positive');
    expect(feedback?.user_id).toBe(sharedUser.id);
    expect(feedback?.plan_id).toBe(planId);
  });

  test.skip('should allow rating plan negatively with thumbs down', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Rome Adventure',
      destination: 'Rome',
      startDate: '2026-07-01',
      days: [
        {
          date: '2026-07-01',
          activities: [
            {
              title: 'Colosseum Tour',
              time: '09:00',
              duration: '3 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    // Navigate to plan details
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate negatively
    await planDetailsPage.feedbackModule.rateNegative();

    // Verify thumbs down is active
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(false);

    // Verify feedback saved in database
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.rating).toBe('negative');
  });

  test.skip('should allow changing rating from positive to negative', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Barcelona Trip',
      destination: 'Barcelona',
      startDate: '2026-08-01',
      days: [
        {
          date: '2026-08-01',
          activities: [
            {
              title: 'Sagrada Familia',
              time: '10:00',
              duration: '2 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate positively first
    await planDetailsPage.feedbackModule.ratePositive();
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);

    // Get initial feedback
    const initialFeedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(initialFeedback?.rating).toBe('positive');
    const initialFeedbackId = initialFeedback?.id;

    // Change to negative
    await planDetailsPage.feedbackModule.rateNegative();
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(false);

    // Verify feedback updated (not created new)
    const updatedFeedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(updatedFeedback?.rating).toBe('negative');
    expect(updatedFeedback?.id).toBe(initialFeedbackId); // Same ID = UPDATE not INSERT
  });

  test.skip('should allow changing rating from negative to positive', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Amsterdam Weekend',
      destination: 'Amsterdam',
      startDate: '2026-09-01',
      days: [
        {
          date: '2026-09-01',
          activities: [
            {
              title: 'Canal Tour',
              time: '11:00',
              duration: '1.5 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate negatively first
    await planDetailsPage.feedbackModule.rateNegative();
    const initialFeedback = await getFeedback(supabase, sharedUser.id, planId);
    const initialFeedbackId = initialFeedback?.id;

    // Change to positive
    await planDetailsPage.feedbackModule.ratePositive();
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(false);

    // Verify feedback updated
    const updatedFeedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(updatedFeedback?.rating).toBe('positive');
    expect(updatedFeedback?.id).toBe(initialFeedbackId);
  });

  test.skip('should not show feedback module for draft plans', async ({ page, supabase, sharedUser }) => {
    // Create a draft plan (not generated)
    const planId = await createDraftPlan(supabase, sharedUser.id, {
      name: 'Draft Plan',
      destination: 'London',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
    });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);

    // Verify plan is draft
    expect(await planDetailsPage.isDraft()).toBe(true);

    // Feedback module should not be visible for draft plans
    expect(await planDetailsPage.feedbackModule.isVisible()).toBe(false);
  });

  test.skip('should preserve rating when clicking same thumb again', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Prague Visit',
      destination: 'Prague',
      startDate: '2026-11-01',
      days: [
        {
          date: '2026-11-01',
          activities: [
            {
              title: 'Old Town Square',
              time: '10:00',
              duration: '2 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate positively
    await planDetailsPage.feedbackModule.ratePositive();
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);

    // Click same thumb again
    await planDetailsPage.feedbackModule.ratePositive();

    // Rating should remain (not be removed)
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);

    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback?.rating).toBe('positive');
  });

  test.skip('should show feedback module only for generated plans', async ({ page, supabase, sharedUser }) => {
    // Create generated plan
    const generatedPlanId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Generated Plan',
      destination: 'Vienna',
      startDate: '2026-12-01',
      days: [
        {
          date: '2026-12-01',
          activities: [
            {
              title: 'Schönbrunn Palace',
              time: '09:00',
              duration: '3 hours',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(generatedPlanId);

    // Verify plan is generated
    expect(await planDetailsPage.isGenerated()).toBe(true);

    // Feedback module should be visible
    expect(await planDetailsPage.feedbackModule.isVisible()).toBe(true);
  });
});
