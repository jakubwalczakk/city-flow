# API Endpoint Implementation Plan: Rebuild Day

## 1. Endpoint Overview
This endpoint reruns the AI optimization for a specific day within a generated plan. This is typically used after a user has removed one or more items and wants the AI to re-shuffle and fill in the gaps for that day. This operation does not consume a generation credit.

## 2. Request Details
- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans/{id}/days/{date}/rebuild`
- **URL Parameters**:
  - `id` (string, required): The ID of the plan.
  - `date` (string, required): The specific date to rebuild (e.g., "2026-03-05").
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the entire updated plan object with the re-optimized `generated_content` for the specified day.
- **Error Response (`404 Not Found`)**: Returned if the plan or the specified date within the plan does not exist.
- **Error Response (`409 Conflict`)**: Returned if the plan is not in the `generated` state.

## 5. Data Flow
1. The client sends a `POST` request to the rebuild URL.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[id]/days/[date]/rebuild.ts` receives the request.
4. The handler extracts `planId` and `date` from the URL, and `userId` from the session.
5. The handler calls a `rebuildDay(planId, userId, date)` function in `PlanService`.
6. Inside `PlanService`:
   a. Retrieve the plan, ensuring it belongs to the user and is in the `generated` state.
   b. Parse the `generated_content` and find the array of items for the specified `date`. If not found, throw a `404` error.
   c. Call the `AIService` with the context for just this single day (e.g., user preferences, fixed points for the day, and the remaining items for the day).
   d. The `AIService` returns a new, optimized list of items for that day.
   e. Replace the old item list for that day in the `generated_content` object with the new list from the AI.
   f. Update the plan's `generated_content` in the database.
7. The service returns the full, updated `PlanDetailsDto`.
8. The handler returns a `200 OK` response with the updated plan.

## 6. Security Considerations
- **Authentication & Authorization**: Standard checks are in place.
- **Third-Party API**: The call to Openrouter.ai must be handled securely.
- **Data Integrity**: The process must correctly target and replace only the data for the specified day within the JSONB structure.

## 7. Error Handling
- **`400 Bad Request`**: If the `date` parameter is not a valid date.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the plan or the specific date within the plan's content is not found.
- **`409 Conflict`**: If the plan is not in the `generated` state.
- **`500 Internal Server Error`**: For failures during the AI call or database update.

## 8. Performance Considerations
- Similar to the main generation endpoint, this can be a moderately long-running request. The scope is smaller (a single day), so it should be faster.
- The same client-side considerations (showing a loading state) apply.

## 9. Implementation Steps
1. **Update AI Service**:
   - In `src/lib/services/ai.service.ts`, create a new function specifically for rebuilding a day. It will take a more limited context (just one day's data) and use a prompt focused on re-optimization.
2. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `rebuildDay(planId: string, userId: string, date: string): Promise<PlanDetailsDto>`.
   - This function will orchestrate fetching the plan, calling the AI service for the specific day, and updating the `generated_content`.
3. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans/[id]/days/[date]/rebuild.ts`.
   - Implement the `POST` handler to parse parameters, call the service, and manage responses.
4. **Testing**:
   - Add unit tests for the `rebuildDay` service logic.
   - Add integration tests for the endpoint to verify it correctly modifies the plan and handles errors.
