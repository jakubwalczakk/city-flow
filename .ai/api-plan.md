# REST API Plan

This document outlines the REST API for the CityFlow application, based on the provided database schema, product requirements, and tech stack. The API is designed to be consumed by a frontend application built with Astro and React. All endpoints are prefixed with `/api`.

## 1. Resources

- **Profiles**: Represents the user's application-specific settings. Corresponds to the `profiles` table. Managed as a singleton resource per authenticated user.
- **Plans**: The core resource representing a travel plan, from a preliminary draft to a fully generated itinerary. Corresponds to the `plans` table.
- **FixedPoints**: A sub-resource of a Plan, representing a non-negotiable event like a flight or hotel reservation. Corresponds to the `fixed_points` table.
- **Feedbacks**: A sub-resource of a Plan, representing user feedback. Corresponds to the `feedback` table.

## 2. Endpoints

### 2.1. Profiles

The profile is a singleton resource for the currently authenticated user. The user is identified via the JWT token.

#### Get Profile

- **Method**: `GET`
- **URL**: `/profiles`
- **Description**: Retrieves the profile of the currently authenticated user.
- **Request Body**: None
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "id": "uuid",
      "preferences": ["Art & Museums", "Local Food"],
      "travel_pace": "moderate",
      "generations_remaining": 5,
      "onboarding_completed": true,
      "updated_at": "2025-10-25T10:00:00Z"
    }
    ```
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Content**: `{ "error": "Profile not found." }` (For new users who haven't completed onboarding)

#### Update Profile

- **Method**: `PATCH`
- **URL**: `/profiles`
- **Description**: Updates the profile of the currently authenticated user. Also used for the initial onboarding setup.
- **Request Body**:
  ```json
  {
    "preferences": ["Art & Museums", "Local Food", "Nightlife"],
    "travel_pace": "intensive",
    "onboarding_completed": true
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated profile object (same structure as `GET /profiles`).
- **Error Response**:
  - **Code**: `400 Bad Request`
  - **Content**: `{ "error": "Validation failed.", "details": { "preferences": "Must have between 2 and 5 items." } }`

---

### 2.2. Plans

#### List Plans

- **Method**: `GET`
- **URL**: `/plans`
- **Description**: Retrieves a list of all plans for the authenticated user.
- **Query Parameters**:
  - `status` (string, optional): Filter by plan status. Accepts `draft`, `generated`, or `archived`.
  - `sort_by` (string, optional): Field to sort by. e.g., `created_at`.
  - `order` (string, optional): `asc` or `desc`. Default is `desc`.
  - `limit` (int, optional): Number of results per page. Default `20`.
  - `offset` (int, optional): Result offset for pagination. Default `0`.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
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

#### Create Plan (Draft)

- **Method**: `POST`
- **URL**: `/plans`
- **Description**: Creates a new plan in the `draft` state (i.e., a user's note).
- **Request Body**:
  ```json
  {
    "name": "Trip to Berlin",
    "destination": "Berlin, Germany",
    "start_date": "2026-03-05",
    "end_date": "2026-03-08",
    "notes": "See the Brandenburg Gate and eat currywurst."
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**: The full plan object, including the new `id`.

#### Get Plan

- **Method**: `GET`
- **URL**: `/plans/{id}`
- **Description**: Retrieves a single plan by its ID.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The full plan object, including `generated_content` if available.
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Content**: `{ "error": "Plan not found." }`

#### Update Plan

- **Method**: `PATCH`
- **URL**: `/plans/{id}`
- **Description**: Updates details of a plan, such as its name or notes.
- **Request Body**:
  ```json
  {
    "name": "Romantic weekend in Rome with Ann",
    "notes": "Updated notes: Must visit the Vatican."
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated full plan object.

#### Delete Plan

- **Method**: `DELETE`
- **URL**: `/plans/{id}`
- **Description**: Permanently deletes a plan.
- **Success Response**:
  - **Code**: `204 No Content`

### 2.3. Plan Actions (Business Logic)

#### Generate Plan

- **Method**: `POST`
- **URL**: `/plans/{id}/generate`
- **Description**: Triggers the AI generation process for a draft plan. This is a potentially long-running, synchronous request.
- **Request Body**: None
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The full plan object with the `generated_content` field populated and `status` updated to `generated`.
- **Error Response**:
  - **Code**: `402 Payment Required`
  - **Content**: `{ "error": "You have exhausted your monthly generation limit." }`
  - **Code**: `500 Internal Server Error`
  - **Content**: `{ "error": "An error occurred during plan generation. Your limit has not been affected." }`

#### Delete Generated Item from Plan

- **Method**: `DELETE`
- **URL**: `/plans/{id}/days/{date}/items/{itemId}`
- **Description**: Removes a single item (activity, meal, etc.) from the `generated_content` of a plan for a specific day.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated plan object.

#### Rebuild Day

- **Method**: `POST`
- **URL**: `/plans/{id}/days/{date}/rebuild`
- **Description**: Reruns the AI optimization for a specific day after items have been removed. Does not consume a generation credit.
- **Request Body**: None
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated plan object with re-optimized `generated_content` for that day.

#### Export Plan to PDF

- **Method**: `GET`
- **URL**: `/plans/{id}/export?format=pdf`
- **Description**: Generates and returns a PDF representation of the plan.
- **Success Response**:
  - **Code**: `200 OK`
  - **Headers**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="plan-name.pdf"`
  - **Content**: The binary PDF file.

---

### 2.4. Fixed Points (Sub-resource of Plan)

#### List Fixed Points

- **Method**: `GET`
- **URL**: `/plans/{planId}/fixed-points`
- **Description**: Gets all fixed points associated with a specific plan.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    [
      {
        "id": "uuid",
        "plan_id": "uuid-plan-1",
        "location": "Colosseum",
        "event_at": "2025-11-11T09:00:00Z",
        "event_duration": 180, // in minutes
        "description": "Pre-booked tickets"
      }
    ]
    ```

#### Add Fixed Point

- **Method**: `POST`
- **URL**: `/plans/{planId}/fixed-points`
- **Description**: Adds a new fixed point to a plan.
- **Request Body**:
  ```json
  {
    "location": "Vatican Museum",
    "event_at": "2025-11-12T11:00:00Z",
    "event_duration": 240,
    "description": "Guided tour"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**: The newly created fixed point object.

#### Update Fixed Point

- **Method**: `PATCH`
- **URL**: `/plans/{planId}/fixed-points/{id}`
- **Description**: Updates an existing fixed point.
- **Request Body**:
  ```json
  {
    "event_duration": 210
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated fixed point object.

#### Delete Fixed Point

- **Method**: `DELETE`
- **URL**: `/plans/{planId}/fixed-points/{id}`
- **Description**: Deletes a fixed point.
- **Success Response**:
  - **Code**: `204 No Content`

---

### 2.5. Feedbacks (Sub-resource of Plan)

#### Submit Feedback

- **Method**: `POST`
- **URL**: `/plans/{planId}/feedbacks`
- **Description**: Submits feedback for a plan. Since a user can only give one feedback per plan, this acts as an "upsert" (create or update).
- **Request Body**:
  ```json
  {
    "rating": "thumbs_up",
    "comment": "The generated plan was very helpful!"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created` (if new) or `200 OK` (if updating)
  - **Content**: The created/updated feedback object.

#### Get Feedback

- **Method**: `GET`
- **URL**: `/plans/{planId}/feedbacks`
- **Description**: Retrieves the authenticated user's feedback for a specific plan.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "rating": "thumbs_up",
      "comment": "The generated plan was very helpful!",
      "updated_at": "2025-10-25T10:00:00Z"
    }
    ```
- **Error Response**:
    - **Code**: `404 Not Found`
    - **Content**: `{ "error": "No feedback submitted for this plan." }`

## 3. Authentication and Authorization

- **Mechanism**: The API will use JSON Web Tokens (JWT) provided by Supabase Auth.
- **Implementation**:
  1. The client application authenticates the user via Supabase (e.g., email/password or OAuth).
  2. Supabase returns a JWT access token.
  3. The client must include this token in the `Authorization` header for all protected API requests: `Authorization: Bearer <SUPABASE_JWT>`.
- **Authorization**: All endpoints are protected and require a valid JWT. The API backend will rely on PostgreSQL's Row-Level Security (RLS) policies, which are configured to ensure users can only access and modify their own data. The user ID from the validated JWT will be used in database queries to enforce these policies.

## 4. Validation and Business Logic

- **Input Validation**: The API layer is responsible for validating all incoming request bodies and query parameters *before* executing business logic or database queries. This provides immediate, clear error feedback to the client.
- **Validation Rules**:
  - `profile.preferences`: Must be an array of strings, length between 2 and 5.
  - `profile.travel_pace`: Must be one of `slow`, `moderate`, `intensive`.
  - `plan.end_date`: Must be on or after `plan.start_date`.
  - `feedback.rating`: Must be `thumbs_up` or `thumbs_down`.
  - All required fields (e.g., `plan.destination`) must be present and non-empty.
- **Business Logic Implementation**:
  - **Generation Limits**: The `POST /plans/{id}/generate` endpoint will first query the `profiles.generations_remaining` count. If it is zero, it will return a `402 Payment Required` error. If greater than zero, it will proceed with generation and decrement the count within the same database transaction.
  - **AI Interaction**: The plan generation and day rebuilding endpoints will internally call the Openrouter.ai service, transforming the user's plan data and profile preferences into a suitable prompt.
  - **Archiving & Limit Resets**: These processes are handled by `pg_cron` jobs in the database and are not exposed via the API. The API will simply read the current state of the data (e.g., a plan's `archived` status or a profile's `generations_remaining` count).
