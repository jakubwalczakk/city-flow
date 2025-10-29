import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { createPlanSchema, listPlansQuerySchema } from "@/lib/schemas/plan.schema";
import { createPlan, getPlans } from "@/lib/services/plan.service";
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/plans
 * Retrieves a paginated list of travel plans for the authenticated user.
 *
 * Query parameters should conform to listPlansQuerySchema.
 * Returns a paginated list of plans with status 200 on success.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // In development, use a default user ID since we are not handling authorization yet.
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };

    logger.debug("Received request to list plans", { userId: user.id });

    // Extract and parse query parameters
    const queryParams = {
      status: url.searchParams.get("status"),
      sort_by: url.searchParams.get("sort_by"),
      order: url.searchParams.get("order"),
      limit: url.searchParams.get("limit"),
      offset: url.searchParams.get("offset"),
    };

    // Validate query parameters
    const validation = listPlansQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      logger.debug("Query parameter validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError("Invalid query parameters", validation.error.flatten());
    }

    // Fetch the plans
    const result = await getPlans(supabase, user.id, validation.data);

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "GET /api/plans",
      userId: DEFAULT_USER_ID,
    });
  }
};

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
