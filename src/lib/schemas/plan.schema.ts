import { z } from "zod";

/**
 * Schema for validating plan creation requests.
 * Ensures that all required fields are present and properly formatted.
 */
export const createPlanSchema = z
  .object({
    name: z.string({ required_error: "Name is required." }).min(1, {
      message: "Name cannot be empty.",
    }),
    destination: z
      .string({ required_error: "Destination is required." })
      .min(1, { message: "Destination cannot be empty." }),
    start_date: z.string().datetime().optional().nullable(),
    end_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // If both dates are provided, end_date must be after start_date
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date must be equal to or after start date.",
      path: ["end_date"],
    }
  );
