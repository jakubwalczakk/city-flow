import type { APIRoute } from "astro";
import { z } from "zod";
import { planSchema } from "@/lib/schemas/plan.schema";
import { updatePlan, deletePlan } from "@/lib/services/plan.service";
import { handleApiError } from "@/lib/errors";

const updatePlanSchema = planSchema.pick({
  name: true,
  destination: true,
  start_date: true,
  end_date: true,
  notes: true,
});

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const { planId } = params;

  if (!planId) {
    return new Response(
      JSON.stringify({ error: "Plan ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await request.json();
    const validatedData = updatePlanSchema.parse(data);

    await updatePlan(locals.supabase, planId, validatedData);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error updating plan:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update plan" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { planId } = params;

  if (!planId) {
    return new Response(
      JSON.stringify({ error: "Plan ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await deletePlan(locals.supabase, planId, locals.user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
};
