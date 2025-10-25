# API Endpoint Implementation Plan: Update Plan

## 1. Endpoint Overview
This endpoint allows an authenticated user to update the details of one of their existing plans, such as its name or notes. This is a partial update.

## 2. Request Details
- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/plans/{id}`
- **URL Parameters**:
  - `id` (string, required): The unique identifier of the plan to update.
- **Request Body**: A JSON object compliant with the `UpdatePlanCommand` structure.
  ```json
  {
    "name": "Romantic weekend in Rome with Ann",
    "notes": "Updated notes: Must visit the Vatican."
  }
  ```

## 3. Types Used
- **Command Model (Request)**: `UpdatePlanCommand` from `src/types.ts`.
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the complete, updated plan object.
- **Error Response (`400 Bad Request`)**: Returned if the request body is invalid.
- **Error Response (`404 Not Found`)**: Returned if the plan does not exist or does not belong to the user.

## 5. Data Flow
1. The client sends a `PATCH` request to `/api/plans/{id}` with the update data in the body.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/[id].ts` receives the request.
4. The handler validates the request body using a Zod schema for `UpdatePlanCommand`.
5. The handler extracts the `id` from the URL and the `user_id` from the session.
6. The handler calls an `updatePlan(planId, userId, data)` function from `PlanService`.
7. `PlanService` constructs a Supabase `update` query for the `plans` table, setting the new data. The query includes a `where` clause to match both `planId` and `userId`.
8. If the update is successful and affects one row, the service fetches and returns the updated plan.
9. If the update affects zero rows (i.e., no plan matched the criteria), the service returns `null`.
10. The handler returns `200 OK` with the updated plan DTO or `404 Not Found` if the service returned `null`.

## 6. Security Considerations
- **Authentication**: Requires a valid JWT.
- **Authorization**: The `update` operation in the service layer is conditional on both the plan ID and the user ID from the session, preventing unauthorized modification of other users' plans.
- **RLS**: An `UPDATE` policy must be in place on the `plans` table, allowing updates only where `user_id = auth.uid()`.
- **Input Validation**: The request body is validated to ensure it only contains allowed fields (`name`, `notes`) with the correct data types.

## 7. Error Handling
- **`400 Bad Request`**: For invalid request body.
- **`401 Unauthorized`**: For unauthenticated requests.
- **`404 Not Found`**: If no plan with the given ID belongs to the user.
- **`500 Internal Server Error`**: For database or other unexpected errors.

## 8. Performance Considerations
- The `update` query targets a specific row by its primary key, making it highly efficient.

## 9. Implementation Steps
1. **Create Validation Schema**:
   - In `src/lib/schemas/plan.schema.ts`, define a Zod schema for `UpdatePlanCommand`.
2. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `updatePlan(planId: string, userId: string, data: UpdatePlanCommand): Promise<PlanDetailsDto | null>`.
   - This function will execute the update query and return the updated plan or `null`.
3. **Implement the API Endpoint**:
   - In `src/pages/api/plans/[id].ts`, add a handler for the `PATCH` method.
   - The handler will manage validation, service calls, and responses.
4. **Testing**:
   - Add unit tests for the `updatePlan` service method.
   - Add integration tests for the endpoint, covering successful updates, attempts to update non-existent plans (404), and attempts to update another user's plan (404).
