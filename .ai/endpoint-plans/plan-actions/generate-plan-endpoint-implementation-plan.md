# API Endpoint Implementation Plan: Generate Plan

## 1. Endpoint Overview
This endpoint triggers the AI generation process for a specific draft plan. It transforms a user's notes and preferences into a structured itinerary. This is a potentially long-running, synchronous operation.

## 2. Request Details
- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans/{id}/generate`
- **URL Parameters**:
  - `id` (string, required): The unique identifier of the plan to generate.
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the full plan object with the `generated_content` field populated and the `status` updated to `generated`.
- **Error Response (`402 Payment Required`)**: Returned if the user has no remaining generation credits.
  ```json
  { "error": "You have exhausted your monthly generation limit." }
  ```
- **Error Response (`404 Not Found`)**: Returned if the plan does not exist or does not belong to the user.
- **Error Response (`409 Conflict`)**: Returned if the plan is not in the `draft` state.
- **Error Response (`500 Internal Server Error`)**: Returned for failures during the AI generation process.

## 5. Data Flow
1. The client sends a `POST` request to `/api/plans/{id}/generate`.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/[id]/generate.ts` receives the request.
4. The handler extracts the `planId` from the URL and `userId` from the session.
5. The handler calls a `generatePlan(planId, userId)` function in `PlanService`.
6. Inside `PlanService`, the logic proceeds in a single database transaction:
   a. Retrieve the user's profile to check `generations_remaining`. If it's 0, throw a specific error to be caught and returned as `402 Payment Required`.
   b. Retrieve the plan to ensure it belongs to the user and its status is `draft`. If not, throw an error (`404` or `409`).
   c. Decrement the user's `generations_remaining` count in the `profiles` table.
   d. Call an external `AIService` (to be created) with all necessary data (plan details, user preferences, fixed points).
   e. The `AIService` communicates with the Openrouter.ai API and returns the structured JSON itinerary.
   f. Update the plan in the `plans` table: set `generated_content` to the AI's output and update `status` to `generated`.
7. If the transaction is successful, `PlanService` returns the updated `PlanDetailsDto`.
8. If any step fails (especially the AI call), the transaction is rolled back, and the user's generation credit is not consumed. An appropriate error is thrown.
9. The handler returns `200 OK` with the updated plan or a corresponding error response.

## 6. Security Considerations
- **Authentication & Authorization**: Standard checks are in place to ensure only the plan's owner can trigger generation.
- **Resource Management**: The process must be wrapped in a transaction to ensure the user's generation credit is only consumed if the entire process succeeds.
- **Third-Party API Keys**: The key for Openrouter.ai must be stored securely as an environment variable and never exposed on the client side.

## 7. Error Handling
- **`401 Unauthorized`**: Unauthenticated user.
- **`402 Payment Required`**: No generation credits left.
- **`404 Not Found`**: Plan not found for the user.
- **`409 Conflict`**: Plan is already generated or archived.
- **`500 Internal Server Error`**: Generic error for issues during generation. The response should clarify that the user's credit was not used.

## 8. Performance Considerations
- This can be a long-running request. The client should be prepared to wait and show a loading state. For a future version, this could be converted to an asynchronous operation with polling or websockets, but for now, a synchronous request is acceptable.

## 9. Implementation Steps
1. **Create AI Service**:
   - Create a new file `src/lib/services/ai.service.ts`.
   - Implement a function that takes plan and profile data, formats it into a prompt, and calls the Openrouter.ai API. It should handle parsing the response.
2. **Update Plan Service**:
   - In `src/lib/services/plan.service.ts`, implement the `generatePlan(planId: string, userId: string): Promise<PlanDetailsDto>` function.
   - This function will orchestrate the transaction, calling the database and the new `AIService`.
3. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans/[id]/generate.ts`.
   - Implement the `POST` handler that calls the `planService.generatePlan` function and handles the various success and error responses.
4. **Testing**:
   - Unit test the `AIService` (potentially with mock API calls).
   - Unit test the transaction logic in `PlanService`.
   - Integration test the endpoint, covering success cases, running out of credits, and trying to generate a non-draft plan.
