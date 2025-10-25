# API Endpoint Implementation Plan: Delete Generated Item from Plan

## 1. Endpoint Overview
This endpoint allows a user to remove a single generated item (like an activity or meal) from the `generated_content` JSON object of a specific plan for a specific day.

## 2. Request Details
- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/plans/{id}/days/{date}/items/{itemId}`
- **URL Parameters**:
  - `id` (string, required): The ID of the plan.
  - `date` (string, required): The specific date of the item to remove (e.g., "2026-03-05").
  - `itemId` (string, required): The unique ID of the item within the `generated_content` to remove.
- **Request Body**: None

## 3. Types Used
- **DTO (Response)**: `PlanDetailsDto` from `src/types.ts`.

## 4. Response Details
- **Success Response (`200 OK`)**: Returns the entire updated plan object after the item has been removed.
- **Error Response (`404 Not Found`)**: Returned if the plan, date, or item ID does not exist.
- **Error Response (`409 Conflict`)**: Returned if the plan is not in the `generated` state.

## 5. Data Flow
1. The client sends a `DELETE` request to the specified URL.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[id]/days/[date]/items/[itemId].ts` receives the request.
4. The handler extracts `planId`, `date`, and `itemId` from the URL, and `userId` from the session.
5. The handler calls a `deleteGeneratedItem(planId, userId, date, itemId)` function in `PlanService`.
6. Inside `PlanService`:
   a. Retrieve the specified plan, ensuring it belongs to the user and its status is `generated`. If not, throw an appropriate error (`404` or `409`).
   b. Parse the `generated_content` JSONB field.
   c. Find the specified date within the content. If not found, throw a `404` error.
   d. Find the item with the matching `itemId` within that date's array of items. If not found, throw a `404` error.
   e. Remove the item object from the array.
   f. Update the plan's `generated_content` field in the database with the modified JSON object.
7. The service returns the full, updated `PlanDetailsDto`.
8. The handler returns a `200 OK` response with the updated plan.

## 6. Security Considerations
- **Authentication & Authorization**: Standard checks ensure a user can only modify their own plans.
- **Data Integrity**: The core logic involves safely reading, modifying, and writing back a JSONB field. The operation must handle cases where the structure is not as expected, though the schema validation on `generated_content` should prevent this.
- **Path Traversal/Validation**: URL parameters (`date`, `itemId`) should be treated as untrusted input, although their use in this context (finding keys in a JSON object) has low security risk.

## 7. Error Handling
- **`400 Bad Request`**: If the `date` parameter is not in a valid date format.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the plan, the date within the plan's content, or the item ID within the date's content cannot be found.
- **`409 Conflict`**: If the plan's status is not `generated`.
- **`500 Internal Server Error`**: For database update errors or JSON parsing failures.

## 8. Performance Considerations
- The operation involves a `SELECT`, in-memory JSON manipulation, and an `UPDATE`. For a single plan, this is very fast. The performance depends on the size of the `generated_content` JSON, but it is not expected to be a bottleneck.
- The `UPDATE` query targets a row by its primary key.

## 9. Implementation Steps
1. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `deleteGeneratedItem(planId: string, userId: string, date: string, itemId: string): Promise<PlanDetailsDto>`.
   - This function will contain the logic to fetch the plan, manipulate the JSONB `generated_content`, and save it back to the database. It should throw specific, catchable errors for not-found cases.
2. **Implement the API Endpoint**:
   - Create the nested file structure and file `src/pages/api/plans/[id]/days/[date]/items/[itemId].ts`.
   - Implement the `DELETE` handler. It will parse URL parameters, call the service, and handle the different error types to return appropriate status codes.
3. **Testing**:
   - Add unit tests for the `deleteGeneratedItem` service method, testing successful deletion, and all failure cases (plan not found, date not found, item not found).
   - Add integration tests for the endpoint.
