# API Endpoint Implementation Plan: Delete Fixed Point

## 1. Endpoint Overview

This endpoint allows an authenticated user to permanently delete a fixed point from one of their travel plans.

## 2. Request Details

- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/plans/{planId}/fixed-points/{id}`
- **URL Parameters**:
  - `planId` (string, required): The ID of the parent plan.
  - `id` (string, required): The ID of the fixed point to delete.
- **Request Body**: None

## 3. Types Used

- None.

## 4. Response Details

- **Success Response (`204 No Content`)**: Returned on successful deletion, with no response body.
- **Error Response (`404 Not Found`)**: If the plan or fixed point does not exist for the user.

## 5. Data Flow

1. The client sends a `DELETE` request to the specific fixed point URL.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[planId]/fixed-points/[id].ts` receives the request.
4. The handler extracts `planId` and `fixedPointId` from the URL, and `userId` from the session.
5. The handler calls `deleteFixedPoint(userId, planId, fixedPointId)` from `FixedPointService`.
6. `FixedPointService` first verifies that the user owns the parent plan.
7. If ownership is confirmed, the service constructs a Supabase `delete` query for `fixed_points`, targeting the row where `id` is `fixedPointId` and `plan_id` is `planId`.
8. The service executes the query and checks the `count` of deleted rows. It returns `true` if `count` is 1, `false` otherwise.
9. The handler checks the boolean result from the service:
   - If `true`, it returns a `204 No Content` response.
   - If `false`, it returns a `404 Not Found` response.

## 6. Security Considerations

- **Authentication**: Requires a valid JWT.
- **Authorization**: The service must verify ownership of the parent plan before attempting to delete the sub-resource.
- **RLS**: A `DELETE` policy on `fixed_points` must verify ownership through a `JOIN` to the `plans` table.

## 7. Error Handling

- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan or the specific fixed point is not found for the user.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations

- The `DELETE` operation targets a row by its primary key, making it very fast.

## 9. Implementation Steps

1. **Implement the Service**:
   - In `src/lib/services/fixed-point.service.ts`, implement `deleteFixedPoint(userId: string, planId: string, fixedPointId: string): Promise<boolean>`.
2. **Implement the API Endpoint**:
   - In `src/pages/api/plans/[planId]/fixed-points/[id].ts`, add a handler for the `DELETE` method.
3. **Testing**:
   - Add unit tests for the `deleteFixedPoint` service method.
   - Add integration tests for the endpoint, covering successful deletion and attempts to delete a non-existent or unauthorized fixed point.
