import type { APIRoute } from 'astro';
import { submitFeedbackSchema } from '@/lib/schemas/feedback.schema';
import { FeedbackService } from '@/lib/services/feedback.service';
import { AuthService } from '@/lib/services/auth.service';
import { ValidationError, NotFoundError } from '@/lib/errors/app-error';
import { handleApiError, successResponse } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/plans/[planId]/feedback
 * Retrieves the user's feedback for a specific plan.
 *
 * Returns the feedback with status 200 on success.
 * Returns 200 with null if no feedback has been submitted yet.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();
    const planId = params.planId;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to get feedback', {
      userId,
      planId,
    });

    const feedbackService = new FeedbackService(locals);
    const feedback = await feedbackService.getFeedback(planId, userId);

    return successResponse(feedback, 200);
  } catch (error) {
    // If feedback doesn't exist yet, return null instead of error
    // This is a normal state for newly generated plans
    if (error instanceof NotFoundError) {
      logger.debug('No feedback found for plan, returning null', {
        userId: 'authenticated_user',
        planId: params.planId,
      });
      return successResponse(null, 200);
    }

    return handleApiError(error, {
      endpoint: 'GET /api/plans/[planId]/feedback',
      userId: 'unauthenticated',
    });
  }
};

/**
 * POST /api/plans/[planId]/feedback
 * Submits or updates feedback for a plan (upsert operation).
 *
 * Request body should conform to SubmitFeedbackCommand schema.
 * Returns the created/updated feedback with status 201 (new) or 200 (updated).
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();
    const planId = params.planId;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to submit feedback', {
      userId,
      planId,
    });

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn('Failed to parse request body', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate request body
    const validation = submitFeedbackSchema.safeParse(body);

    if (!validation.success) {
      logger.debug('Request validation failed', {
        errors: validation.error.flatten(),
      });
      throw new ValidationError('Validation failed', validation.error.flatten());
    }

    // Check if feedback already exists to determine response code
    const feedbackService = new FeedbackService(locals);
    let isUpdate = false;
    try {
      await feedbackService.getFeedback(planId, userId);
      isUpdate = true;
    } catch {
      // Feedback doesn't exist yet, will be created
    }

    // Submit the feedback
    const feedback = await feedbackService.submitFeedback(planId, userId, validation.data);

    return successResponse(feedback, isUpdate ? 200 : 201);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'POST /api/plans/[planId]/feedback',
      userId: 'unauthenticated',
    });
  }
};

export const prerender = false;
