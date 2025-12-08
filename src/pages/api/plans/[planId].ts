import type { APIRoute } from 'astro';
import { updatePlanSchema } from '@/lib/schemas/plan.schema';
import { PlanService } from '@/lib/services/plan.service';
import { AuthService } from '@/lib/services/auth.service';
import { ValidationError } from '@/lib/errors/app-error';
import { handleApiError, successResponse } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/plans/[planId]
 * Retrieves detailed information about a specific travel plan.
 *
 * Returns the plan with status 200 on success.
 * Returns 404 if the plan is not found.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();
    const planId = params.planId;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to get plan details', {
      userId,
      planId,
    });

    const planService = new PlanService(locals);
    const plan = await planService.getPlanById(planId, userId);

    return successResponse(plan, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'GET /api/plans/[planId]',
      userId: 'unauthenticated',
    });
  }
};

/**
 * PATCH /api/plans/[planId]
 * Updates an existing travel plan.
 *
 * Request body should conform to UpdatePlanCommand schema.
 * Returns the updated plan with status 200 on success.
 * Returns 404 if the plan is not found.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();
    const planId = params.planId;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to update plan', {
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
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      logger.debug('Request validation failed', {
        errors: validation.error.flatten(),
      });
      throw new ValidationError('Validation failed', validation.error.flatten());
    }

    // Update the plan
    const planService = new PlanService(locals);
    // Note: updatePlan in service should ideally check ownership or rely on RLS.
    // Since we use the authenticated client, RLS should apply.
    const plan = await planService.updatePlan(planId, validation.data);

    return successResponse(plan, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'PATCH /api/plans/[planId]',
      userId: 'unauthenticated',
    });
  }
};

/**
 * DELETE /api/plans/[planId]
 * Deletes a travel plan.
 *
 * Returns 204 No Content on success.
 * Returns 404 if the plan is not found.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();
    const planId = params.planId;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to delete plan', {
      userId,
      planId,
    });

    const planService = new PlanService(locals);
    await planService.deletePlan(planId, userId);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'DELETE /api/plans/[planId]',
      userId: 'unauthenticated',
    });
  }
};
