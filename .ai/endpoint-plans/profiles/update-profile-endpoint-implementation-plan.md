# API Endpoint Implementation Plan: Update Profile

## 1. Endpoint Overview

This endpoint allows an authenticated user to update their profile details. It is a partial update (`PATCH`), so clients only need to send the fields they wish to change. This endpoint is also used to set up the initial profile during user onboarding.

## 2. Request Details

- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/profiles`
- **Parameters**: None
- **Request Body**: A JSON object containing any of the fields from the `UpdateProfileCommand`.
  ```json
  {
    "preferences": ["Art & Museums", "Local Food", "Nightlife"],
    "travel_pace": "intensive",
    "onboarding_completed": true
  }
  ```

## 3. Types Used

- **Command Model (Request)**: `UpdateProfileCommand` from `src/types.ts`
- **DTO (Response)**: `ProfileDto` from `src/types.ts`

## 4. Response Details

- **Success Response (`200 OK`)**: Returns the complete, updated profile object, compliant with the `ProfileDto` type.
- **Error Response (`400 Bad Request`)**: Returned if the request body fails validation.
  ```json
  {
    "error": "Validation failed.",
    "details": { "preferences": "Must have between 2 and 5 items." }
  }
  ```

## 5. Data Flow

1. The client sends a `PATCH` request to `/api/profiles` with a body containing the data to be updated.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/profiles.ts` receives the request.
4. The handler validates the request body using a Zod schema based on `UpdateProfileCommand`. If validation fails, it returns a `400 Bad Request` response with details.
5. The handler retrieves the user ID from the session (`Astro.locals.user.id`).
6. The handler calls an `updateProfile(userId, data)` function from `ProfileService`, passing the validated data.
7. `ProfileService` performs an `upsert` operation on the `profiles` table in Supabase, using the `userId` as the primary key. This will create the profile if it doesn't exist or update it if it does.
8. The database returns the newly created or updated record.
9. `ProfileService` maps the record to a `ProfileDto` and returns it to the handler.
10. The handler sends a `200 OK` response with the updated profile DTO in the body.

## 6. Security Considerations

- **Authentication**: The endpoint is protected and requires a valid JWT.
- **Authorization**: The user ID is taken from the session, not the request body, ensuring users can only modify their own data.
- **Input Validation**: A strict Zod schema is used to validate all incoming data, preventing malformed or potentially malicious data from reaching the database. This includes checking array lengths and enum values.
- **Row Level Security (RLS)**: RLS policies on the `profiles` table must be configured to allow `INSERT` and `UPDATE` operations only when the row's `id` matches `auth.uid()`.

## 7. Error Handling

- **`400 Bad Request`**: Returned if the Zod schema validation fails. The response body will contain details about the specific validation errors.
- **`401 Unauthorized`**: Returned by middleware if the user is not authenticated.
- **`500 Internal Server Error`**: Returned for unexpected server-side errors, like database failures. The error will be logged.

## 8. Performance Considerations

- The `upsert` operation is efficient as it's based on the primary key.
- The payload size is small. No performance issues are anticipated.

## 9. Implementation Steps

1. **Create Validation Schema**:
   - Create the file `src/lib/schemas/profile.schema.ts`.
   - Define a Zod schema for `UpdateProfileCommand`.
   - Add validation rules: `preferences` should be an array of strings with 2 to 5 elements, and `travel_pace` must match the `TravelPace` enum.
2. **Implement Service**:
   - In the existing `src/lib/services/profile.service.ts` file.
   - Implement an async function `updateProfile(userId: string, data: UpdateProfileCommand, supabase: SupabaseClient): Promise<ProfileDto>`.
   - This function will use `supabase.from('profiles').upsert(...)` to update the user's profile and will return the updated data as a `ProfileDto`.
3. **Implement API Endpoint**:
   - In `src/pages/api/profiles.ts`, implement a handler for the `PATCH` method.
   - Retrieve the session and validate the request body using the Zod schema.
   - Call the `profileService.updateProfile` function.
   - Return a `200 OK` response with the result. Handle any errors appropriately.
4. **Testing**:
   - Add unit tests for the `ProfileService` update logic.
   - Add integration tests for the `PATCH /api/profiles` endpoint. Test cases should include: valid updates, creating a profile for the first time, invalid data (e.g., too few preferences), and requests from unauthenticated users.
