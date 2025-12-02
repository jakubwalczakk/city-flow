# API Endpoint Implementation Plan: Get Profile

## 1. Endpoint Overview

This endpoint allows an authenticated user to retrieve their own profile details. The profile contains application-specific settings like preferences and onboarding status.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/profiles`
- **Parameters**: None
- **Request Body**: None

## 3. Types Used

- **DTO (Response)**: `ProfileDto` from `src/types.ts`

## 4. Response Details

- **Success Response (`200 OK`)**: Returns the user's profile object, compliant with the `ProfileDto` type.
  ```json
  {
    "id": "uuid",
    "preferences": ["Art & Museums", "Local Food"],
    "travel_pace": "moderate",
    "generations_remaining": 5,
    "onboarding_completed": true,
    "updated_at": "2025-10-25T10:00:00Z"
  }
  ```
- **Error Response (`404 Not Found`)**: Returned if the profile does not exist for the user (e.g., a new user who hasn't completed onboarding).
  ```json
  {
    "error": "Profile not found."
  }
  ```

## 5. Data Flow

1. The client sends a `GET` request to `/api/profiles`.
2. Astro middleware verifies the user's authentication token (JWT) from the `Authorization` header.
3. The API handler in `src/pages/api/profiles.ts` receives the request.
4. The handler retrieves the authenticated user's ID from the session (`Astro.locals.user.id`).
5. The handler calls a `getProfile(userId)` function from a `ProfileService`.
6. `ProfileService` queries the `profiles` table in the Supabase database for a record where the `id` matches the user's ID.
7. If a record is found, `ProfileService` maps it to a `ProfileDto` and returns it.
8. If no record is found, `ProfileService` returns `null`.
9. The API handler checks the result:
   - If a profile DTO is returned, it sends a `200 OK` response with the profile in the body.
   - If `null` is returned, it sends a `404 Not Found` response.

## 6. Security Considerations

- **Authentication**: The endpoint is protected and requires a valid JWT. The Astro/Supabase middleware will handle this, rejecting any unauthenticated requests with a `401 Unauthorized` status.
- **Authorization**: The user ID is sourced directly from the secure session token, ensuring a user can only ever request their own profile.
- **Row Level Security (RLS)**: Supabase RLS policies must be enabled on the `profiles` table to enforce that a `SELECT` operation is only permitted when the `id` of the row matches the authenticated user's ID (`auth.uid()`).

## 7. Error Handling

- **`401 Unauthorized`**: Returned by the middleware if the request lacks a valid session token.
- **`404 Not Found`**: Returned by the handler if no profile record is found for the authenticated user.
- **`500 Internal Server Error`**: Returned for any unexpected server-side issues, such as a database connection failure. Errors will be logged to the console.

## 8. Performance Considerations

- The query is a simple primary key lookup (`SELECT ... WHERE id = ?`), which is highly efficient.
- The `id` column on the `profiles` table is the primary key and is therefore indexed by default. No performance bottlenecks are expected.

## 9. Implementation Steps

1. **Create Service**:
   - Create the file `src/lib/services/profile.service.ts`.
   - Implement an async function `getProfile(userId: string, supabase: SupabaseClient): Promise<ProfileDto | null>`.
   - The function will query the `profiles` table and return the mapped DTO or `null`.
2. **Implement API Endpoint**:
   - Create or modify the file `src/pages/api/profiles.ts`.
   - Implement a handler for the `GET` method.
   - Inside the handler, retrieve the session and Supabase client from `Astro.locals`.
   - Ensure the user is authenticated.
   - Call the `profileService.getProfile` function.
   - Return a `200 OK` or `404 Not Found` response based on the service's result.
3. **Testing**:
   - Add unit tests for the `ProfileService` to verify its logic for finding and not finding a profile.
   - Add integration tests for the `GET /api/profiles` endpoint to check for correct responses for authenticated users with and without profiles, and for unauthenticated requests.
