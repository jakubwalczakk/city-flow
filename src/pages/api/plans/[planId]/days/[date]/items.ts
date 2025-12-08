import type { APIRoute } from "astro";
import { z } from "zod";
import type { AddActivityCommand } from "@/types";
import { PlanService } from "@/lib/services/plan.service";
import { handleApiError } from "@/lib/utils/error-handler";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

// Validation schema for adding an activity
const addActivitySchema = z.object({
  time: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().positive().optional(),
  category: z.enum(["history", "food", "sport", "nature", "culture", "transport", "accommodation", "other"]),
  estimated_cost: z.string().optional(),
});

/**
 * POST /api/plans/{planId}/days/{date}/items
 * Adds a new activity to a specific day in the plan.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { planId, date } = params;

    if (!planId || !date) {
      return new Response(JSON.stringify({ error: "Plan ID and date are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = addActivitySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed.",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const command: AddActivityCommand = validationResult.data;

    // Get Supabase client from locals (set by middleware)
    const { supabase } = locals;

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database connection not available." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add the activity to the plan
    const planService = new PlanService(supabase);
    const updatedPlan = await planService.addActivityToPlanDay(planId, date, command, DEFAULT_USER_ID);

    return new Response(JSON.stringify(updatedPlan), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
