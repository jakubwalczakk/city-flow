# API Endpoint Implementation Plan: Add Fixed Point

## 1. Endpoint Overview

This endpoint allows an authenticated user to add a new fixed point to one of their existing travel plans.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans/{planId}/fixed-points`
- **URL Parameters**:
  - `planId` (string, required): The ID of the plan to which the fixed point will be added.
- **Request Body**: A JSON object compliant with the `CreateFixedPointCommand` structure.
  ```json
  {
    "location": "Vatican Museum",
    "event_at": "2025-11-12T11:00:00Z",
    "event_duration": 240,
    "description": "Guided tour"
  }
  ```

## 3. Types Used

- **Command Model (Request)**: `CreateFixedPointCommand` from `src/types.ts`.
- **DTO (Response)**: `FixedPointDto` from `src/types.ts`.

## 4. Response Details

- **Success Response (`201 Created`)**: Returns the newly created fixed point object.
- **Error Response (`400 Bad Request`)**: Returned for an invalid request body.
- **Error Response (`404 Not Found`)**: Returned if the parent plan does not exist or does not belong to the user.

## 5. Data Flow

1. The client sends a `POST` request to `/api/plans/{planId}/fixed-points` with the new fixed point data.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[planId]/fixed-points/index.ts` receives the request.
4. The handler validates the request body using a Zod schema for `CreateFixedPointCommand`.
5. The handler extracts `planId` from the URL and `userId` from the session.
6. The handler first verifies the user's ownership of the parent plan (e.g., via a call to `planService.getPlanById`).
7. If ownership is confirmed, the handler calls `addFixedPoint(planId, data)` from `FixedPointService`.
8. `FixedPointService` combines the `planId` with the request data and inserts a new record into the `fixed_points` table.
9. The service maps the newly created database record to a `FixedPointDto` and returns it.
10. The handler sends a `201 Created` response with the new fixed point object.

## 6. Security Considerations

- **Authentication**: Requires a valid JWT.
- **Authorization**: Ownership of the parent `plan` resource must be verified before the `INSERT` operation is performed.
- **RLS**: Policies on `fixed_points` should be set up to leverage a join with the `plans` table to check for ownership, allowing an `INSERT` only if the `plan`'s `user_id` matches `auth.uid()`.
- **Input Validation**: All fields in the request body must be strictly validated.

## 7. Error Handling

- **`400 Bad Request`**: For invalid request body data.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan is not found for the authenticated user.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations

- A simple `INSERT` operation, which is very fast.
- The `plan_id` column in `fixed_points` should be indexed.

## 9. Implementation Steps

1. **Create Validation Schema**:
   - Create a new file `src/lib/schemas/fixed-point.schema.ts`.
   - Define a Zod schema for `CreateFixedPointCommand`.
2. **Implement the Service**:
   - In `src/lib/services/fixed-point.service.ts`, implement `addFixedPoint(planId: string, data: CreateFixedPointCommand): Promise<FixedPointDto>`.
3. **Implement the API Endpoint**:
   - In `src/pages/api/plans/[planId]/fixed-points/index.ts`, add a handler for the `POST` method.
   - The handler will be responsible for validating the body, checking parent plan ownership, calling the service, and returning the `201 Created` response.
4. **Testing**:
   - Add unit tests for the `addFixedPoint` service method.
   - Add integration tests for the endpoint, including success cases, validation errors, and attempts to add a fixed point to another user's plan.
