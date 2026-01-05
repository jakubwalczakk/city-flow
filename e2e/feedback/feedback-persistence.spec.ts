import { authTest as test, expect, createPlanWithActivities, createFeedback, getFeedback } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

/**
 * E2E Tests for Feedback Persistence
 * Tests that feedback is saved, loaded, and displayed correctly across sessions
 */

test.describe('Feedback Persistence', () => {
  test('should preserve feedback after page refresh', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
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

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Submit feedback with rating and comment
    await planDetailsPage.feedbackModule.ratePositive();
    const commentText = 'Excellent plan!';
    await planDetailsPage.feedbackModule.writeComment(commentText);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Refresh the page
    await page.reload();
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.scrollToFeedback();

    // Verify feedback is still visible
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe(commentText);

    // Verify in database
    const feedback = await getFeedback(supabase, testUser.id, planId);
    expect(feedback?.rating).toBe('positive');
    expect(feedback?.comment).toBe(commentText);
  });

  test('should preserve feedback when navigating away and back', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
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

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Submit feedback
    await planDetailsPage.feedbackModule.rateNegative();
    const commentText = 'Too crowded schedule';
    await planDetailsPage.feedbackModule.writeComment(commentText);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Navigate to plans list
    const plansListPage = new PlansListPage(page);
    await plansListPage.goto();

    // Navigate back to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Verify feedback is preserved
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe(commentText);
  });

  test('should allow each user to have separate feedback for same plan', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
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

    // User 1 submits feedback
    await planDetailsPage.feedbackModule.ratePositive();
    const user1Comment = 'User 1 loves this plan';
    await planDetailsPage.feedbackModule.writeComment(user1Comment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify User 1 feedback
    const user1Feedback = await getFeedback(supabase, testUser.id, planId);
    expect(user1Feedback?.rating).toBe('positive');
    expect(user1Feedback?.comment).toBe(user1Comment);

    // Create second user and give them access to the plan (if needed)
    // Note: In real scenario, this would be a shared plan or RLS would prevent access
    // For this test, we'll create feedback directly in DB to simulate
    const user2 = await createTestUser(supabase, {
      email: `user2-${Date.now()}@test.com`,
      password: 'TestPassword123!',
    });

    try {
      // Create User 2 feedback for the same plan (simulating separate access)
      await createFeedback(supabase, user2.user.id, planId, 'negative', 'User 2 dislikes this plan');

      // Verify both feedbacks exist
      const user1FeedbackCheck = await getFeedback(supabase, testUser.id, planId);
      const user2FeedbackCheck = await getFeedback(supabase, user2.user.id, planId);

      expect(user1FeedbackCheck?.rating).toBe('positive');
      expect(user1FeedbackCheck?.comment).toBe(user1Comment);
      expect(user2FeedbackCheck?.rating).toBe('negative');
      expect(user2FeedbackCheck?.comment).toBe('User 2 dislikes this plan');

      // Verify they have different IDs
      expect(user1FeedbackCheck?.id).not.toBe(user2FeedbackCheck?.id);
    } finally {
      // Clean up user 2
      await deleteTestUser(supabase, user2.user.id);
    }
  });

  test('should not show other users feedback', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
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

    // User 1 visits plan (no feedback yet)
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Verify no rating is active
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(false);
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(false);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe('');

    // Create another user with feedback for this plan
    const user2 = await createTestUser(supabase, {
      email: `user2-${Date.now()}@test.com`,
      password: 'TestPassword123!',
    });

    try {
      // User 2 creates feedback
      await createFeedback(supabase, user2.user.id, planId, 'negative', 'User 2 comment');

      // Refresh page as User 1
      await page.reload();
      await planDetailsPage.waitForPageLoad();
      await planDetailsPage.scrollToFeedback();

      // User 1 should still see no feedback (only their own)
      expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(false);
      expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(false);
      expect(await planDetailsPage.feedbackModule.getComment()).toBe('');
    } finally {
      // Clean up user 2
      await deleteTestUser(supabase, user2.user.id);
    }
  });

  test('should load existing feedback on page load', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
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

    // Create feedback directly in database
    await createFeedback(supabase, testUser.id, planId, 'positive', 'Pre-existing feedback');

    // Visit plan page
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Verify feedback is loaded from database
    expect(await planDetailsPage.feedbackModule.isThumbsUpActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe('Pre-existing feedback');
  });

  test('should update existing feedback when resubmitting', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
      name: 'Vienna Trip',
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
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Submit initial feedback
    await planDetailsPage.feedbackModule.ratePositive();
    await planDetailsPage.feedbackModule.writeComment('Initial comment');
    await planDetailsPage.feedbackModule.submitFeedback();

    const initialFeedback = await getFeedback(supabase, testUser.id, planId);
    const initialFeedbackId = initialFeedback?.id;

    // Reload page
    await page.reload();
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.scrollToFeedback();

    // Update feedback
    await planDetailsPage.feedbackModule.rateNegative();
    await planDetailsPage.feedbackModule.writeComment('Updated comment');
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify it's an UPDATE not INSERT
    const updatedFeedback = await getFeedback(supabase, testUser.id, planId);
    expect(updatedFeedback?.id).toBe(initialFeedbackId);
    expect(updatedFeedback?.rating).toBe('negative');
    expect(updatedFeedback?.comment).toBe('Updated comment');
  });

  test('should maintain feedback integrity across multiple page visits', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, testUser.id, {
      name: 'Berlin Weekend',
      destination: 'Berlin',
      startDate: '2027-01-15',
      days: [
        {
          date: '2027-01-15',
          activities: [
            {
              title: 'Brandenburg Gate',
              time: '10:00',
              duration: '1 hour',
              category: 'sightseeing',
            },
          ],
        },
      ],
    });

    const planDetailsPage = new PlanDetailsPage(page);
    const plansListPage = new PlansListPage(page);

    // Visit 1: Submit positive feedback
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();
    await planDetailsPage.feedbackModule.ratePositive();
    await planDetailsPage.feedbackModule.writeComment('Visit 1');
    await planDetailsPage.feedbackModule.submitFeedback();

    // Navigate away
    await plansListPage.goto();

    // Visit 2: Update to negative
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();
    expect(await planDetailsPage.feedbackModule.getComment()).toBe('Visit 1');
    await planDetailsPage.feedbackModule.rateNegative();
    await planDetailsPage.feedbackModule.writeComment('Visit 2');
    await planDetailsPage.feedbackModule.submitFeedback();

    // Navigate away
    await plansListPage.goto();

    // Visit 3: Verify current state
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe('Visit 2');

    // Final database check
    const finalFeedback = await getFeedback(supabase, testUser.id, planId);
    expect(finalFeedback?.rating).toBe('negative');
    expect(finalFeedback?.comment).toBe('Visit 2');
  });
});
