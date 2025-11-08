import { z } from "zod";

/**
 * Schema for validating plan creation requests.
 * Ensures that all required fields are present and properly formatted.
 * Note: start_date and end_date are required and must be in ISO 8601 datetime format.
 */
export const createPlanSchema = z
  .object({
    name: z.string({ required_error: "Name is required." }).min(1, {
      message: "Name cannot be empty.",
    }),
    destination: z
      .string({ required_error: "Destination is required." })
      .min(1, { message: "Destination cannot be empty." }),
    start_date: z
      .string({ required_error: "Start date is required." })
      .datetime({ message: "Start date must be a valid datetime." }),
    end_date: z
      .string({ required_error: "End date is required." })
      .datetime({ message: "End date must be a valid datetime." }),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // end_date must be after or equal to start_date
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be equal to or after start date.",
      path: ["end_date"],
    }
  );

/**
 * Schema for validating query parameters for listing plans.
 * Ensures pagination, filtering, and sorting parameters are valid.
 * 
 * Uses `statuses` parameter for filtering by status (supports single or multiple values).
 */
export const listPlansQuerySchema = z.object({
  statuses: z.preprocess(
    (val) => {
      // Handle null or undefined
      if (!val) return undefined;
      
      // If it's a string with commas, split it
      if (typeof val === "string" && val.includes(",")) {
        return val.split(",").map(s => s.trim());
      }
      
      // Otherwise return as-is (single value as array)
      if (typeof val === "string") {
        return [val];
      }
      
      return val;
    },
    z.array(z.enum(["draft", "generated", "archived"])).optional()
  ),
  sort_by: z.enum(["created_at", "name"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce
    .number()
    .int()
    .min(1, { message: "Limit must be at least 1." })
    .max(100, { message: "Limit cannot exceed 100." })
    .default(20),
  offset: z.coerce
    .number()
    .int()
    .min(0, { message: "Offset must be non-negative." })
    .default(0),
});

/**
 * Schema for validating basic info step in the create plan form (client-side).
 * Uses Date objects instead of strings for easier form handling.
 * Note: start_date and end_date are required fields.
 */
export const basicInfoSchema = z
  .object({
    name: z.string().min(1, "Plan name is required"),
    destination: z.string().min(1, "Destination is required"),
    start_date: z.date({ required_error: "Start date is required" }),
    end_date: z.date({ required_error: "End date is required" }),
    notes: z.string(),
  })
  .refine(
    (data) => {
      return data.end_date >= data.start_date;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    }
  );

/**
 * Schema for validating fixed point form (client-side).
 */
export const fixedPointSchema = z.object({
  location: z.string().min(1, "Location is required"),
  event_at: z.string().min(1, "Date and time is required"),
  event_duration: z
    .number()
    .positive("Duration must be a positive number.")
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for validating plan update requests.
 * Ensures that all fields are properly formatted.
 */
export const updatePlanSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").optional(),
  notes: z.string().optional().nullable(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type FixedPointFormData = z.infer<typeof fixedPointSchema>;
