# API Endpoint Implementation Plan: Create Plan

## 1. Endpoint Overview
This endpoint allows authenticated users to create a new travel plan. The newly created plan is saved in the `draft` state and is associated with the account of the user who created it.

## 2. Request Details
- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans`
- **Parameters**: None
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
- **Error Response (`400 Bad Request`)**: Returns a JSON object with a validation error message.

## 5. Data Flow
1. The client sends a `POST` request to `/api/plans` with a body containing the plan data.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/index.ts` receives the request.
4. The handler validates the request body using a Zod schema based on `CreatePlanCommand`.
5. After successful validation, the handler retrieves the `user_id` from the user's session.
6. The handler calls a `createPlan(data, userId)` function from a `PlanService`.
7. `PlanService` creates a plan object, setting the `status` to `draft` and assigning the `user_id`.
8. `PlanService` uses the Supabase client to insert a new record into the `plans` table.
9. The database returns the created record.
10. `PlanService` maps the record to a `PlanDetailsDto` and returns it to the handler.
11. The handler sends a `201 Created` response with the plan DTO in the response body.

## 6. Security Considerations
- **Authentication**: Access to the endpoint is restricted to authenticated users.
- **Authorization**: The `user_id` is retrieved from the session token, not the request body.
- **Data Validation**: A Zod schema will ensure all incoming data conforms to the expected format.
- **Row Level Security (RLS)**: RLS policies in Supabase must be enabled for the `plans` table to ensure an `INSERT` operation is only allowed when the `user_id` of the new row equals `auth.uid()`.

## 7. Error Handling
- **`400 Bad Request`**: Returned when the request body validation fails.
- **`401 Unauthorized`**: Returned by the middleware when the user is not authenticated.
- **`500 Internal Server Error`**: Returned for unexpected server-side errors.

## 8. Performance Considerations
- The `INSERT` operation is efficient. No performance issues are anticipated.
- The `user_id` column should be indexed.

## 9. Implementation Steps
1. **Create Validation Schema**:
   - Create `src/lib/schemas/plan.schema.ts`.
   - Define a Zod schema for `CreatePlanCommand`.
2. **Implement the Service**:
   - Create `src/lib/services/plan.service.ts`.
   - Implement `createPlan(data: CreatePlanCommand, userId: string): Promise<PlanDetailsDto>`.
3. **Implement the API Endpoint**:
   - Create `src/pages/api/plans/index.ts`.
   - Implement the handler for the `POST` method, including validation and service call.
4. **Testing**:
   - Add unit tests for the `PlanService`.
   - Add integration tests for the API endpoint.
