# API Endpoint Implementation Plan: Update Fixed Point

## 1. Endpoint Overview
This endpoint allows an authenticated user to update an existing fixed point associated with one of their plans. This is a partial update.

## 2. Request Details
- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/plans/{planId}/fixed-points/{id}`
- **URL Parameters**:
  - `planId` (string, required): The ID of the parent plan.
  - `id` (string, required): The ID of the fixed point to update.
- **Request Body**: A JSON object compliant with the `UpdateFixedPointCommand` structure.
  ```json
  {
    "event_duration": 210
  }
  ```

## 3. Types Used
- **Command Model (Request)**: `UpdateFixedPointCommand` from `src/types.ts`.
- **DTO (Response)**: `FixedPointDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the complete, updated fixed point object.
- **Error Response (`400 Bad Request`)**: For an invalid request body.
- **Error Response (`404 Not Found`)**: If the plan or the fixed point does not exist for the user.

## 5. Data Flow
1. The client sends a `PATCH` request to the specific fixed point URL.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[planId]/fixed-points/[id].ts` receives the request.
4. The handler validates the request body using a Zod schema for `UpdateFixedPointCommand`.
5. The handler extracts `planId` and `fixedPointId` from the URL, and `userId` from the session.
6. The handler calls `updateFixedPoint(userId, planId, fixedPointId, data)` from `FixedPointService`.
7. `FixedPointService` first performs a `SELECT` to verify the user owns the parent plan. If not, it returns `null` early.
8. If ownership is confirmed, the service constructs a Supabase `update` query for the `fixed_points` table, targeting the row where `id` matches `fixedPointId` and `plan_id` matches `planId`.
9. If the update is successful, the service returns the updated fixed point as a `FixedPointDto`. If no row is updated, it returns `null`.
10. The handler returns a `200 OK` response or a `404 Not Found` response based on the service's result.

## 6. Security Considerations
- **Authentication**: Requires a valid JWT.
- **Authorization**: The service logic must ensure the fixed point being updated belongs to a plan owned by the authenticated user. The `UPDATE` query's `WHERE` clause (`id = ? AND plan_id = ?`) combined with an initial check on the plan's ownership provides strong protection.
- **RLS**: An `UPDATE` policy on `fixed_points` should verify ownership via a `JOIN` to the `plans` table.
- **Input Validation**: The request body is strictly validated.

## 7. Error Handling
- **`400 Bad Request`**: For invalid request body data.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan or the specific fixed point is not found.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations
- The `UPDATE` query targets a row by its primary key, which is highly efficient.

## 9. Implementation Steps
1. **Create Validation Schema**:
   - In `src/lib/schemas/fixed-point.schema.ts`, define a Zod schema for `UpdateFixedPointCommand`.
2. **Implement the Service**:
   - In `src/lib/services/fixed-point.service.ts`, implement `updateFixedPoint(userId: string, planId: string, fixedPointId: string, data: UpdateFixedPointCommand): Promise<FixedPointDto | null>`.
3. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans/[planId]/fixed-points/[id].ts`.
   - Implement the `PATCH` handler, which will manage validation, service calls, and responses.
4. **Testing**:
   - Add unit tests for the `updateFixedPoint` service method.
   - Add integration tests for the endpoint, covering success, validation errors, and attempts to update a fixed point on another user's plan.
