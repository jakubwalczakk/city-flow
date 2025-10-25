/**
 * A union type representing any valid JSON value.
 * This is used for the `generated_content` field in plans, which can have a flexible structure.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ############################################################################
// #                                   ENUMS                                  #
// ############################################################################

/**
 * Represents the possible ratings for user feedback on a plan.
 */
export type FeedbackRating = "thumbs_up" | "thumbs_down";

/**
 * Represents the lifecycle status of a travel plan.
 * - `draft`: The initial state of a plan, created by the user.
 * - `generated`: The plan has been processed by the AI.
 * - `archived`: The plan is no longer active.
 */
export type PlanStatus = "draft" | "generated" | "archived";

/**
 * Represents the desired pace of travel for a user's itinerary.
 */
export type TravelPace = "slow" | "moderate" | "intensive";

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
  start_date: string | null;
  end_date: string | null;
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
  start_date: string | null;
  end_date: string | null;
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
 */
export type CreatePlanCommand = {
  name: string;
  destination: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
};

/**
 * Command model for updating an existing plan. All fields are optional.
 * Corresponds to the request body of `PATCH /plans/{id}`.
 */
export type UpdatePlanCommand = {
  name?: string;
  notes?: string | null;
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
  event_duration: number;
  description?: string | null;
};

/**
 * Command model for updating an existing fixed point. All fields are optional.
 * Corresponds to the request body of `PATCH /plans/{planId}/fixed-points/{id}`.
 */
export type UpdateFixedPointCommand = {
  location?: string;
  event_at?: string;
  event_duration?: number;
  description?: string | null;
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
