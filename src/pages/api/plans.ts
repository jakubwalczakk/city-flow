import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { createPlanSchema } from "@/lib/schemas/plan.schema";
import { createPlan } from "@/lib/services/plan.service";
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/plans
 * Creates a new travel plan for the authenticated user.
 *
 * Request body should conform to CreatePlanCommand schema.
 * Returns the created plan with status 201 on success.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // In development, use a default user ID since we are not handling authorization yet.
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };

    logger.debug("Received request to create plan", { userId: user.id });

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
    const validation = createPlanSchema.safeParse(body);

    if (!validation.success) {
      logger.debug("Request validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError("Validation failed", validation.error.flatten());
    }

    // Create the plan
    const plan = await createPlan(supabase, validation.data, user.id);

    return successResponse(plan, 201);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "POST /api/plans",
      userId: DEFAULT_USER_ID,
    });
  }
};
