# API Endpoint Implementation Plan: Get Feedback

## 1. Endpoint Overview
This endpoint retrieves the feedback submitted by the currently authenticated user for a specific plan.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans/{planId}/feedbacks`
- **URL Parameters**:
  - `planId` (string, required): The ID of the plan for which to retrieve feedback.
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `FeedbackDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the user's feedback object for the plan.
  ```json
  {
    "rating": "thumbs_up",
    "comment": "The generated plan was very helpful!",
    "updated_at": "2025-10-25T10:00:00Z"
  }
  ```
- **Error Response (`404 Not Found`)**: Returned if the plan doesn't exist for the user, or if no feedback has been submitted for this plan by the user.
  ```json
  { "error": "No feedback submitted for this plan." }
  ```

## 5. Data Flow
1. The client sends a `GET` request to `/api/plans/{planId}/feedbacks`.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[planId]/feedbacks/index.ts` receives the request.
4. The handler extracts `planId` from the URL and `userId` from the session.
5. The handler calls a `getFeedback(userId, planId)` function from `FeedbackService`.
6. `FeedbackService` first checks if the user owns the parent plan.
7. If so, it queries the `feedback` table for a record where `plan_id` matches `planId` AND `user_id` matches `userId`.
8. If a record is found, the service maps it to a `FeedbackDto` and returns it.
9. If no record is found, the service returns `null`.
10. The handler checks the result:
    - If a DTO is returned, it sends a `200 OK` response with the DTO in the body.
    - If `null` is returned, it sends a `404 Not Found` response.

## 6. Security Considerations
- **Authentication**: Requires a valid JWT.
- **Authorization**: The database query is filtered by both `planId` and `userId` from the session, ensuring users can only see their own feedback.
- **RLS**: A `SELECT` policy on the `feedback` table must enforce that `user_id = auth.uid()`.

## 7. Error Handling
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the parent plan doesn't exist, or if feedback for it hasn't been submitted by the user.
- **`500 Internal Server Error`**: For database errors.

## 8. Performance Considerations
- The query uses the composite primary key (`plan_id`, `user_id`), making it very efficient.

## 9. Implementation Steps
1. **Implement the Service**:
   - In `src/lib/services/feedback.service.ts`, implement `getFeedback(userId: string, planId: string): Promise<FeedbackDto | null>`.
2. **Implement the API Endpoint**:
   - In `src/pages/api/plans/[planId]/feedbacks/index.ts`, implement the `GET` handler.
3. **Testing**:
   - Add unit tests for the `getFeedback` service method.
   - Add integration tests for the endpoint, covering successfully fetching feedback, attempting to fetch non-existent feedback (404), and trying to get feedback for another user's plan (404).
