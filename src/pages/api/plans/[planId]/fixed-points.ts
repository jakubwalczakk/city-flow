import type { APIRoute } from 'astro';
import { DEFAULT_USER_ID } from '@/db/supabase.client';
import { createFixedPointSchema } from '@/lib/schemas/fixed-point.schema';
import { FixedPointService } from '@/lib/services/fixed-point.service';
import { ValidationError } from '@/lib/errors/app-error';
import { handleApiError, successResponse } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/plans/{planId}/fixed-points
 * Retrieves all fixed points for a specific plan.
 *
 * Returns a list of fixed points with status 200 on success.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { supabase } = locals;
    const user = { id: DEFAULT_USER_ID };
    const { planId } = params;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to list fixed points', {
      userId: user.id,
      planId,
    });

    const fixedPointService = new FixedPointService(supabase);
    const fixedPoints = await fixedPointService.getFixedPointsByPlanId(planId);

    return successResponse(fixedPoints, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'GET /api/plans/{planId}/fixed-points',
      userId: DEFAULT_USER_ID,
    });
  }
};

/**
 * POST /api/plans/{planId}/fixed-points
 * Creates a new fixed point for a specific plan.
 *
 * Request body should conform to CreateFixedPointCommand schema.
 * Returns the created fixed point with status 201 on success.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { supabase } = locals;
    const user = { id: DEFAULT_USER_ID };
    const { planId } = params;

    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    logger.debug('Received request to create fixed point', {
      userId: user.id,
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
    const validation = createFixedPointSchema.safeParse(body);

    if (!validation.success) {
      logger.debug('Request validation failed', {
        errors: validation.error.flatten(),
      });
      throw new ValidationError('Validation failed', validation.error.flatten());
    }

    // Create the fixed point
    const fixedPointService = new FixedPointService(supabase);
    const fixedPoint = await fixedPointService.createFixedPoint(
      planId,
      {
        ...validation.data,
        event_duration: validation.data.event_duration ?? null,
      },
      user.id
    );

    return successResponse(fixedPoint, 201);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'POST /api/plans/{planId}/fixed-points',
      userId: DEFAULT_USER_ID,
    });
  }
};

export const prerender = false;
