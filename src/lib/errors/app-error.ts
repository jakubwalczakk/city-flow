/**
 * Custom error classes for application-wide error handling.
 */

/**
 * Base class for all application errors.
 * Extends the native Error class with additional HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message, 400);
  }
}

/**
 * Error thrown when a user is not authenticated.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Error thrown when a user is authenticated but lacks permissions.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Error thrown when there's a conflict with the current state of the resource.
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Error thrown when a database operation fails.
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 500, false);
  }
}

/**
 * Error thrown when an external service fails.
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 502, false);
  }
}
