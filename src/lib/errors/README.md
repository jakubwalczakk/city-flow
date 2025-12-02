# Error Handling System

This directory contains the application's unified error handling system, designed to provide consistent error responses across all API endpoints.

## Architecture

### Error Classes (`app-error.ts`)

The system is built around custom error classes that extend the native JavaScript `Error`:

- **`AppError`** - Base class for all application errors
  - Includes HTTP status code
  - Distinguishes between operational and programming errors
- **`ValidationError`** (400) - For input validation failures
- **`UnauthorizedError`** (401) - For authentication failures
- **`ForbiddenError`** (403) - For authorization failures
- **`NotFoundError`** (404) - For missing resources
- **`ConflictError`** (409) - For state conflicts
- **`DatabaseError`** (500) - For database operation failures
- **`ExternalServiceError`** (502) - For third-party service failures

### Error Handler (`error-handler.ts`)

Provides utilities for handling errors in API endpoints:

- **`handleApiError(error, context)`** - Converts errors into appropriate HTTP responses
  - Logs errors with contextual information
  - Hides sensitive details in production
  - Returns user-friendly error messages
- **`successResponse(data, status)`** - Creates standardized success responses

## Usage

### In Services

```typescript
import { DatabaseError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export const createResource = async (data) => {
  const { data: result, error } = await supabase.from("table").insert(data).select().single();

  if (error) {
    logger.error("Database operation failed", { errorCode: error.code });
    throw new DatabaseError("Failed to create resource", new Error(error.message));
  }

  return result;
};
```

### In API Endpoints

```typescript
import { ValidationError } from "@/lib/errors/app-error";
import { handleApiError, successResponse } from "@/lib/utils/error-handler";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Validate input
    const validation = schema.safeParse(data);
    if (!validation.success) {
      throw new ValidationError("Validation failed", validation.error.flatten());
    }

    // Process request
    const result = await service.create(validation.data);

    // Return success
    return successResponse(result, 201);
  } catch (error) {
    // Handle all errors consistently
    return handleApiError(error, {
      endpoint: "POST /api/resource",
      userId: user.id,
    });
  }
};
```

## Benefits

1. **Consistency** - All errors follow the same structure
2. **Type Safety** - TypeScript knows which errors can be thrown
3. **Better Logging** - Automatic contextual logging for all errors
4. **Security** - Sensitive details hidden in production
5. **Debugging** - Rich error context in development
6. **Maintainability** - Centralized error handling logic

## Error Response Format

All API errors return JSON in this format:

```json
{
  "error": "Human-readable error message",
  "details": {} // Optional, only for validation errors or development mode
}
```

## Logging

Errors are automatically logged with:

- Timestamp
- Error level (warn for operational, error for programming errors)
- Error message
- Additional context (endpoint, user ID, etc.)
- Stack trace (for non-operational errors)
