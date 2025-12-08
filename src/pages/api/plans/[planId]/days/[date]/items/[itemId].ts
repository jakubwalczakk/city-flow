import type { APIRoute } from 'astro';
import { z } from 'zod';
import { PlanService } from '@/lib/services/plan.service';
import { AuthService } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/utils/error-handler';
import type { UpdateActivityCommand } from '@/types';

export const prerender = false;

// Validation schema for updating an activity
const updateActivitySchema = z.object({
  time: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().positive().optional(),
  category: z.enum(['history', 'food', 'sport', 'nature', 'culture', 'transport', 'accommodation', 'other']).optional(),
  estimated_cost: z.string().optional(),
});

/**
 * PATCH /api/plans/{planId}/days/{date}/items/{itemId}
 * Updates an existing activity in a plan day.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { planId, date, itemId } = params;

    if (!planId || !date || !itemId) {
      return new Response(JSON.stringify({ error: 'Plan ID, date, and item ID are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(locals);
    const userId = await authService.getUserId();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateActivitySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed.',
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const command: UpdateActivityCommand = validationResult.data;

    // Update the activity
    const planService = new PlanService(locals);
    const updatedPlan = await planService.updateActivityInPlanDay(planId, date, itemId, command, userId);

    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * DELETE /api/plans/{planId}/days/{date}/items/{itemId}
 * Deletes an activity from a plan day.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { planId, date, itemId } = params;

    if (!planId || !date || !itemId) {
      return new Response(JSON.stringify({ error: 'Plan ID, date, and item ID are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(locals);
    const userId = await authService.getUserId();

    // Delete the activity
    const planService = new PlanService(locals);
    const updatedPlan = await planService.deleteActivityFromPlanDay(planId, date, itemId, userId);

    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
