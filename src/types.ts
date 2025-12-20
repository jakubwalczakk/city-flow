/**
 * A union type representing any valid JSON value.
 * This is used for the `generated_content` field in plans, which can have a flexible structure.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ############################################################################
// #                                   ENUMS                                  #
// ############################################################################

/**
 * Represents the possible ratings for user feedback on a plan.
 */
export type FeedbackRating = 'thumbs_up' | 'thumbs_down';

/**
 * Represents the lifecycle status of a travel plan.
 * - `draft`: The initial state of a plan, created by the user.
 * - `generated`: The plan has been processed by the AI.
 * - `archived`: The plan is no longer active.
 */
export type PlanStatus = 'draft' | 'generated' | 'archived';

/**
 * Represents the desired pace of travel for a user's itinerary.
 */
export type TravelPace = 'slow' | 'moderate' | 'intensive';

// ############################################################################
// #                            DATA TRANSFER OBJECTS                         #
// ############################################################################

// ============================================================================
//                                   Profile
// ============================================================================

/**
 * DTO for retrieving a user's profile.
 * Corresponds to the response of `GET /profile`.
 */
export type ProfileDto = {
  id: string;
  preferences: string[] | null;
  travel_pace: TravelPace | null;
  generations_remaining: number;
  onboarding_completed: boolean;
  updated_at: string;
};

// ============================================================================
//                                    Plans
// ============================================================================

/**
 * DTO for a plan item in a list.
 * This is a summarized version of a plan for display in lists.
 * Corresponds to items in the response of `GET /plans`.
 */
export type PlanListItemDto = {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: PlanStatus;
  created_at: string;
};

/**
 * DTO for the paginated list of plans.
 * Corresponds to the response of `GET /plans`.
 */
export type PaginatedPlansDto = {
  data: PlanListItemDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

/**
 * DTO for the full details of a single plan, including generated content.
 * Corresponds to the response of `GET /plans/{id}`.
 */
export type PlanDetailsDto = {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  status: PlanStatus;
  generated_content: Json | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
//                                 Fixed Points
// ============================================================================

/**
 * DTO for a fixed point (e.g., a flight or hotel booking) associated with a plan.
 * Corresponds to the response of `GET /plans/{planId}/fixed-points`.
 */
export type FixedPointDto = {
  id: string;
  plan_id: string;
  location: string;
  event_at: string;
  event_duration: number;
  description: string | null;
};

// ============================================================================
//                                   Feedback
// ============================================================================

/**
 * DTO for feedback submitted for a plan.
 * Corresponds to the response of `GET /plans/{planId}/feedback`.
 */
export type FeedbackDto = {
  rating: FeedbackRating;
  comment: string | null;
  updated_at: string;
};

// ############################################################################
// #                               COMMAND MODELS                             #
// ############################################################################

// ============================================================================
//                                   Profile
// ============================================================================

/**
 * Command model for updating a user's profile. All fields are optional.
 * Corresponds to the request body of `PATCH /profile`.
 */
export type UpdateProfileCommand = {
  preferences?: string[];
  travel_pace?: TravelPace;
  onboarding_completed?: boolean;
};

// ============================================================================
//                                    Plans
// ============================================================================

/**
 * Command model for creating a new draft plan.
 * Corresponds to the request body of `POST /plans`.
 * Note: start_date and end_date are required and must include both date and time in ISO 8601 format.
 */
export type CreatePlanCommand = {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes?: string | null;
};

/**
 * Command model for updating an existing plan. All fields are optional.
 * Corresponds to the request body of `PATCH /plans/{id}`.
 */
export type UpdatePlanCommand = {
  name?: string;
  start_date?: string;
  end_date?: string;
  notes?: string | null;
  status?: PlanStatus;
  generated_content?: Json | null;
};

// ============================================================================
//                                 Fixed Points
// ============================================================================

/**
 * Command model for adding a new fixed point to a plan.
 * Corresponds to the request body of `POST /plans/{planId}/fixed-points`.
 */
export type CreateFixedPointCommand = {
  location: string;
  event_at: string;
  event_duration: number | null;
  description?: string | null;
};

/**
 * Command model for updating an existing fixed point. All fields are optional.
 * Corresponds to the request body of `PATCH /plans/{planId}/fixed-points/{id}`.
 */
export type UpdateFixedPointCommand = {
  location?: string;
  event_at?: string;
  event_duration?: number | null;
  description?: string | null;
};

/**
 * Form item for fixed points - includes optional ID for existing points.
 * Used in the form to track which points need to be created vs updated.
 */
export type FixedPointFormItem = CreateFixedPointCommand & {
  id?: string;
};

// ============================================================================
//                                   Feedback
// ============================================================================

/**
 * Command model for submitting feedback for a plan.
 * Corresponds to the request body of `POST /plans/{planId}/feedback`.
 */
export type SubmitFeedbackCommand = {
  rating: FeedbackRating;
  comment?: string | null;
};

// ============================================================================
//                              Plan Activities
// ============================================================================

/**
 * Command model for adding a new activity to a plan day.
 * Corresponds to the request body of `POST /plans/{id}/days/{date}/items`.
 */
export type AddActivityCommand = {
  time?: string; // e.g., "14:30"
  title: string;
  description?: string;
  location?: string;
  duration?: number; // in minutes
  category: TimelineItemCategory;
  estimated_cost?: string; // e.g., "5-10 EUR"
};

/**
 * Command model for updating an existing activity in a plan. All fields are optional.
 * Corresponds to the request body of `PATCH /plans/{id}/days/{date}/items/{itemId}`.
 */
export type UpdateActivityCommand = {
  time?: string;
  title?: string;
  description?: string;
  location?: string;
  duration?: number;
  category?: TimelineItemCategory;
  estimated_cost?: string;
};

// ############################################################################
// #                              VIEW MODELS                                 #
// ############################################################################

/**
 * View model representing the complete state of the Plans Dashboard.
 * Used in the PlansDashboard component to manage UI state.
 */
export type PlansDashboardViewModel = {
  isLoading: boolean;
  error: string | null;
  plansData: PaginatedPlansDto | null;
  activeTab: 'my-plans' | 'history';
  currentPage: number;
};

/**
 * ViewModel for the new plan creation form.
 * Holds the entire state of the multi-step form on the client-side.
 * Note: Dates are stored as Date objects on the client for easier manipulation.
 */
export type NewPlanViewModel = {
  basicInfo: {
    name: string;
    destination: string;
    start_date: Date;
    end_date: Date;
    notes: string;
  };
  fixedPoints: FixedPointFormItem[];
};

/**
 * ViewModel for the plan details view.
 * Manages the entire client-side state of the view.
 */
export type PlanDetailsViewModel = {
  isLoading: boolean;
  error: string | null;
  plan: PlanDetailsDto | null;
};

/**
 * Represents the category of a timeline item.
 * Used for displaying icons and filtering.
 */
export type TimelineItemCategory =
  | 'history'
  | 'food'
  | 'sport'
  | 'nature'
  | 'culture'
  | 'transport'
  | 'accommodation'
  | 'other';

/**
 * Type definition for a single item/event in the generated plan's timeline.
 * Corresponds to the database schema validation for generated_content.
 */
export type TimelineItem = {
  id: string; // UUID
  type: 'activity' | 'meal' | 'transport'; // Required by database validation
  time?: string; // e.g., "09:00" (optional)
  category: TimelineItemCategory; // For UI display and filtering
  title: string; // Required by database validation
  description?: string;
  location?: string;
  estimated_price?: string;
  estimated_duration?: string;
  notes?: string;
};

/**
 * Type definition for a single day in the generated plan.
 * Corresponds to the database schema validation for generated_content.
 */
export type DayPlan = {
  date: string; // e.g., "2025-12-24"
  items: TimelineItem[]; // Changed from 'events' to 'items' to match database schema
};

/**
 * ViewModel for the structured generated_content from a plan.
 * Corresponds to the database schema validation for generated_content.
 */
export type GeneratedContentViewModel = {
  summary: string; // Add the summary field
  currency: string; // ISO 4217 currency code
  days: DayPlan[];
  modifications?: string[]; // Optional: AI modifications made to the plan
  warnings?: string[]; // Optional: Warnings for the user
};

/**
 * @deprecated Use TimelineItem instead. This type is kept for backward compatibility.
 */
export type TimelineEvent = TimelineItem;

// ============================================================================
//                                   Profile View
// ============================================================================

/**
 * ViewModel for the profile view.
 * Manages the state of the entire profile view, including data, loading, and error states.
 */
export type ProfileViewModel = {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  profile: ProfileDto | null;
};

/**
 * Type for travel preference keys (stored in database).
 */
export type TravelPreference =
  | 'art_museums'
  | 'local_food'
  | 'active_recreation'
  | 'nature_parks'
  | 'nightlife'
  | 'history_culture';

/**
 * List of available travel preferences (database keys).
 * Used in the PreferencesSelector component.
 */
export const AVAILABLE_PREFERENCES: TravelPreference[] = [
  'art_museums',
  'local_food',
  'active_recreation',
  'nature_parks',
  'nightlife',
  'history_culture',
];

/**
 * Human-readable Polish labels for travel preferences.
 * Maps database keys to display labels.
 */
export const PREFERENCE_LABELS: Record<TravelPreference, string> = {
  art_museums: 'Sztuka i Muzea',
  local_food: 'Lokalne Jedzenie',
  active_recreation: 'Aktywny Wypoczynek',
  nature_parks: 'Natura i Parki',
  nightlife: 'Życie Nocne',
  history_culture: 'Historia i Kultura',
};

/**
 * Human-readable labels for TravelPace values.
 * Used in the TravelPaceSelector component.
 */
export const TRAVEL_PACE_LABELS: Record<TravelPace, string> = {
  slow: 'Wolne',
  moderate: 'Umiarkowane',
  intensive: 'Intensywne',
};
