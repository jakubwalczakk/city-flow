import type { APIRoute } from 'astro';
import { AppError, ExternalServiceError } from '@/lib/errors/app-error';
import { PlanGenerationService } from '@/lib/services/plan-generation.service';
import { AuthService } from '@/lib/services/auth.service';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/error-handler';

export const prerender = false;

/**
 * Endpoint to generate a detailed travel plan using AI.
 * Takes a draft plan and populates it with a structured itinerary.
 */
export const POST: APIRoute = async ({ params, locals }) => {
  const { planId } = params;

  try {
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();

    // 1. Authentication & Authorization (handled by AuthService)

    if (!planId) {
      throw new AppError('Plan ID is required.', 400);
    }

    // 2. Initialize Service
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ExternalServiceError('OpenRouter API key is not configured.');
    }
    const language = import.meta.env.APP_DEFAULT_LANGUAGE || 'Polish';
    const planGenerationService = new PlanGenerationService(locals, apiKey);

    // 3. Delegate to Service
    const updatedPlan = await planGenerationService.generateAndSavePlan(planId, userId, language);

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
      userId: 'unauthenticated', // We can't easily access userId here in catch block without broader scope
    });
  }
};
