import type { APIRoute } from 'astro';
import { z } from 'zod';
import { OpenRouterService } from '@/lib/services/openrouter.service';
import { handleApiError } from '@/lib/utils/error-handler';

export const prerender = false;

/**
 * Test endpoint for OpenRouter service.
 * This endpoint can be used to verify the OpenRouter integration is working correctly.
 *
 * Usage: GET /api/test-openrouter
 */
export const GET: APIRoute = async () => {
  try {
    // Check if API key is configured
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'OPENROUTER_API_KEY environment variable is not configured.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize the service
    const service = new OpenRouterService({
      apiKey,
    });

    // Define a simple schema for testing
    const travelPlanSchema = z.object({
      destination: z.string().describe('The city of the travel plan.'),
      durationDays: z.number().describe('Total duration of the trip in days.'),
      activities: z.array(z.string()).describe('A list of recommended activities.'),
    });

    // Test the service with a simple prompt
    const result = await service.getStructuredResponse({
      systemPrompt: 'You are a travel planning assistant. Provide concise and accurate travel recommendations.',
      userPrompt: 'Create a simple travel plan for a 3-day trip to Paris.',
      responseSchema: travelPlanSchema,
      model: 'gpt-4o-mini',
    });

    // Return the successful result
    return new Response(
      JSON.stringify(
        {
          success: true,
          data: result,
          message: 'OpenRouter service is working correctly!',
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return handleApiError(error, { endpoint: 'GET /api/test-openrouter' });
  }
};
