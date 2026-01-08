import type { APIRoute } from 'astro';
import { ProfileService } from '@/lib/services/profile.service';
import { AuthService } from '@/lib/services/auth.service';
import { handleApiError, successResponse } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { NotFoundError, ValidationError } from '@/lib/errors/app-error';
import { updateProfileSchema } from '@/lib/schemas/profile.schema';
import { ZodError } from 'zod';

export const prerender = false;

/**
 * GET /api/profiles
 * Retrieves the profile for the currently authenticated user.
 *
 * Returns the user's profile with status 200 on success.
 * Returns 404 if the profile is not found.
 * Returns 401 if the user is not authenticated.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Authenticate the user
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();

    logger.debug('Received request to get user profile', { userId });

    // Fetch the profile
    const profileService = new ProfileService(locals);
    const profile = await profileService.findProfileByUserId(userId);

    if (!profile) {
      logger.debug('Profile not found', { userId });
      throw new NotFoundError('Profile not found.');
    }

    return successResponse(profile, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'GET /api/profiles',
    });
  }
};

/**
 * PATCH /api/profiles
 * Updates the profile for the currently authenticated user.
 *
 * This endpoint supports partial updates (PATCH semantics) - all fields are optional.
 * It is used both for regular profile updates and for completing the onboarding process.
 *
 * @route PATCH /api/profiles
 * @security Requires valid JWT token (in production) or uses DEFAULT_USER_ID (in development)
 *
 * @requestBody {UpdateProfileCommand} - Optional fields:
 *   - preferences: string[] (2-5 items) - User's travel preferences
 *   - travel_pace: "slow" | "moderate" | "intensive" - Desired travel pace
 *   - onboarding_completed: boolean - Marks onboarding as complete
 *
 * @returns {ProfileDto} 200 - Successfully updated profile with all fields
 * @returns {ValidationError} 400 - Validation failed with detailed error messages
 * @returns {UnauthorizedError} 401 - User is not authenticated
 * @returns {DatabaseError} 500 - Database operation failed
 *
 * @example
 * // Request
 * PATCH /api/profiles
 * Content-Type: application/json
 * Authorization: Bearer <jwt-token>
 *
 * {
 *   "preferences": ["Art & Museums", "Local Food"],
 *   "travel_pace": "intensive",
 *   "onboarding_completed": true
 * }
 *
 * // Response
 * 200 OK
 * {
 *   "id": "uuid",
 *   "preferences": ["Art & Museums", "Local Food"],
 *   "travel_pace": "intensive",
 *   "generations_remaining": 5,
 *   "onboarding_completed": true,
 *   "updated_at": "2025-11-10T20:00:00Z"
 * }
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    // Authenticate the user
    const authService = new AuthService(locals);
    const userId = await authService.getUserId();

    logger.debug('Received request to update user profile', { userId });

    // Parse request body
    const body = await request.json();

    // Validate request body
    let validatedData;
    try {
      validatedData = updateProfileSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.debug('Validation failed', { userId, issues: error.issues });
        throw new ValidationError('Validation failed.', error.issues);
      }
      throw error;
    }

    // Update the profile
    const profileService = new ProfileService(locals);
    const updatedProfile = await profileService.updateProfile(userId, validatedData);

    return successResponse(updatedProfile, 200);
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'PATCH /api/profiles',
    });
  }
};
