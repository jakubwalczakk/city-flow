/*
 * Migration: Add JSONB validation for generated_content column
 * 
 * Purpose: Ensure generated_content follows the expected schema structure
 * 
 * Tables affected: plans (adds CHECK constraint)
 * 
 * Special notes:
 * - Validates structure but allows flexibility for AI-generated content
 * - Can be disabled if validation becomes too restrictive
 * - Does NOT validate every field (balance between safety and flexibility)
 * 
 * Design decision:
 * - Validates required top-level structure (days array)
 * - Validates item types are within allowed values
 * - Does NOT enforce all optional fields (allows AI to evolve)
 * - This is a "reasonable validation" approach, not strict schema enforcement
 */

-- Create validation function for generated_content JSONB structure
CREATE OR REPLACE FUNCTION validate_generated_content(content JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow NULL (plan hasn't been generated yet)
    IF content IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check that 'days' array exists and is an array
    IF NOT (content ? 'days' AND jsonb_typeof(content->'days') = 'array') THEN
        RETURN FALSE;
    END IF;
    
    -- Check that each day has a 'date' and 'items' array
    -- This uses a LATERAL join pattern to validate array elements
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(content->'days') AS day
        WHERE NOT (
            day ? 'date' 
            AND day ? 'items'
            AND jsonb_typeof(day->'items') = 'array'
        )
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check that each item has required fields and valid type
    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(content->'days') AS day,
             jsonb_array_elements(day->'items') AS item
        WHERE NOT (
            item ? 'id'
            AND item ? 'type'
            AND item ? 'title'
            -- Validate that type is one of allowed values
            AND item->>'type' IN ('activity', 'meal', 'transport')
        )
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check that modifications and warnings are arrays (if present)
    IF content ? 'modifications' AND jsonb_typeof(content->'modifications') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    IF content ? 'warnings' AND jsonb_typeof(content->'warnings') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- All validations passed
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_generated_content IS 'Validates the structure of generated_content JSONB column in plans table';

-- Add CHECK constraint to plans table
-- Note: This constraint will be checked on INSERT and UPDATE
ALTER TABLE plans 
ADD CONSTRAINT check_generated_content_structure 
CHECK (validate_generated_content(generated_content));

COMMENT ON CONSTRAINT check_generated_content_structure ON plans IS 
'Ensures generated_content follows expected schema: days array with items, valid item types (activity/meal/transport)';

/*
 * Example valid structure:
 * {
 *   "days": [
 *     {
 *       "date": "2025-05-15",
 *       "items": [
 *         {
 *           "id": "123e4567-e89b-12d3-a456-426614174000",
 *           "type": "activity",
 *           "title": "Koloseum",
 *           "time": "09:00",
 *           "description": "Wizyta w starożytnym amfiteatrze",
 *           "location": "Piazza del Colosseo, 1",
 *           "estimated_price": "16 EUR",
 *           "estimated_duration": "2 godziny",
 *           "notes": "Sprawdź godziny otwarcia"
 *         }
 *       ]
 *     }
 *   ],
 *   "modifications": ["Usunięto Muzeum X"],
 *   "warnings": ["Sprawdź godziny otwarcia"]
 * }
 *
 * To disable this constraint (if needed):
 * ALTER TABLE plans DROP CONSTRAINT check_generated_content_structure;
 *
 * To re-enable:
 * ALTER TABLE plans ADD CONSTRAINT check_generated_content_structure 
 * CHECK (validate_generated_content(generated_content));
 */

