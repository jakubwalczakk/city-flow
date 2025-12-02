# Refactor Implementation Summary

This document summarizes the implementation of the refactored plan editing functionality, replacing the "Rebuild Day" feature with more granular controls for managing plan activities.

## Completed Tasks

### Part 1: Clean-up (Completed)

#### 1.1. Documentation Updates

- ✅ Updated `prd.md` to replace "Rebuild Day" user stories with new add/edit/delete activity stories (US-040, US-041, US-042)
- ✅ Updated `ui-plan.md` to reflect new UI flow for plan editing
- ✅ Updated `api-plan.md` to replace rebuild endpoint with add/edit/delete endpoints

#### 1.2. Backend Clean-up

- ✅ Confirmed no "Rebuild Day" API endpoint existed in the codebase
- ✅ Confirmed no rebuild logic existed in `plan.service.ts`

#### 1.3. Frontend Clean-up

- ✅ Confirmed no "Rebuild Day" UI components existed in the codebase
- ✅ Confirmed no rebuild state management existed in hooks

### Part 2: Implementation (Completed)

#### 2.1. Type Definitions

**File**: `src/types.ts`

- ✅ Added `AddActivityCommand` type for adding new activities
- ✅ Added `UpdateActivityCommand` type for updating existing activities

#### 2.2. Backend Service Layer

**File**: `src/lib/services/plan.service.ts`

- ✅ Implemented `addActivityToPlanDay()` - Adds a new activity to a specific day
- ✅ Implemented `updateActivityInPlanDay()` - Updates an existing activity
- ✅ Implemented `deleteActivityFromPlanDay()` - Deletes an activity from a day
- ✅ All methods properly handle the `generated_content` JSONB field
- ✅ Activities are automatically sorted by time after add/update operations

#### 2.3. API Endpoints

**Files**:

- `src/pages/api/plans/[planId]/days/[date]/items.ts`
- `src/pages/api/plans/[planId]/days/[date]/items/[itemId].ts`

Implemented endpoints:

- ✅ `POST /api/plans/{planId}/days/{date}/items` - Add activity
- ✅ `PATCH /api/plans/{planId}/days/{date}/items/{itemId}` - Update activity
- ✅ `DELETE /api/plans/{planId}/days/{date}/items/{itemId}` - Delete activity

All endpoints include:

- Request body validation using Zod schemas
- Proper error handling
- Authentication via Supabase client from middleware

#### 2.4. Frontend Components

**File**: `src/components/ActivityForm.tsx` (NEW)

- ✅ Modal dialog form for adding/editing activities
- ✅ Fields: title, time, category, location, description, duration, estimated cost
- ✅ Supports both "add" and "edit" modes
- ✅ Form validation (title and category are required)
- ✅ Auto-resets when opened with new data

**File**: `src/components/EventTimeline.tsx` (UPDATED)

- ✅ Added dropdown menu with edit/delete actions for each activity
- ✅ Added confirmation dialog for delete action
- ✅ Optional `onEdit` and `onDelete` callback props
- ✅ Uses lucide-react icons (Pencil, Trash2, MoreVertical)

**File**: `src/components/GeneratedPlanView.tsx` (UPDATED)

- ✅ Added "Add Activity" button for each day
- ✅ Passes activity management callbacks to EventTimeline
- ✅ Optional callback props: `onAddActivity`, `onEditActivity`, `onDeleteActivity`

**File**: `src/components/PlanDetailsView.tsx` (UPDATED)

- ✅ Manages ActivityForm dialog state
- ✅ Connects activity management functions from `usePlanDetails` hook to UI
- ✅ Handles add/edit/delete operations with proper error handling
- ✅ Shows user-friendly error messages via alerts

#### 2.5. Custom Hook

**File**: `src/hooks/usePlanDetails.ts` (UPDATED)

- ✅ Added `addActivity()` method
- ✅ Added `updateActivity()` method
- ✅ Added `deleteActivity()` method
- ✅ All methods update local state optimistically after successful API calls
- ✅ Proper error handling and type conversions

#### 2.6. Dependencies

- ✅ Installed `uuid` package for generating unique activity IDs
- ✅ Added `select` component from shadcn/ui for category selection

## Technical Implementation Details

### Data Flow

1. **Adding an Activity**:
   - User clicks "Add Activity" button → Opens ActivityForm in "add" mode
   - User fills form and submits → Calls `addActivity()` from hook
   - Hook sends POST request to API → API calls service method
   - Service generates UUID, adds activity to day, sorts by time
   - Updated plan returned → Hook updates local state → UI re-renders

2. **Editing an Activity**:
   - User clicks edit icon → Opens ActivityForm in "edit" mode with pre-filled data
   - User modifies fields and submits → Calls `updateActivity()` from hook
   - Hook sends PATCH request to API → API calls service method
   - Service updates activity fields, re-sorts if time changed
   - Updated plan returned → Hook updates local state → UI re-renders

3. **Deleting an Activity**:
   - User clicks delete icon → Shows confirmation dialog
   - User confirms → Calls `deleteActivity()` from hook
   - Hook sends DELETE request to API → API calls service method
   - Service filters out activity from day's items array
   - Updated plan returned → Hook updates local state → UI re-renders

### Key Design Decisions

1. **No Limit Consumption**: Activity management operations (add/edit/delete) do not consume the user's monthly generation limit, as specified in the updated PRD.

2. **Automatic Sorting**: Activities are automatically sorted by time after add/update operations to maintain chronological order.

3. **Optimistic Updates**: The hook updates local state immediately after successful API calls for a responsive UI.

4. **Validation**: Both client-side (React form) and server-side (Zod schemas) validation ensure data integrity.

5. **User Feedback**: Clear error messages and confirmation dialogs provide good UX.

## Files Modified

### Documentation

- `.ai/prd.md`
- `.ai/ui-plan.md`
- `.ai/api-plan.md`

### Backend

- `src/types.ts`
- `src/lib/services/plan.service.ts`
- `src/pages/api/plans/[planId]/days/[date]/items.ts` (NEW)
- `src/pages/api/plans/[planId]/days/[date]/items/[itemId].ts` (NEW)

### Frontend

- `src/components/ActivityForm.tsx` (NEW)
- `src/components/EventTimeline.tsx`
- `src/components/GeneratedPlanView.tsx`
- `src/components/PlanDetailsView.tsx`
- `src/hooks/usePlanDetails.ts`
- `src/components/ui/select.tsx` (NEW - from shadcn/ui)

### Dependencies

- `package.json` (added uuid)

## Testing Recommendations

1. **Manual Testing**:
   - Create a plan and generate it
   - Add a custom activity to a day
   - Edit an existing activity (both AI-generated and user-added)
   - Delete an activity
   - Verify activities are sorted by time
   - Test form validation (required fields)
   - Test error handling (network errors, invalid data)

2. **Edge Cases to Test**:
   - Adding activity without time (should work, placed at end)
   - Editing activity to change time (should re-sort)
   - Deleting all activities from a day
   - Concurrent edits (multiple browser tabs)
   - Very long activity descriptions/titles

## Future Enhancements (Not Implemented)

- Drag-and-drop reordering of activities
- Bulk operations (delete multiple activities)
- Undo/redo functionality
- Activity templates or favorites
- Copy activity to another day
- Export individual day to calendar format

## Notes

- All implementation follows the coding practices defined in `.ai/prd.md`
- Error handling uses early returns and guard clauses
- TypeScript types ensure type safety throughout the stack
- Components follow React best practices (hooks, functional components)
- No linter errors in any modified files
