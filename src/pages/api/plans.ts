import type { APIRoute } from "astro";
import { createPlanSchema, listPlansQuerySchema } from "@/lib/schemas/plan.schema";
import { createPlan, getPlans } from "@/lib/services/plan.service";
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";
import { ForbiddenError } from "@/lib/errors/app-error";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

/**
 * GET /api/plans
 * Retrieves a paginated list of travel plans for the authenticated user.
 *
 * Query parameters should conform to listPlansQuerySchema.
 * Returns a paginated list of plans with status 200 on success.
 */
export const GET: APIRoute = async ({ url, request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn("Unauthenticated request to list plans");
      throw new ForbiddenError("You must be logged in to view plans.");
    }
    const userId = user.id;
    logger.debug("Received request to list plans", { userId });
    const queryParams = {
      statuses: url.searchParams.get("statuses"),
      sort_by: url.searchParams.get("sort_by"),
      order: url.searchParams.get("order"),
      limit: url.searchParams.get("limit"),
      offset: url.searchParams.get("offset"),
    };
    const validation = listPlansQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      logger.debug("Query parameter validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError("Invalid query parameters", validation.error.flatten());
    }
    const result = await getPlans(supabase, userId, {
      ...validation.data,
      status: validation.data.statuses,
    });
    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "GET /api/plans",
      userId: "unauthenticated",
    });
  }
};

/**
 * POST /api/plans
 * Creates a new travel plan.
 *
 * Request body should conform to CreatePlanCommand schema.
 * Returns the created plan with status 201 on success.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn("Unauthenticated request to create plan");
      throw new ForbiddenError("You must be logged in to create a plan.");
    }
    const userId = user.id;
    logger.debug("Received request to create plan", { userId });
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn("Failed to parse request body", {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new ValidationError("Invalid JSON in request body");
    }
    const validation = createPlanSchema.safeParse(body);
    if (!validation.success) {
      logger.debug("Request validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError("Validation failed", validation.error.flatten());
    }
    const plan = await createPlan(supabase, validation.data, userId);
    return successResponse(plan, 201);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "POST /api/plans",
      userId: "unauthenticated",
    });
  }
};
