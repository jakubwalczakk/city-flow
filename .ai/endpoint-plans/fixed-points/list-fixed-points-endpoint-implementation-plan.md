# API Endpoint Implementation Plan: List Fixed Points

## 1. Endpoint Overview
This endpoint retrieves a list of all fixed points (e.g., flight or hotel bookings) associated with a specific travel plan for the authenticated user.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans/{planId}/fixed-points`
- **URL Parameters**:
  - `planId` (string, required): The ID of the plan for which to list fixed points.
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `FixedPointDto[]` (an array of `FixedPointDto`) from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns an array of fixed point objects. The array will be empty if no fixed points exist.
  ```json
  [
    {
      "id": "uuid",
      "plan_id": "uuid-plan-1",
      "location": "Colosseum",
      "event_at": "2025-11-11T09:00:00Z",
      "event_duration": 180,
      "description": "Pre-booked tickets"
    }
  ]
  ```
- **Error Response (`404 Not Found`)**: Returned if the parent plan does not exist or does not belong to the user.

## 5. Data Flow
1. The client sends a `GET` request to `/api/plans/{planId}/fixed-points`.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/[planId]/fixed-points/index.ts` receives the request.
4. The handler extracts `planId` from the URL and `userId` from the session.
5. The handler first verifies that the user has access to the parent plan (a quick `SELECT` on the `plans` table where `id` is `planId` and `user_id` is `userId`). If not, it returns `404`.
6. The handler calls a `getFixedPointsForPlan(planId)` function from a new `FixedPointService`.
7. `FixedPointService` queries the `fixed_points` table for all records where `plan_id` matches the `planId` from the URL.
8. The service maps the database rows to an array of `FixedPointDto` objects and returns it.
9. The handler sends a `200 OK` response with the array of fixed points.

## 6. Security Considerations
- **Authentication**: Requires a valid JWT.
- **Authorization**: Access is two-tiered. First, the endpoint must verify that the user owns the parent `plan` resource. Only then should it attempt to fetch the `fixed_points` sub-resource. This prevents leaking information about whether a plan exists or not. RLS on both `plans` and `fixed_points` tables provides the underlying database-level security.

## 7. Error Handling
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan is not found for the authenticated user.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations
- The query for fixed points will be based on `plan_id`. It is crucial that the `plan_id` column in the `fixed_points` table has an index to ensure fast lookups.

## 9. Implementation Steps
1. **Create Service**:
   - Create a new file `src/lib/services/fixed-point.service.ts`.
   - Implement an async function `getFixedPointsForPlan(planId: string): Promise<FixedPointDto[]>`.
2. **Implement API Endpoint**:
   - Create the file `src/pages/api/plans/[planId]/fixed-points/index.ts`.
   - Implement the `GET` handler.
   - It will first call `planService` to check for parent plan access.
   - Then, it will call the new `fixedPointService.getFixedPointsForPlan` to get the data.
   - It will return the data or an appropriate error.
3. **Testing**:
   - Add unit tests for the `FixedPointService`.
   - Add integration tests for the endpoint, covering success cases, cases with no fixed points, and attempts to access fixed points of a plan the user does not own (should be 404).
