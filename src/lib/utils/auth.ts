import type { APIContext } from "astro";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { logger } from "./logger";

/**
 * User object returned by authentication.
 */
export type AuthenticatedUser = {
  id: string;
  email?: string;
};

/**
 * Retrieves the authenticated user from the request context.
 * 
 * This function abstracts the authentication logic, making it easy to switch
 * from development mode (using DEFAULT_USER_ID) to production mode (using JWT tokens).
 * 
 * **Current Behavior (Development):**
 * - Returns a mock user with DEFAULT_USER_ID
 * - Does not validate JWT tokens
 * 
 * **Future Behavior (Production):**
 * - Extract JWT token from Authorization header
 * - Validate token with Supabase
 * - Return user from token payload
 * - Throw UnauthorizedError if token is invalid or missing
 * 
 * @param context - Astro API context containing request and locals
 * @returns The authenticated user object
 * @throws UnauthorizedError if authentication fails (in production mode)
 * 
 * @example
 * ```typescript
 * // In an API endpoint
 * export const GET: APIRoute = async (context) => {
 *   const user = await getAuthenticatedUser(context);
 *   // user.id can now be safely used
 * };
 * ```
 */
export async function getAuthenticatedUser(
  context: APIContext
): Promise<AuthenticatedUser> {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    // Development mode: use default user ID
    logger.debug("Using DEFAULT_USER_ID for authentication (development mode)");
    return { id: DEFAULT_USER_ID };
  }

  // Production mode: validate JWT token
  return await getAuthenticatedUserFromToken(context);
}

/**
 * Extracts and validates the authenticated user from a JWT token.
 * 
 * This function is called in production mode to validate the user's identity
 * using the JWT token from the Authorization header.
 * 
 * @param context - Astro API context
 * @returns The authenticated user from the token
 * @throws UnauthorizedError if token is missing or invalid
 */
async function getAuthenticatedUserFromToken(
  context: APIContext
): Promise<AuthenticatedUser> {
  const { request, locals } = context;
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.debug("Missing or invalid Authorization header");
    throw new UnauthorizedError("Missing or invalid authorization token");
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Use Supabase to validate the JWT token
    const { data: { user }, error } = await locals.supabase.auth.getUser(token);

    if (error || !user) {
      logger.debug("Token validation failed", { error: error?.message });
      throw new UnauthorizedError("Invalid or expired token");
    }

    logger.debug("User authenticated successfully", { userId: user.id });
    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    logger.error("Unexpected error during token validation", {}, error as Error);
    throw new UnauthorizedError("Authentication failed");
  }
}

/**
 * Optional: Helper to get user ID only (shorthand).
 * 
 * @param context - Astro API context
 * @returns The authenticated user's ID
 * @throws UnauthorizedError if authentication fails
 * 
 * @example
 * ```typescript
 * const userId = await getUserId(context);
 * ```
 */
export async function getUserId(context: APIContext): Promise<string> {
  const user = await getAuthenticatedUser(context);
  return user.id;
}

/**
 * Checks if a user is authenticated without throwing an error.
 * Useful for optional authentication scenarios.
 * 
 * @param context - Astro API context
 * @returns The authenticated user or null if not authenticated
 * 
 * @example
 * ```typescript
 * const user = await tryGetAuthenticatedUser(context);
 * if (user) {
 *   // User is authenticated
 * } else {
 *   // User is not authenticated, handle accordingly
 * }
 * ```
 */
export async function tryGetAuthenticatedUser(
  context: APIContext
): Promise<AuthenticatedUser | null> {
  try {
    return await getAuthenticatedUser(context);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    throw error;
  }
}

