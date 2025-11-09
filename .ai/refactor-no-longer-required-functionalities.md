# Plan: Refactor Plan Editing Functionality

This document outlines the plan to replace the "Rebuild Day" feature with more granular controls for editing a generated travel plan. The new functionality will allow users to add, edit, and delete individual activities within their plan.

The process is divided into two main phases:
1.  **Clean-up**: Removing the existing "Rebuild Day" functionality from the codebase and documentation.
2.  **Implementation**: Introducing the new features for adding, editing, and deleting plan items.

---

## Part 1: Clean-up of "Rebuild Day" Feature

### 1.1. Documentation Update

-   **Task**: Update `prd.md` to reflect the deprecation of the "Rebuild Day" feature.
    -   **Action**: Locate user stories US-040 (`Tytuł: Usuwanie punktu z planu`) and US-041 (`Tytuł: Przebudowa dnia (bez zużycia limitu)`). Mark them as deprecated by commenting them out and adding a note about the new direction.
-   **Task**: Update `ui-plan.md` to remove references to the "Rebuild Day" journey.
    -   **Action**: In "Mapa podróży użytkownika", remove step 7, which describes using "Przebuduj dzień".
    -   **Action**: In the "Widok Szczegółów Planu" section, remove mentions of "przebudowa dnia".
-   **Task**: Update `api-plan.md` to remove the "Rebuild Day" endpoint.
    -   **Action**: Remove the `#### Rebuild Day` section, which describes the `POST /plans/{id}/days/{date}/rebuild` endpoint.

### 1.2. Backend Clean-up

-   **Task**: Identify and remove the "Rebuild Day" API endpoint implementation.
    -   **Action**: Search the codebase for the implementation of the `/plans/{id}/days/{date}/rebuild` endpoint, which is likely located within the `src/pages/api/plans/` directory.
    -   **Action**: Delete the corresponding file and handler for this route.
-   **Task**: Remove any related service logic for the rebuild functionality.
    -   **Action**: Review `src/lib/services/plan.service.ts` for any methods related to rebuilding a plan day and remove them to avoid dead code.

### 1.3. Frontend Clean-up

-   **Task**: Remove the "Rebuild Day" button and associated UI elements from the plan details view.
    -   **Action**: Edit `src/components/GeneratedPlanView.tsx` (or its subcomponents) to remove the button and any related visual components that trigger the rebuild action.
-   **Task**: Remove client-side state management and logic for rebuilding a day.
    -   **Action**: Edit the `src/hooks/usePlanDetails.ts` hook to remove state variables and functions that were responsible for handling the rebuild feature's logic and API calls.

---

## Part 2: Implementation of New Editing Features

### 2.1. Documentation Update

-   **Task**: Create new user stories in `prd.md` for the new functionality.
    -   **Action**: Write a new user story for adding a custom activity to a generated plan.
    -   **Action**: Write a new user story for editing an existing activity in a generated plan.
    -   **Action**: Rewrite the user story for deleting an item (previously US-040) to reflect the simplified flow without a subsequent rebuild step.
-   **Task**: Update `api-plan.md` with new endpoints for adding and editing plan items.
    -   **Action**: Define a new endpoint `POST /plans/{id}/days/{date}/items` for adding an activity. Specify its request body (e.g., `time`, `title`, `description`, `location`, `category`).
    -   **Action**: Define a new endpoint `PATCH /plans/{id}/days/{date}/items/{itemId}` for updating an activity. Specify its request body.
    -   **Action**: Review the existing `DELETE /plans/{id}/days/{date}/items/{itemId}` endpoint to ensure it aligns with the new requirements.
-   **Task**: Update `ui-plan.md` to describe the new UI and user flow for plan editing.
    -   **Action**: In the "Widok Szczegółów Planu" section, describe the new UI components for inline editing, adding, and deleting items from the timeline.
    -   **Action**: Update the "Mapa podróży użytkownika" to include the new, more direct editing steps.

### 2.2. Backend Implementation

-   **Task**: Implement the new API endpoints for adding and editing plan items.
    -   **Action**: Create the necessary API route handlers under `src/pages/api/plans/[id]/days/[date]/items/` to manage `POST` requests for creation and `PATCH` requests on `[itemId]` for updates.
-   **Task**: Implement the corresponding business logic in the `plan.service.ts`.
    -   **Action**: Add new methods to `src/lib/services/plan.service.ts`:
        -   `addActivityToPlanDay(planId, date, activityData)`
        -   `updateActivityInPlanDay(planId, date, itemId, activityData)`
    -   **Action**: Ensure these methods safely handle the modification of the `generated_content` JSONB field.

### 2.3. Frontend Implementation

-   **Task**: Design and implement the new UI for interactive plan editing.
    -   **Action**: In the component responsible for rendering the plan's timeline (e.g., `GeneratedPlanView.tsx`):
        -   Add "Delete" and "Edit" icon buttons to each plan item.
        -   Include an "Add activity" button within each day's schedule.
-   **Task**: Implement a form/modal for adding and editing activities.
    -   **Action**: Create a reusable `ActivityForm.tsx` component.
    -   **Action**: Use a `Dialog` or `Sheet` component from `shadcn/ui` to present the form when a user adds or edits an activity.
-   **Task**: Implement the client-side logic to support these new features.
    -   **Action**: In the `src/hooks/usePlanDetails.ts` hook:
        -   Manage the state for the add/edit modal (e.g., visibility, form data).
        -   Implement `handleAddActivity`, `handleUpdateActivity`, and `handleDeleteActivity` functions.
        -   These functions will call the new API endpoints, and should implement optimistic updates to provide a smooth user experience.
