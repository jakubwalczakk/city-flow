import { z } from 'zod';
import { OpenRouterService } from './openrouter.service';
import { AppError, ExternalServiceError, ForbiddenError, ConflictError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';
import type { PlanDetailsDto, FixedPointDto, UpdatePlanCommand, ProfileDto } from '@/types';
import { PlanService } from './plan.service';
import { FixedPointService } from './fixed-point.service';
import { ProfileService } from './profile.service';
import type { SupabaseClient } from '@/db/supabase.client';

// Define the schema for the AI's structured response
const aiTimelineEventSchema = z.object({
  time: z.string().describe('The time of the event in 24-hour HH:mm format (e.g., 18:00, not 6:00 PM).'),
  activity: z.string().describe('A short, descriptive title for the activity.'),
  category: z
    .enum(['history', 'food', 'sport', 'nature', 'culture', 'transport', 'accommodation', 'other'])
    .describe('The category of the activity.'),
  description: z.string().describe('A detailed description of the activity.'),
  estimated_price: z
    .string()
    .nullable()
    .describe("An estimated cost as a numeric string WITHOUT currency symbol (e.g., '18', '0' for free, or null)."),
  estimated_duration: z
    .string()
    .nullable()
    .describe("An estimated duration for the activity (e.g., '2 hours', '30 minutes')."),
});

const aiDayPlanSchema = z.object({
  date: z.string().describe("The date for this day's plan in YYYY-MM-DD format."),
  activities: z.array(aiTimelineEventSchema).describe('An array of activities for the day.'),
});

// Schema for a successful plan generation
const aiSuccessResponseSchema = z.object({
  status: z.literal('success'),
  summary: z.string().describe('A brief, engaging summary of the entire trip, highlighting the key experiences.'),
  currency: z
    .string()
    .length(3)
    .describe("The ISO 4217 currency code for all monetary values in the plan (e.g., 'EUR', 'PLN', 'USD')."),
  itinerary: z.object({
    destination: z.string(),
    dates: z.object({
      start: z.string(),
      end: z.string(),
    }),
    days: z.array(aiDayPlanSchema).describe('An array of daily plans, one for each day of the trip.'),
  }),
});

// Schema for when the AI detects an error in the user's request
const aiErrorResponseSchema = z.object({
  status: z.literal('error'),
  error_type: z.enum(['unrealistic_plan', 'invalid_location']).describe('The type of error detected.'),
  error_message: z.string().describe('A user-friendly message explaining the error.'),
});

// Discriminated union to handle both success and error cases
const aiGeneratedContentSchema = z.discriminatedUnion('status', [aiSuccessResponseSchema, aiErrorResponseSchema]);

export type AIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;

/**
 * Service for generating travel plans using AI.
 * Encapsulates the prompt logic and interaction with OpenRouter for plan generation.
 */
export class PlanGenerationService {
  private readonly supabase: SupabaseClient;
  private readonly openRouterService: OpenRouterService;
  private readonly planService: PlanService;
  private readonly fixedPointService: FixedPointService;
  private readonly profileService: ProfileService;

  constructor(clientOrLocals: SupabaseClient | App.Locals, apiKey: string) {
    if ('supabase' in clientOrLocals) {
      this.supabase = clientOrLocals.supabase;
    } else {
      this.supabase = clientOrLocals;
    }

    if (!apiKey) {
      throw new Error('OpenRouter API key is required for PlanGenerationService.');
    }
    this.openRouterService = new OpenRouterService({ apiKey });
    this.planService = new PlanService(this.supabase);
    this.fixedPointService = new FixedPointService(this.supabase);
    this.profileService = new ProfileService(this.supabase);
  }

  /**
   * Generates a detailed travel plan based on the provided plan ID.
   * This method orchestrates the entire flow:
   * 1. Checks user credits
   * 2. Fetches plan data
   * 3. Fetches fixed points
   * 4. Generates content via AI
   * 5. Updates database and decrements credits
   *
   * @param planId - The ID of the plan to generate
   * @param userId - The ID of the user requesting the generation
   * @param language - The language for the generated content (default: Polish)
   * @returns The updated plan details
   */
  public async generateAndSavePlan(planId: string, userId: string, language = 'Polish'): Promise<PlanDetailsDto> {
    logger.debug('Starting plan generation workflow', { planId, userId });

    // 1. User Credit Check
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.');
    }

    if (profile.generations_remaining <= 0) {
      throw new ForbiddenError('You have no plan generations remaining.');
    }

    // 2. Fetch Plan Data
    const plan = await this.planService.getPlanById(planId, userId);
    if (plan.status !== 'draft') {
      throw new ConflictError('This plan has already been generated.');
    }

    // Validate that required dates are present
    if (!plan.start_date || !plan.end_date) {
      throw new AppError('Plan must have both start date and end date to generate.', 400);
    }

    // 3. Fetch Fixed Points
    const fixedPoints = await this.fixedPointService.getFixedPointsByPlanId(planId);

    // 4. Generate Content
    const generatedContent = await this.generatePlanContent(plan, fixedPoints, profile, language);

    // 5. Update Database (Decrement Credits & Save Plan)
    // Note: Ideally this would be a transaction.

    try {
      await this.profileService.decrementGenerations(userId);
    } catch (error) {
      // If decrement fails, we stop here.
      throw new ExternalServiceError(
        'Failed to update user credits.',
        error instanceof Error ? error : new Error(String(error))
      );
    }

    try {
      const updatedPlan = await this.planService.updatePlan(planId, {
        status: 'generated',
        generated_content: generatedContent,
      });

      logger.info(`Plan ${planId} generated successfully`, { planId });
      return updatedPlan;
    } catch (error) {
      // If plan update fails, we should ideally refund the credit (manual compensation)
      // For now, we log the critical error.
      logger.error('CRITICAL: Credits deducted but plan update failed', { planId, userId, error });
      throw new ExternalServiceError(
        'Failed to save generated plan.',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Generates a detailed travel plan based on the provided plan details and fixed points.
   *
   * @param plan - The draft plan details
   * @param fixedPoints - Any fixed points/events to include in the plan
   * @param profile - The user profile containing preferences and pace
   * @param language - The language for the generated content (default: Polish)
   * @returns The generated plan content formatted for the database
   */
  public async generatePlanContent(
    plan: PlanDetailsDto,
    fixedPoints: FixedPointDto[],
    profile: ProfileDto,
    language = 'Polish'
  ): Promise<UpdatePlanCommand['generated_content']> {
    logger.debug('Generating plan content', { planId: plan.id, destination: plan.destination });

    // 1. Construct the Prompts
    const systemPrompt = this.buildSystemPrompt(plan, fixedPoints, profile, language);
    const userPrompt = `
Please generate the travel plan now based on the provided details. Ensure the output is a valid JSON object matching the required structure.
`;

    // 2. Call the OpenRouter Service
    const generatedContent = await this.openRouterService.getStructuredResponse({
      systemPrompt,
      userPrompt,
      responseSchema: aiGeneratedContentSchema,
    });

    // 3. Handle AI Response
    if (generatedContent.status === 'error') {
      logger.warn('AI returned error for plan generation', {
        planId: plan.id,
        errorType: generatedContent.error_type,
        errorMessage: generatedContent.error_message,
      });
      throw new AppError(generatedContent.error_message, 400);
    }

    // 4. Transform AI response for database storage
    return this.transformToDbFormat(generatedContent);
  }

  /**
   * Builds the system prompt for the AI.
   */
  private buildSystemPrompt(
    plan: PlanDetailsDto,
    fixedPoints: FixedPointDto[],
    profile: ProfileDto,
    language: string
  ): string {
    const fixedPointsText =
      fixedPoints && fixedPoints.length > 0
        ? fixedPoints
            .map(
              (fp) =>
                `- ${new Date(fp.event_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: false })}: ${fp.location} - ${fp.description || 'No description'}`
            )
            .join('\n')
        : 'No fixed points scheduled.';

    const pace = profile.travel_pace || 'moderate';
    const preferences = profile.preferences?.length ? profile.preferences.join(', ') : 'No specific preferences';

    return `
You are an expert travel planner AI. Your task is to generate a detailed, structured travel itinerary based on the user's plan details.
All text in the response, such as summaries, descriptions, and activity titles, must be in ${language}. The JSON structure and keys must remain in English as specified in the schema.
The response MUST be a single JSON object and nothing else. Do not include any introductory text, markdown formatting, or explanations.

**VERY IMPORTANT: First, you must validate the user's request.**
1.  **Check for Real Locations**: Verify if the destination is a real, plannable location. If it seems fake, nonsensical, or too broad (e.g., "Europe"), you must return an error.
2.  **Check for Realistic Plans**: Assess if the plan is realistically achievable in the given timeframe. For example, a trip to "see all of Spain in 3 days" is not realistic. If the plan is not feasible, you must return an error.

**CURRENCY REQUIREMENTS:**
- You MUST determine the correct local currency for the destination based on the country/region.
- Use the ISO 4217 three-letter currency code (e.g., "EUR" for Eurozone countries, "USD" for USA, "GBP" for UK, "JPY" for Japan, "PLN" for Poland, "CZK" for Czech Republic, etc.).
- All price estimates should be in the LOCAL currency of the destination, provided as numeric strings WITHOUT currency symbols.
- For free activities, use "0" as the price.

**USER PREFERENCES (HIGHEST PRIORITY):**
The user has specified the following travel style and interests. You MUST prioritize these over general tourist attractions:
- **Travel Pace:** ${pace}
  - "slow": Relaxed pace with fewer activities per day, longer breaks, more time at each location
  - "moderate": Balanced pace with a mix of activities and free time
  - "intensive": Fast-paced with many activities, packed schedule, shorter breaks
- **User Interests:** ${preferences}

**IMPORTANT: Activity Categories**
You MUST use ONLY these exact category values for activities:
- "history" - Historical sites, monuments, heritage (use for: History & Culture preferences)
- "food" - Restaurants, cafes, food markets (use for: Local Food preferences)
- "sport" - Sports activities, fitness (use for: Active Recreation preferences)
- "nature" - Parks, gardens, natural attractions (use for: Nature & Parks preferences)
- "culture" - Museums, art galleries, theaters, concerts (use for: Art & Museums preferences)
- "transport" - Transportation between locations
- "accommodation" - Hotels, check-in/check-out
- "other" - Everything else including nightlife, shopping, etc.

Match the user's interests (like "Art & Museums", "Nightlife") to the appropriate category from the list above.

**Response Structure:**

*   **If the plan is valid and realistic**, respond with the following JSON structure. IMPORTANT: All times MUST be in 24-hour format (e.g., 09:00, 18:00).
    \`\`\`json
    {
      "status": "success",
      "summary": "A brief, engaging summary of the entire trip, highlighting the key experiences.",
      "currency": "ISO 4217 currency code for the destination (e.g., EUR, USD, GBP, PLN, JPY, etc.)",
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
                "category": "MUST be one of: history, food, sport, nature, culture, transport, accommodation, other",
                "description": "Detailed description of the activity.",
                "estimated_price": "e.g., '18', '0' (for free), or null (numeric value as string, WITHOUT currency symbol)",
                "estimated_duration": "e.g., '2 hours', '30 minutes', or null"
              }
            ]
          }
        ]
      }
    }
    \`\`\`
*   **If the plan is invalid or unrealistic**, respond with this exact JSON structure:
    \`\`\`json
    {
      "status": "error",
      "error_type": "invalid_location" | "unrealistic_plan",
      "error_message": "A clear, user-friendly explanation of why the plan could not be generated."
    }
    \`\`\`

Key requirements for the plan:
- Destination: ${plan.destination}
- Start Date & Time: ${new Date(plan.start_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', hour12: false })}
- End Date & Time: ${new Date(plan.end_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', hour12: false })}
- User Notes: ${plan.notes || 'No special notes provided.'}

**CRITICAL - FIXED POINTS (IMMUTABLE SCHEDULE):**
The user has pre-scheduled the following events. These are NON-NEGOTIABLE and MUST appear in the itinerary EXACTLY at the specified date and time. You are FORBIDDEN from:
- Moving these events to a different day
- Changing the time of these events
- Omitting any of these events from the plan
- Scheduling other activities that would conflict with these events

Build the rest of the itinerary AROUND these fixed points:
${fixedPointsText}

Generate a plan that is logical, engaging, and takes into account travel times between locations. Be creative and suggest interesting activities, restaurants, and sights. Ensure all other activities are scheduled to accommodate the fixed points above.
`;
  }

  /**
   * Transforms the AI response into the format expected by the database.
   */
  private transformToDbFormat(
    generatedContent: z.infer<typeof aiSuccessResponseSchema>
  ): UpdatePlanCommand['generated_content'] {
    return {
      summary: generatedContent.summary,
      currency: generatedContent.currency,
      days: generatedContent.itinerary.days.map((day) => ({
        date: day.date,
        // The database expects an 'items' array, not 'activities'
        items: day.activities.map((activity) => {
          // Map category to type for database validation
          const type =
            activity.category === 'food' ? 'meal' : activity.category === 'transport' ? 'transport' : 'activity';

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
            estimated_duration: activity.estimated_duration,
          };
        }),
      })),
    };
  }
}
