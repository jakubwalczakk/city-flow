import { z } from "zod";

/**
 * Schema for validating feedback submission.
 */
export const submitFeedbackSchema = z.object({
  rating: z.enum(["thumbs_up", "thumbs_down"], {
    required_error: "Rating is required.",
  }),
  comment: z.string().optional().nullable(),
});

export type SubmitFeedbackFormData = z.infer<typeof submitFeedbackSchema>;
