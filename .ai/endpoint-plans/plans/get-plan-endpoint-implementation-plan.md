# API Endpoint Implementation Plan: Get Plan

## 1. Endpoint Overview
This endpoint retrieves a single, detailed travel plan by its unique ID for the authenticated user.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans/{id}`
- **URL Parameters**:
  - `id` (string, required): The unique identifier of the plan.
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the full plan object, including `generated_content` if available.
- **Error Response (`404 Not Found`)**: Returned if a plan with the specified ID doesn't exist or doesn't belong to the user.
  ```json
  { "error": "Plan not found." }
  ```

## 5. Data Flow
1. The client sends a `GET` request to `/api/plans/{id}`.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/[id].ts` receives the request.
4. The handler extracts the `id` from the URL parameters.
5. The handler retrieves the authenticated user's ID from the session.
6. The handler calls a `getPlanById(planId, userId)` function from `PlanService`.
7. `PlanService` queries the `plans` table for a single record where the `id` matches `planId` and `user_id` matches `userId`.
8. If a record is found, the service maps it to a `PlanDetailsDto` and returns it.
9. If no record is found, the service returns `null`.
10. The API handler checks the result:
    - If a DTO is returned, it sends a `200 OK` response with the DTO in the body.
    - If `null` is returned, it sends a `404 Not Found` response.

## 6. Security Considerations
- **Authentication**: The endpoint is protected and requires a valid JWT.
- **Authorization**: The database query explicitly checks for both `planId` and the `userId` from the session. This, combined with RLS, ensures a user cannot access another user's plan even if they know the ID.
- **RLS**: A `SELECT` policy on the `plans` table must enforce that `id = auth.uid()`.

## 7. Error Handling
- **`401 Unauthorized`**: Returned by middleware if the user is not authenticated.
- **`404 Not Found`**: Returned if the plan is not found for the given ID and user combination.
- **`500 Internal Server Error`**: Returned for unexpected server-side errors.

## 8. Performance Considerations
- The query is a lookup by primary key (`id`), which is very fast. Including the `user_id` in the `WHERE` clause is also efficient if `user_id` is indexed.

## 9. Implementation Steps
1. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `getPlanById(planId: string, userId: string): Promise<PlanDetailsDto | null>`.
   - The function will query the `plans` table for one record matching both IDs and return the mapped DTO or `null`.
2. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans/[id].ts`.
   - Implement the handler for the `GET` method.
   - It should extract the `id` from `Astro.params`, get the user from `Astro.locals`, call the service, and return the appropriate response.
3. **Testing**:
   - Add unit tests for the `getPlanById` service method.
   - Add integration tests for the endpoint. Test cases should include: successfully fetching a plan, attempting to fetch a non-existent plan (expect 404), and attempting to fetch another user's plan (expect 404).
