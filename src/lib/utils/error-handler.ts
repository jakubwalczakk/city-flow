import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Standard error response structure for API endpoints.
 */
interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Handles errors in API endpoints and returns appropriate HTTP responses.
 *
 * This function:
 * - Logs errors appropriately based on their type
 * - Returns user-friendly error messages
 * - Hides sensitive implementation details in production
 *
 * @param error - The error to handle
 * @param context - Additional context for logging (e.g., endpoint name, user ID)
 * @returns A Response object with appropriate status code and error message
 */
export function handleApiError(error: unknown, context?: Record<string, unknown>): Response {
  // Handle known application errors
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: error.message,
    };

    // For validation errors, include validation details
    if (error.name === "ValidationError" && "details" in error) {
      errorResponse.details = error.details;
    }

    // Log operational errors as warnings, non-operational as errors
    if (error.isOperational) {
      logger.warn(`Operational error: ${error.message}`, {
        ...context,
        statusCode: error.statusCode,
        errorName: error.name,
      });
    } else {
      logger.error(
        `Non-operational error: ${error.message}`,
        {
          ...context,
          statusCode: error.statusCode,
          errorName: error.name,
        },
        error
      );
    }

    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Handle unknown errors
  logger.error("Unexpected error occurred", context, error as Error);

  const errorResponse: ErrorResponse = {
    error: "Internal Server Error",
    // In development, include error details for debugging
    ...(import.meta.env.DEV && {
      details: error instanceof Error ? error.message : String(error),
    }),
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Helper function to create a success JSON response.
 *
 * @param data - The data to include in the response
 * @param status - HTTP status code (default: 200)
 * @returns A Response object with the data
 */
export function successResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
