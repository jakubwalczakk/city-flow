import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { updateFixedPointSchema } from "@/lib/schemas/fixed-point.schema";
import {
  updateFixedPoint,
  deleteFixedPoint,
} from "@/lib/services/fixed-point.service";
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

/**
 * PATCH /api/plans/{planId}/fixed-points/{id}
 * Updates a specific fixed point.
 *
 * Request body should conform to UpdateFixedPointCommand schema.
 * Returns the updated fixed point with status 200 on success.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };
    const { planId, id } = params;

    if (!planId || !id) {
      throw new ValidationError("Plan ID and Fixed Point ID are required");
    }

    logger.debug("Received request to update fixed point", {
      userId: user.id,
      planId,
      fixedPointId: id,
    });

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn("Failed to parse request body", {
        error:
          parseError instanceof Error
            ? parseError.message
            : String(parseError),
      });
      throw new ValidationError("Invalid JSON in request body");
    }

    // Validate request body
    const validation = updateFixedPointSchema.safeParse(body);

    if (!validation.success) {
      logger.debug("Request validation failed", {
        errors: validation.error.flatten(),
      });
      throw new ValidationError(
        "Validation failed",
        validation.error.flatten()
      );
    }

    // Update the fixed point
    const fixedPoint = await updateFixedPoint(
      supabase,
      planId,
      id,
      validation.data,
      user.id
    );

    return successResponse(fixedPoint, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "PATCH /api/plans/{planId}/fixed-points/{id}",
      userId: DEFAULT_USER_ID,
    });
  }
};

/**
 * DELETE /api/plans/{planId}/fixed-points/{id}
 * Deletes a specific fixed point.
 *
 * Returns status 204 on success.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = { id: DEFAULT_USER_ID };
    const { planId, id } = params;

    if (!planId || !id) {
      throw new ValidationError("Plan ID and Fixed Point ID are required");
    }

    logger.debug("Received request to delete fixed point", {
      userId: user.id,
      planId,
      fixedPointId: id,
    });

    // Delete the fixed point
    await deleteFixedPoint(supabase, planId, id, user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "DELETE /api/plans/{planId}/fixed-points/{id}",
      userId: DEFAULT_USER_ID,
    });
  }
};

export const prerender = false;

