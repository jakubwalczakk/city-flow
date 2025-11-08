import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { updatePlanSchema } from "@/lib/schemas/plan.schema";
import { getPlanById, updatePlan, deletePlan } from "@/lib/services/plan.service";
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/plans/[id]
 * Retrieves detailed information about a specific travel plan.
 *
 * Returns the plan with status 200 on success.
 * Returns 404 if the plan is not found.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };
    const planId = params.id;

    if (!planId) {
      throw new ValidationError("Plan ID is required");
    }

    logger.debug("Received request to get plan details", {
      userId: user.id,
      planId,
    });

    const plan = await getPlanById(supabase, planId, user.id);

    return successResponse(plan, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "GET /api/plans/[id]",
      userId: DEFAULT_USER_ID,
    });
  }
};

/**
 * PATCH /api/plans/[id]
 * Updates an existing travel plan.
 *
 * Request body should conform to UpdatePlanCommand schema.
 * Returns the updated plan with status 200 on success.
 * Returns 404 if the plan is not found.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };
    const planId = params.id;

    if (!planId) {
      throw new ValidationError("Plan ID is required");
    }

    logger.debug("Received request to update plan", {
      userId: user.id,
      planId,
    });

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn("Failed to parse request body", {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new ValidationError("Invalid JSON in request body");
    }

    // Validate request body
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      logger.debug("Request validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError("Validation failed", validation.error.flatten());
    }

    // Update the plan
    const plan = await updatePlan(supabase, planId, validation.data);

    return successResponse(plan, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "PATCH /api/plans/[id]",
      userId: DEFAULT_USER_ID,
    });
  }
};

/**
 * DELETE /api/plans/[id]
 * Deletes a travel plan.
 *
 * Returns 204 No Content on success.
 * Returns 404 if the plan is not found.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };
    const planId = params.id;

    if (!planId) {
      throw new ValidationError("Plan ID is required");
    }

    logger.debug("Received request to delete plan", {
      userId: user.id,
      planId,
    });

    await deletePlan(supabase, planId, user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "DELETE /api/plans/[id]",
      userId: DEFAULT_USER_ID,
    });
  }
};

export const prerender = false;

