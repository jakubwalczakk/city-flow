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
