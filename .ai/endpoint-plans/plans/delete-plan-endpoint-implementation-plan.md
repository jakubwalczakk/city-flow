# API Endpoint Implementation Plan: Delete Plan

## 1. Endpoint Overview

This endpoint allows an authenticated user to permanently delete one of their travel plans.

## 2. Request Details

- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/plans/{id}`
- **URL Parameters**:
  - `id` (string, required): The unique identifier of the plan to delete.
- **Request Body**: None

## 3. Types Used

- None.

## 4. Response Details

- **Success Response (`204 No Content`)**: Returned on successful deletion. The response has no body.
- **Error Response (`404 Not Found`)**: Returned if the plan does not exist or does not belong to the user.

## 5. Data Flow

1. The client sends a `DELETE` request to `/api/plans/{id}`.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/[id].ts` receives the request.
4. The handler extracts the `id` from the URL and the `user_id` from the session.
5. The handler calls a `deletePlan(planId, userId)` function from `PlanService`.
6. `PlanService` constructs a Supabase `delete` query for the `plans` table, with a `where` clause matching both `planId` and `userId`.
7. The service executes the query and checks if a row was actually deleted. It can return a boolean indicating success.
8. The handler checks the result:
   - If the deletion was successful, it returns a `204 No Content` response.
   - If the service indicates no row was found to delete, it returns a `404 Not Found` response.

## 6. Security Considerations

- **Authentication**: Requires a valid JWT.
- **Authorization**: The `delete` operation is conditional on both the plan ID and the user ID from the session, preventing users from deleting others' plans.
- **RLS**: A `DELETE` policy must be enabled on the `plans` table, allowing deletion only when `user_id = auth.uid()`.

## 7. Error Handling

- **`401 Unauthorized`**: For unauthenticated requests.
- **`404 Not Found`**: If no plan with the given ID belongs to the user.
- **`500 Internal Server Error`**: For database or other unexpected errors.

## 8. Performance Considerations

- The `delete` query targets a specific row by its primary key, making it highly efficient.

## 9. Implementation Steps

1. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `deletePlan(planId: string, userId: string): Promise<boolean>`.
   - The function will execute the delete query and return `true` if a record was deleted, `false` otherwise.
2. **Implement the API Endpoint**:
   - In `src/pages/api/plans/[id].ts`, add a handler for the `DELETE` method.
   - The handler will call the service and return a `204` or `404` status code based on the result.
3. **Testing**:
   - Add unit tests for the `deletePlan` service method.
   - Add integration tests for the endpoint, covering successful deletion, attempting to delete a non-existent plan (404), and attempting to delete another user's plan (404).
