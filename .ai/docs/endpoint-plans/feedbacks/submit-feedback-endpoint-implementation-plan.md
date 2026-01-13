# API Endpoint Implementation Plan: Submit Feedback

## 1. Endpoint Overview

This endpoint allows an authenticated user to submit feedback for a specific plan. Since a user can only provide one feedback per plan, this operation functions as an "upsert": it creates the feedback if it doesn't exist or updates it if it already does.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/plans/{planId}/feedbacks`
- **URL Parameters**:
  - `planId` (string, required): The ID of the plan to which the feedback is being submitted.
- **Request Body**: A JSON object compliant with the `SubmitFeedbackCommand` structure.
  ```json
  {
    "rating": "thumbs_up",
    "comment": "The generated plan was very helpful!"
  }
  ```

## 3. Types Used

- **Command Model (Request)**: `SubmitFeedbackCommand` from `src/types.ts`.
- **DTO (Response)**: `FeedbackDto` from `src/types.ts`.

## 4. Response Details

- **Success Response (`201 Created` or `200 OK`)**: Returns the created or updated feedback object. The status code is `201` if the feedback was newly created and `200` if it was updated.
- **Error Response (`400 Bad Request`)**: For an invalid request body.
- **Error Response (`404 Not Found`)**: If the parent plan does not exist or does not belong to the user.
- **Error Response (`409 Conflict`)**: If feedback is submitted for a plan that is still in the `draft` state.

## 5. Data Flow

1. The client sends a `POST` request to `/api/plans/{planId}/feedbacks`.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[planId]/feedbacks/index.ts` receives the request.
4. The handler validates the request body using a Zod schema for `SubmitFeedbackCommand`.
5. The handler extracts `planId` from the URL and `userId` from the session.
6. The handler calls a `submitFeedback(userId, planId, data)` function from a new `FeedbackService`.
7. `FeedbackService` first verifies that the user owns the parent plan and that its status is not `draft`.
8. If the checks pass, the service performs a Supabase `upsert` operation on the `feedback` table. The composite primary key for the upsert will be (`plan_id`, `user_id`).
9. The database creates or updates the record.
10. The service maps the resulting database record to a `FeedbackDto` and returns it, along with a flag indicating whether the record was created or updated.
11. The handler returns a `201 Created` or `200 OK` response with the feedback DTO.

## 6. Security Considerations

- **Authentication**: Requires a valid JWT.
- **Authorization**: The service must verify ownership of the parent plan before creating/updating feedback.
- **RLS**: The `feedback` table needs policies that allow `INSERT` and `UPDATE` only when the `user_id` matches `auth.uid()` and the user also owns the associated `plan_id`.
- **Input Validation**: The `rating` field must be validated to be one of the allowed enum values.

## 7. Error Handling

- **`400 Bad Request`**: For invalid request body data.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan is not found.
- **`409 Conflict`**: If the target plan is in `draft` status.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations

- The `upsert` operation on a primary key is very efficient. No performance issues are expected.

## 9. Implementation Steps

1. **Create Validation Schema**:
   - Create a new file `src/lib/schemas/feedback.schema.ts`.
   - Define a Zod schema for `SubmitFeedbackCommand`.
2. **Create Service**:
   - Create a new file `src/lib/services/feedback.service.ts`.
   - Implement `submitFeedback(userId: string, planId: string, data: SubmitFeedbackCommand): Promise<{ feedback: FeedbackDto, created: boolean }>`.
3. **Implement API Endpoint**:
   - Create the file `src/pages/api/plans/[planId]/feedbacks/index.ts`.
   - Implement the `POST` handler, which will manage validation, service calls, and returning the correct `200`/`201` status code.
4. **Testing**:
   - Add unit tests for the `submitFeedback` service method.
   - Add integration tests for the endpoint, covering creating feedback for the first time, updating existing feedback, and handling all error conditions.
