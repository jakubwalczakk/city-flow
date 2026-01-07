import { feedbackTest as test, expect } from '../shared-user-fixtures';
import { createPlanWithActivities, getFeedback } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

/**
 * E2E Tests for Submitting Feedback Comments
 * Tests the text comment functionality of the feedback system
 */

test.describe('Feedback Comments', () => {
  test('should allow adding comment without rating', async ({ page, supabase, sharedUser }) => {
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

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Write comment without rating
    const commentText = 'Plan był zbyt zagęszczony';
    await planDetailsPage.feedbackModule.writeComment(commentText);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify feedback saved in database
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.comment).toBe(commentText);
    expect(feedback?.rating).toBeNull();
  });

  test('should allow adding comment with positive rating', async ({ page, supabase, sharedUser }) => {
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

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate positively and add comment
    await planDetailsPage.feedbackModule.ratePositive();
    const commentText = 'Świetny plan, wszystko działało!';
    await planDetailsPage.feedbackModule.writeComment(commentText);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify feedback saved with both rating and comment
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.rating).toBe('positive');
    expect(feedback?.comment).toBe(commentText);
  });

  test('should allow adding comment with negative rating', async ({ page, supabase, sharedUser }) => {
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

    // Rate negatively and add comment
    await planDetailsPage.feedbackModule.rateNegative();
    const commentText = 'Zbyt mało czasu na jedzenie';
    await planDetailsPage.feedbackModule.writeComment(commentText);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify feedback saved
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.rating).toBe('negative');
    expect(feedback?.comment).toBe(commentText);
  });

  test('should allow updating existing comment', async ({ page, supabase, sharedUser }) => {
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

    // Submit initial comment
    const initialComment = 'Pierwotny komentarz';
    await planDetailsPage.feedbackModule.writeComment(initialComment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Get initial feedback ID
    const initialFeedback = await getFeedback(supabase, sharedUser.id, planId);
    const initialFeedbackId = initialFeedback?.id;
    expect(initialFeedback?.comment).toBe(initialComment);

    // Update comment
    const updatedComment = 'Zaktualizowany komentarz';
    await planDetailsPage.feedbackModule.writeComment(updatedComment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify feedback updated (not created new)
    const updatedFeedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(updatedFeedback?.id).toBe(initialFeedbackId); // Same ID = UPDATE
    expect(updatedFeedback?.comment).toBe(updatedComment);
  });

  test('should handle empty comment submission', async ({ page, supabase, sharedUser }) => {
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

    // Rate without comment
    await planDetailsPage.feedbackModule.ratePositive();
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify feedback saved with rating but without comment
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback).not.toBeNull();
    expect(feedback?.rating).toBe('positive');
    expect(feedback?.comment).toBeNull();
  });

  test('should validate maximum comment length', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
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

    // Try to submit very long comment (2000 characters)
    const longComment = 'A'.repeat(2000);
    await planDetailsPage.feedbackModule.writeComment(longComment);

    // Check if textarea has maxlength attribute
    const maxLength = await planDetailsPage.feedbackModule.commentTextarea.getAttribute('maxlength');

    if (maxLength) {
      // If maxlength is set, verify comment is truncated
      const actualComment = await planDetailsPage.feedbackModule.getComment();
      expect(actualComment.length).toBeLessThanOrEqual(parseInt(maxLength));
    } else {
      // If no maxlength, try submitting and expect error or server validation
      await planDetailsPage.feedbackModule.submitFeedback();

      // Check for error message or verify database constraint
      const hasError = await planDetailsPage.feedbackModule.hasErrorMessage();
      if (!hasError) {
        // If no UI error, verify database enforced constraint
        const feedback = await getFeedback(supabase, sharedUser.id, planId);
        if (feedback?.comment) {
          expect(feedback.comment.length).toBeLessThanOrEqual(1000);
        }
      }
    }
  });

  test('should allow submitting comment after changing rating', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
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
    await planDetailsPage.goto(planId);
    await planDetailsPage.scrollToFeedback();

    // Rate positively
    await planDetailsPage.feedbackModule.ratePositive();

    // Add comment
    const comment = 'Great plan with nice pace';
    await planDetailsPage.feedbackModule.writeComment(comment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Change to negative rating
    await planDetailsPage.feedbackModule.rateNegative();

    // Update comment
    const updatedComment = 'Changed my mind, too rushed';
    await planDetailsPage.feedbackModule.writeComment(updatedComment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Verify both rating and comment updated
    const feedback = await getFeedback(supabase, sharedUser.id, planId);
    expect(feedback?.rating).toBe('negative');
    expect(feedback?.comment).toBe(updatedComment);
  });

  test('should preserve comment when changing rating', async ({ page, supabase, sharedUser }) => {
    // Create a generated plan
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Brussels Trip',
      destination: 'Brussels',
      startDate: '2027-02-01',
      days: [
        {
          date: '2027-02-01',
          activities: [
            {
              title: 'Grand Place',
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

    // Submit with positive rating and comment
    await planDetailsPage.feedbackModule.ratePositive();
    const comment = 'Nice itinerary';
    await planDetailsPage.feedbackModule.writeComment(comment);
    await planDetailsPage.feedbackModule.submitFeedback();

    // Just change rating (without resubmitting)
    await planDetailsPage.feedbackModule.rateNegative();

    // Verify rating changed but comment preserved in UI
    expect(await planDetailsPage.feedbackModule.isThumbsDownActive()).toBe(true);
    expect(await planDetailsPage.feedbackModule.getComment()).toBe(comment);
  });
});
