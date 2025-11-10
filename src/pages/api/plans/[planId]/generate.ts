import type { APIRoute } from "astro";
import { z } from "zod";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ExternalServiceError,
} from "@/lib/errors/app-error";
import type { FixedPointDto } from "@/types";
import { getPlanById, updatePlan } from "@/lib/services/plan.service";
import { OpenRouterService } from "@/lib/services/openrouter.service";
import { logger } from "@/lib/utils/logger";
import { handleApiError } from "@/lib/utils/error-handler";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

// Define the schema for the AI's structured response
const aiTimelineEventSchema = z.object({
  time: z.string().describe("The time of the event in 24-hour HH:mm format (e.g., 18:00, not 6:00 PM)."),
  activity: z.string().describe("A short, descriptive title for the activity."),
  category: z
    .enum([
      "history",
      "food",
      "sport",
      "nature",
      "culture",
      "transport",
      "accommodation",
      "other",
    ])
    .describe("The category of the activity."),
  description: z
    .string()
    .describe("A detailed description of the activity."),
  estimated_price: z
    .string()
    .nullable()
    .describe(
      "An estimated cost, including currency symbol (e.g., '€18', 'Free').",
    ),
});

const aiDayPlanSchema = z.object({
  date: z
    .string()
    .describe("The date for this day's plan in YYYY-MM-DD format."),
  activities: z
    .array(aiTimelineEventSchema)
    .describe("An array of activities for the day."),
});

const aiGeneratedContentSchema = z.object({
  summary: z
    .string()
    .describe(
      "A brief, engaging summary of the entire trip, highlighting the key experiences.",
    ),
  itinerary: z.object({
    destination: z.string(),
    dates: z.object({
      start: z.string(),
      end: z.string(),
    }),
    days: z
      .array(aiDayPlanSchema)
      .describe("An array of daily plans, one for each day of the trip."),
  }),
});

/**
 * Endpoint to generate a detailed travel plan using AI.
 * Takes a draft plan and populates it with a structured itinerary.
 */
export const POST: APIRoute = async ({ params, locals }) => {
  const { planId } = params;
  const { supabase } = locals;
  // TODO: Replace with actual user from session once auth is implemented
  const user = { id: DEFAULT_USER_ID };

  try {
    // 1. Authentication & Authorization
    if (!user) {
      throw new ForbiddenError("You must be logged in to generate a plan.");
    }
    if (!planId) {
      throw new AppError("Plan ID is required.", 400);
    }
    logger.debug(`Starting plan generation for planId: ${planId} by user: ${user.id}`);

    // 2. User Credit Check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("generations_remaining, preferences, travel_pace")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new ExternalServiceError("Failed to retrieve user profile.", new Error(profileError.message));
    }
    if (profile.generations_remaining <= 0) {
      throw new ForbiddenError("You have no plan generations remaining.");
    }

    // 3. Fetch Plan Data
    const plan = await getPlanById(supabase, planId, user.id);
    if (plan.status !== "draft") {
      throw new AppError("This plan has already been generated.", 409);
    }

    // Validate that required dates are present
    if (!plan.start_date || !plan.end_date) {
      throw new AppError("Plan must have both start date and end date to generate.", 400);
    }

    const { data: fixedPoints, error: fixedPointsError } = await supabase
        .from("fixed_points")
        .select("*")
        .eq("plan_id", planId);

    if (fixedPointsError) {
        throw new ExternalServiceError("Failed to retrieve fixed points for the plan.", new Error(fixedPointsError.message));
    }


    // 3. Construct the Prompts for the AI
    const systemPrompt = `
You are an expert travel planner AI. Your task is to generate a detailed, structured travel itinerary based on the user's plan details.
The response MUST be a single JSON object and nothing else. Do not include any introductory text, markdown formatting, or explanations.

The final JSON object MUST have the following root structure. It is critical that you include the "summary" field at the top level.
{
  "summary": "A brief, engaging summary of the entire trip, highlighting the key experiences.",
  "itinerary": {
    "destination": "...",
    "dates": { "start": "...", "end": "..." },
    "days": [
      {
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "time": "HH:mm (24-hour format, e.g., 18:00, NOT 6:00 PM)",
            "activity": "Activity Title",
            "category": "history | food | sport | nature | culture | transport | accommodation | other",
            "description": "Detailed description of the activity.",
            "estimated_price": "e.g., '€18', 'Free', or null"
          }
        ]
      }
    ]
  }
}

IMPORTANT: All times MUST be in 24-hour format (e.g., 09:00, 14:30, 18:00). NEVER use AM/PM format (e.g., NOT 9:00 AM, 2:30 PM, 6:00 PM).

Key requirements for the plan:
- Destination: ${plan.destination}
- Start Date & Time: ${new Date(plan.start_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', hour12: false })}
- End Date & Time: ${new Date(plan.end_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', hour12: false })}
- User Notes: ${plan.notes || "No special notes provided."}
- Fixed Points: The user has scheduled the following non-negotiable events. You MUST incorporate them into the plan at the specified times.
${fixedPoints && fixedPoints.length > 0 ? fixedPoints.map((fp) => `- ${new Date(fp.event_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: false })}: ${fp.location} - ${fp.description || "No description"}`).join("\n") : "No fixed points scheduled."}

Generate a plan that is logical, engaging, and takes into account travel times between locations. Be creative and suggest interesting activities, restaurants, and sights.
`;

    const userPrompt = `
Please generate the travel plan now based on the provided details. Ensure the output is a valid JSON object matching the required structure.
`;
    // 4. Call the OpenRouter Service
    const openRouterService = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
    });

    const generatedContent = await openRouterService.getStructuredResponse({
      systemPrompt,
      userPrompt,
      responseSchema: aiGeneratedContentSchema,
    });

    // 5. Transform AI response for database storage
    const contentForDb = {
      summary: generatedContent.summary,
      days: generatedContent.itinerary.days.map((day) => ({
        date: day.date,
        // The database expects an 'items' array, not 'activities'
        items: day.activities.map((activity) => {
          // Map category to type for database validation
          const type = activity.category === 'food' ? 'meal' : 
                       activity.category === 'transport' ? 'transport' : 
                       'activity';
          
          return {
            // Add required fields for the DB check constraint
            id: crypto.randomUUID(),
            type: type, // Required by database constraint
            // Map AI response fields to DB fields
            title: activity.activity,
            time: activity.time,
            category: activity.category,
            description: activity.description,
            estimated_price: activity.estimated_price,
          };
        }),
      })),
    };

    // 6. Update Database
    // This is not a true transaction, but it's a safe sequence for this feature.
    // First, decrement the user's generation credits.
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ generations_remaining: profile.generations_remaining - 1 })
      .eq("id", user.id);

    if (profileUpdateError) {
      // If this fails, the plan remains a draft, and the user can try again.
      throw new ExternalServiceError(
        "Failed to update user credits.",
        new Error(profileUpdateError.message),
      );
    }

    // Then, update the plan with the generated content.
    const updatedPlan = await updatePlan(supabase, planId, {
      status: "generated",
      generated_content: contentForDb as any, // Cast to any to match Supabase type
    });

    logger.info(`Plan ${planId} generated successfully`, { planId });

    // 7. Return Response
    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    logger.error("Error during plan generation", { error });
    return handleApiError(error, {
      endpoint: "POST /api/plans/[planId]/generate",
      planId,
      userId: user?.id,
    });
  }
};
