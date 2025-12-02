# API Endpoint Implementation Plan: List Plans

## 1. Endpoint Overview

This endpoint retrieves a paginated list of all travel plans for the authenticated user. It supports filtering by status and sorting by various fields.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans`
- **Query Parameters**:
  - `status` (string, optional): Filter by plan status. Accepts `draft`, `generated`, or `archived`.
  - `sort_by` (string, optional): Field to sort by (e.g., `created_at`, `name`). Default: `created_at`.
  - `order` (string, optional): Sort order. Accepts `asc` or `desc`. Default: `desc`.
  - `limit` (integer, optional): Number of results per page. Default: `20`, Max: `100`.
  - `offset` (integer, optional): Result offset for pagination. Default: `0`.
- **Request Body**: None

## 3. Types Used

- **DTO (Response)**: `PaginatedPlansDto`, `PlanListItemDto` from `src/types.ts`.

## 4. Response Details

- **Success Response (`200 OK`)**: Returns a paginated list of plans.
  ```json
  {
    "data": [
      {
        "id": "uuid-plan-1",
        "name": "Weekend in Rome",
        "destination": "Rome, Italy",
        "start_date": "2025-11-10",
        "end_date": "2025-11-12",
        "status": "generated",
        "created_at": "2025-10-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 20,
      "offset": 0
    }
  }
  ```
- **Error Response (`400 Bad Request`)**: Returned if query parameters fail validation.

## 5. Data Flow

1. The client sends a `GET` request to `/api/plans` with optional query parameters.
2. Astro middleware verifies the user's authentication token.
3. The API handler in `src/pages/api/plans/index.ts` receives the request.
4. The handler validates the query parameters using a Zod schema.
5. The handler calls a `getPlans(userId, queryParams)` function from `PlanService`.
6. `PlanService` constructs a Supabase query to the `plans` table.
   - It fetches the total count of matching records for the `pagination.total` field.
   - It applies filters (`.eq('user_id', ...)`, `.eq('status', ...)` if provided).
   - It applies sorting (`.order(...)`).
   - It applies pagination (`.range(offset, offset + limit - 1)`).
7. The service maps the resulting database rows to `PlanListItemDto` objects.
8. The service returns a `PaginatedPlansDto` object containing the data and pagination info.
9. The handler sends a `200 OK` response with the paginated data.

## 6. Security Considerations

- **Authentication**: Endpoint is protected and requires a valid JWT.
- **Authorization**: The query is strictly filtered by the `user_id` from the session token, ensuring users only see their own plans. RLS policies provide a second layer of defense.
- **Input Validation**: Query parameters are validated to prevent invalid database queries and ensure values are within acceptable ranges (e.g., `limit`).

## 7. Error Handling

- **`400 Bad Request`**: Returned for invalid query parameters (e.g., `limit=200`, `status=unknown`).
- **`401 Unauthorized`**: Returned by middleware if the user is not authenticated.
- **`500 Internal Server Error`**: Returned for unexpected server-side errors.

## 8. Performance Considerations

- Proper indexing on the `plans` table is crucial for performance. An index should exist on `(user_id, status)` and `(user_id, created_at)`.
- The `limit` parameter is capped to prevent excessively large queries.
- Fetching the total count and the data in separate queries is a common and acceptable pattern for pagination.

## 9. Implementation Steps

1. **Create Validation Schema**:
   - In `src/lib/schemas/plan.schema.ts`, define a Zod schema for the query parameters of the list endpoint.
2. **Implement the Service**:
   - In `src/lib/services/plan.service.ts`, implement `getPlans(userId: string, params: ValidatedQueryParams): Promise<PaginatedPlansDto>`.
   - This function will handle the database logic for filtering, sorting, pagination, and counting.
3. **Implement the API Endpoint**:
   - In `src/pages/api/plans/index.ts`, implement the handler for the `GET` method.
   - It should parse and validate query parameters, call the service, and return the response.
4. **Testing**:
   - Add unit tests for the `PlanService` to verify query construction.
   - Add integration tests for the endpoint, testing various combinations of filters, sorting, and pagination.
