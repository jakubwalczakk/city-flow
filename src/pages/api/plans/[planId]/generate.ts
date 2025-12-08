import type { APIRoute } from 'astro';
import { AppError, ForbiddenError, ExternalServiceError } from '@/lib/errors/app-error';
import { PlanGenerationService } from '@/lib/services/plan-generation.service';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/error-handler';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false;

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
      throw new ForbiddenError('You must be logged in to generate a plan.');
    }
    if (!planId) {
      throw new AppError('Plan ID is required.', 400);
    }

    // 2. Initialize Service
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ExternalServiceError('OpenRouter API key is not configured.');
    }
    const language = import.meta.env.APP_DEFAULT_LANGUAGE || 'Polish';
    const planGenerationService = new PlanGenerationService(supabase, apiKey);

    // 3. Delegate to Service
    const updatedPlan = await planGenerationService.generateAndSavePlan(planId, user.id, language);

    // 4. Return Response
    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Error during plan generation', { error });
    return handleApiError(error, {
      endpoint: 'POST /api/plans/[planId]/generate',
      planId,
      userId: user?.id,
    });
  }
};
