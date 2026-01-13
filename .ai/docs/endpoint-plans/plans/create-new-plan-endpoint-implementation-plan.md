# API Endpoint Implementation Plan: Create Plan

## 1. Endpoint Overview

This endpoint allows authenticated users to create a new travel plan. The newly created plan is saved in the `draft` state and is associated with the account of the user who created it.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans`
- **Parameters**:
  - **Required**: None in the URL.
  - **Optional**: None in the URL.
- **Request Body**: The request body must be a JSON object compliant with the `CreatePlanCommand` structure.

  ```json
  {
    "name": "Trip to Berlin",
    "destination": "Berlin, Germany",
    "start_date": "2026-03-05",
    "end_date": "2026-03-08",
    "notes": "See the Brandenburg Gate and eat currywurst."
  }
  ```

  - `name` and `destination` are required fields.

## 3. Types Used

- **Command Model (Request)**: `CreatePlanCommand` from `src/types.ts`
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`

## 4. Response Details

- **Success Response (`201 Created`)**: Returns the full object of the newly created plan, compliant with the `PlanDetailsDto` type.
  ```json
  {
    "id": "uuid-plan-2",
    "user_id": "uuid-user-1",
    "name": "Trip to Berlin",
    "destination": "Berlin, Germany",
    "start_date": "2026-03-05",
    "end_date": "2026-03-08",
    "notes": "See the Brandenburg Gate and eat currywurst.",
    "status": "draft",
    "generated_content": null,
    "created_at": "2025-10-25T12:00:00Z",
    "updated_at": "2025-10-25T12:00:00Z"
  }
  ```
- **Error Response**: Returns a JSON object with an error message.
  ```json
  {
    "error": "string"
  }
  ```

## 5. Data Flow

1. The client sends a `POST` request to `/api/plans` with a body containing the plan data.
2. Astro middleware verifies the user's authentication token using Supabase.
3. The API handler in `src/pages/api/plans.ts` receives the request.
4. The handler validates the request body using a Zod schema based on `CreatePlanCommand`.
5. After successful validation, the handler retrieves the `user_id` from the user's session (`Astro.locals.user.id`).
6. The handler calls the `createPlan(data, userId)` function from the newly created `PlanService`.
7. `PlanService` creates a plan object, setting the `status` to `draft` and assigning the `user_id`.
8. `PlanService` uses the Supabase client to insert a new record into the `plans` table.
9. The database returns the created record.
10. `PlanService` maps the record to a `PlanDetailsDto` and returns it to the handler.
11. The handler sends a `201 Created` response with the plan DTO in the response body.

## 6. Security Considerations

- **Authentication**: Access to the endpoint is restricted to authenticated users only. The Astro/Supabase middleware will reject all requests without a valid session.
- **Authorization**: The user ID (`user_id`) is retrieved from the session token, not from the request body, which prevents creating resources on behalf of other users.
- **Data Validation**: The Zod schema will ensure that all incoming data conforms to the expected format, protecting against errors and potential attacks (e.g., XSS, SQL Injection).
- **Row Level Security (RLS)**: RLS policies in Supabase must be enabled for the `plans` table to ensure that an `INSERT` operation is only allowed if the `user_id` of the new row is equal to `auth.uid()`.

## 7. Error Handling

- **`400 Bad Request`**: Returned when the request body validation fails (e.g., missing required fields, incorrect data types). The response will include a detailed validation error message.
- **`401 Unauthorized`**: Returned by the middleware when the user is not authenticated.
- **`500 Internal Server Error`**: Returned in case of an unexpected server-side error, e.g., a problem with the database connection. The error will be logged on the server.

## 8. Performance Considerations

- The `INSERT` operation is typically very efficient. No performance issues are anticipated.
- It should be ensured that the `user_id` column in the `plans` table is indexed to ensure fast queries in the future.
- The size of the returned object is small, so it will not negatively impact the response time.

## 9. Implementation Steps

1. **Create Validation Schema**:
   - Create the file `src/lib/schemas/plan.schema.ts`.
   - Define a Zod schema for `CreatePlanCommand`, including validation for types and required fields.
2. **Implement the Service**:
   - Create the file `src/lib/services/plan.service.ts`.
   - Implement the async function `createPlan(data: CreatePlanCommand, userId: string): Promise<PlanDetailsDto>`.
   - This function should communicate with Supabase to insert a new record into the `plans` table and return it.
3. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans.ts`.
   - Implement the handler for the `POST` method.
   - In the handler, get the user session and Supabase client from `Astro.locals`.
   - Check if the user is authenticated.
   - Validate the request body using the previously created Zod schema.
   - Call the `planService.createPlan` function.
   - Return a `201 Created` response on success or an appropriate error code on failure.
4. **Testing**:
   - Add unit tests for the `PlanService` logic.
   - Add integration tests for the API endpoint to verify the correctness of the entire flow, including validation and error handling.
